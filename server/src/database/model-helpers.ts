import _ from 'lodash';
import { Context } from '../config/context';

/**
 * autoUpdatedTimeFields contains timestamp fields that are automatically
 * updated by the database.
 */
const autoUpdatedTimeFields = ['createdAt', 'lastModified'] as const;

export const convertToBackendModel =
  <D extends Object | null | undefined>() =>
  async (
    modelOrPromise: PromiseLike<D> | D,
  ): Promise<D extends null ? null : D extends undefined ? undefined : D> => {
    const model = await Promise.resolve(modelOrPromise);
    if (_.isNil(model)) {
      // This is safe to do as long as calls to this function are typed correctly.
      // i.e. If 'D' is nullable then returning null is allowed. But if D is
      // nonnullable then this case shouldn't happen. In practice it will since
      // we don't type-check properly everywhere, but this ends up just deferring
      // the null pointer error
      return model as any;
    }

    const cleanedObj: any = _.omit(model, autoUpdatedTimeFields);

    return cleanedObj;
  };

export const convertArrayToBackendModel =
  <D extends Object>() =>
  async (modelOrPromise: PromiseLike<D[]> | D[]): Promise<D[]> => {
    const models = await Promise.resolve(modelOrPromise);
    return (await Promise.all(
      models.map((model) => convertToBackendModel()(model)),
    )) as any;
  };

export const batchQuery = async <TInsert, TResponse>(
  context: Context,
  rows: TInsert[],
  processDelegate: (rows: TInsert[]) => Promise<TResponse[]>,
  chunkSize: number,
): Promise<TResponse[]> => {
  const response: TResponse[] = [];
  for (const chunkedRows of _.chunk(rows, chunkSize)) {
    const responseChunk = await processDelegate(chunkedRows);
    response.push(...responseChunk);
    context.logger.info(
      `Successfully batch processed ${chunkedRows.length} rows`,
    );
  }
  return response;
};
