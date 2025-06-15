import { Logger, rootLogger } from "./rootLogger";
import { ControlType } from "../utils/controller";
import { DatabaseService } from "../database/database-service";
import { UUID } from "../utils/uuid";
import { pick } from "../utils/objects";

export interface ControlData {
  controllerName: string;
  controlName: string;
  controlType: ControlType;
}
export class Context {
  private _controlData: undefined | ControlData;

  private constructor(
    public readonly id: UUID,
    public readonly logger: Logger,
    public readonly databaseService: DatabaseService,
    private readonly _metadata: Record<string, any> = {}
  ) {
    this.addMetadata({ __id: this.id });
  }

  public setControlData(data: ControlData) {
    if (this._controlData) {
      this.logger.warn("setControlData called after data already set");
    }
    const formattedData = pick(
      data,
      "controlName",
      "controllerName",
      "controlType"
    );
    this._controlData = formattedData;
    this.addMetadata(formattedData);
    this.databaseService.setControlData(data.controlName);
  }

  public get controlData(): ControlData | undefined {
    return this._controlData;
  }

  public addMetadata(data: {}) {
    Object.assign(this._metadata, data);
    this.logger.defaultMeta = { logContext: this._metadata };
    // In theory you could add this metadata to the dd trace span. But
    // in practice the tags are not inherited by lower spans, so it is
    // not particularly useful. This metadata can be found on logs.
  }

  cloneForTransaction(newDatabaseService: DatabaseService): Context {
    const context = new Context(
      this.id,
      this.logger,
      newDatabaseService,
      this._metadata
    );
    newDatabaseService.setContext(context);
    return context;
  }

  static create(id: UUID = UUID()): Context {
    const logger = rootLogger.child({});
    const databaseService = DatabaseService.create(logger);
    const context = new Context(id, logger, databaseService);
    databaseService.setContext(context);
    return context;
  }

  /**
   * Use this to run code in an entirely new Context. This should be used rarely but is intended
   * to allow certain requests to issue sql statements that commit immediately without waiting on the main
   * request-level transaction to finish.
   *
   * Using this violates some of the assumptions built into our testing framework. If your tests call
   * functions that make use of this then you need to truncate the db at the end of every one of your tests.
   * See {@link db-session.test.ts} for an example.
   *
   * @param newContext Make sure to use the context that gets passed into your callback function. It is a different context
   * from the one used for the overall request.
   * @returns
   */
  static async dangerRunInNewContextTransaction<T>(
    originalContext: Context,
    executeInTransaction: (newContext: Context) => Promise<T>
  ): Promise<T> {
    const context = Context.create(originalContext.id);
    return context.databaseService.runInTransaction((context) =>
      executeInTransaction(context)
    );
  }
}
