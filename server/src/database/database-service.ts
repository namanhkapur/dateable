import { Mutex } from "async-mutex";
import { Knex } from "knex";
import _ from "lodash";
import {
  Constructor,
  DBError,
  Model,
  QueryBuilderType,
  TransactionOrKnex,
} from "objection";
import { BaseModel } from "./base-model";
import { JobService } from "../scheduler/job-service";
import { OneTimeJobInstance } from "../scheduler/one-time-job";
import assert from "../utils/assert-extensions";
import { Context } from "../config/context";
import { TestDbLockoutHelper } from "./test-db-lockout-helper";
import { logError } from "../utils/error-handler";
import { Logger } from "../config/rootLogger";

interface SharedDatabaseServiceData {
  queryComment: string;
  numQueriesRun: number;
  jobService: JobService;
  logger: Logger;
}

interface Transactable {
  transacting: (trx: Knex.Transaction) => this;
}

export class DatabaseService {
  private readonly knexAccessLock = new Mutex();
  private context: Context | null = null;
  private pendingJobs: OneTimeJobInstance<object>[] = [];
  private constructor(
    private readonly sharedData: SharedDatabaseServiceData,
    private readonly knex: TransactionOrKnex,
    private transactionId: number | undefined
  ) {}

  static create(logger: Logger): DatabaseService {
    return new DatabaseService(
      {
        queryComment: "",
        numQueriesRun: 0,
        jobService: JobService.getInstance(),
        logger,
      },
      Model.knex(),
      undefined
    );
  }

  async cloneForTransaction(
    newTransaction: Knex.Transaction
  ): Promise<DatabaseService> {
    assert(this.knexAccessLock.isLocked());
    const newDatabaseService = new DatabaseService(
      this.sharedData,
      newTransaction,
      this.transactionId
    );
    await newDatabaseService.setTransactionId();
    return newDatabaseService;
  }

  wrapQueryForTransaction = <
    T extends { then: PromiseLike<any>["then"] } & Transactable
  >(
    query: T
  ): T => {
    const originalThen = query.then.bind(query);
    query.then = (...args: any[]) =>
      this.knexAccessLock
        .runExclusive(async () => {
          /*
            If we are running in a transaction then the transaction needs to be attached.
            Once a top-level transaction is started, it essentially reserves a connection
            that will be used but all sub queries and transactions.

            If we are not in a transaction then the query will use a potentially new connection.
            for each query.
          */
          if (this.isInTransaction()) {
            void query.transacting(this.knex);
          }
          // eslint-disable-next-line @typescript-eslint/return-await
          return await originalThen();
        })
        // Chaining then must be done outside of the lock. Otherwise the lock would be held too long
        // and would block queries done in `then` like `convertToBackendModel`
        .then(...args);
    return query;
  };

  runInTransaction<T>(
    executeInTransaction: (context: Context) => Promise<T>
  ): Promise<T> {
    return this.knexAccessLock.runExclusive(async () => {
      const transaction = await Model.startTransaction(this.knex);
      try {
        const { result, jobs } = await this.runInSubContextWithTransaction(
          transaction,
          executeInTransaction
        );
        await transaction.commit();
        await this.handleJobsFromSubTransaction(jobs);
        return result;
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    });
  }

  private async runInSubContextWithTransaction<T>(
    transaction: Knex.Transaction,
    executeInTransaction: (context: Context) => Promise<T>
  ): Promise<{ result: T; jobs: OneTimeJobInstance<object>[] }> {
    const newContext = this.context!.cloneForTransaction(
      await this.cloneForTransaction(transaction)
    );
    const result = await executeInTransaction(newContext);
    const jobs = newContext.databaseService.pendingJobs;
    return { result, jobs };
  }

  rawQuery(
    sql: string,
    bindings?: Knex.RawBinding[] | Knex.ValueDict
  ): Knex.Raw<any> {
    return this.wrapQueryForTransaction(Model.knex().raw(sql, bindings ?? []));
  }

  knexQueryBuilder<T extends {} = any>(
    tableName: Knex.TableDescriptor
  ): Knex.QueryBuilder<any, T[]> {
    return this.wrapQueryForTransaction(Model.knex()(tableName));
  }

  _testBatchInsert(
    tableName: Knex.TableDescriptor,
    data: Readonly<Partial<Knex.MaybeRawRecord<any>>>[],
    chunkSize: number
  ): Knex.BatchInsertBuilder<any, any> {
    return this.wrapQueryForTransaction(
      Model.knex().batchInsert(tableName, data, chunkSize)
    );
  }

  query<M extends BaseModel>(
    modelClass: Constructor<M> & { query: typeof BaseModel.query },
    shouldLogError?: boolean | undefined
  ): QueryBuilderType<M> {
    TestDbLockoutHelper.assertDbQueriesAreAllowed();
    this.sharedData.numQueriesRun++;
    return this.wrapQueryForTransaction(
      modelClass
        .query()
        // A hint query is used by some dbs to suggest indexes to use. Postgres does not
        // use these so it is essentially just a comment. Unfortunately this only works
        // on SELECT queries for now.
        .onBuildKnex((knexBuilder) =>
          knexBuilder.hintComment(this.sharedData.queryComment)
        )
        .onError(async (error, _) => {
          if (error instanceof DBError && shouldLogError) {
            logError(
              this.sharedData.logger,
              error,
              `DBError ${error.name} in ${(modelClass as any).tableName ?? ""}`,
              {
                tableName: (modelClass as any)?.tableName,
                transactionId: this.transactionId,
              }
            );
          }
          throw error;
        })
    );
  }

  private async setTransactionId() {
    if (!this.isInTransaction() || !_.isNil(this.transactionId)) {
      // There is no transaction id outside of a transaction, and it does not change for subtransactions
      return;
    }
    const queryResult = await this.rawQuery(
      "select txid_current() as transaction_id"
    );
    this.transactionId = queryResult.rows[0].transaction_id;
  }

  get _testTransactionId(): number | undefined {
    return this.transactionId;
  }

  get numQueriesRun(): number {
    return this.sharedData.numQueriesRun;
  }

  isInTransaction(): boolean {
    return this.knex.isTransaction ?? false;
  }

  setContext(context: Context): void {
    assert.nil(this.context);
    this.context = context;
  }

  setControlData(controlName: string): void {
    this.sharedData.queryComment = `controlName:${controlName}`;
  }

  async enqueueJob(jobInstance: OneTimeJobInstance<object>) {
    await this.knexAccessLock.runExclusive(async () => {
      if (!this.isInTransaction()) {
        await this.sharedData.jobService.publishJob(jobInstance);
      } else {
        this.pendingJobs.push(jobInstance);
      }
    });
  }

  private async handleJobsFromSubTransaction(
    jobs: OneTimeJobInstance<object>[]
  ) {
    // This function must not throw any errors because it would cause a transaction to be rolled back
    // after it was already committed. This is because of how this method is called from `runInTransaction`
    // Therefore we log but swallow all errors, which is normally not a safe thing.
    try {
      if (!this.isInTransaction()) {
        // If we are no longer any a transaction then the jobs should be published immediately.
        for (const job of jobs) {
          await this.sharedData.jobService.publishJob(job);
        }
      } else {
        // Otherwise add them to the current list of jobs.
        // They will be published if this transaction succeeds or dropped if it fails
        this.pendingJobs.push(...jobs);
      }
    } catch (error) {
      logError(
        this.sharedData.logger,
        error,
        "Error thrown during job publishing. Will be ignored"
      );
    }
  }
}
