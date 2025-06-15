const isFulfilled = <T>(
  result: PromiseSettledResult<T>,
): result is PromiseFulfilledResult<T> => result.status === 'fulfilled';
const getFulfilledValues = <T>(results: PromiseSettledResult<T>[]): T[] =>
  results.filter(isFulfilled).map((result) => result.value);
const isRejected = <T>(
  result: PromiseSettledResult<T>,
): result is PromiseRejectedResult => result.status === 'rejected';
const getRejectedReasons = <T>(results: PromiseSettledResult<T>[]): any[] =>
  results.filter(isRejected).map((result) => result.reason);

export const allSettled = async <T>(
  promises: Promise<T>[],
): Promise<{
  fulfilledValues: T[];
  rejectedReasons: any[];
}> => {
  const results = await Promise.allSettled(promises);
  return {
    fulfilledValues: getFulfilledValues(results),
    rejectedReasons: getRejectedReasons(results),
  };
};

/**
 * Used by {@link promiseAll} as the key for attaching other errors to the
 * error that is actually thrown.
 */
export const OTHER_ERRORS_KEY = Symbol('OTHER_ERRORS');

/**
 * Used by {@link promiseAll} to indicate where the top level error would appear
 * in the list of other errors. This is done to avoid a circular reference.
 */
const TOP_LEVEL_ERROR_PLACEHOLDER = '__TOP_LEVEL_ERROR_PLACEHOLDER';

/**
 * This is a cross between {@link Promise.all} and {@link Promise.allSettled}.
 * Like Promise.allSettled it will wait for all promises to resolve or reject.
 * However, it maintains most of the other observable behavior of Promise.all.
 * In particular it will reject with the first error from the list of promises.
 * Any remaining errors will be attached to the first error as an array of errors.
 *
 * See also {@link OTHER_ERRORS_KEY} and {@link TOP_LEVEL_ERROR_PLACEHOLDER}
 */
export const promiseAll = async <T extends readonly Promise<unknown>[] | []>(
  values: T,
): Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }> => {
  let firstRejection: unknown;
  const wrappedPromises = values.map((promise) =>
    promise.catch((err) => {
      if (firstRejection === undefined) {
        firstRejection = err;
      }
      throw err;
    }),
  ) as T;

  const results = (await Promise.allSettled(
    wrappedPromises,
  )) as PromiseSettledResult<unknown>[];
  const rejectedOnly = results.filter(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  );
  if (rejectedOnly.length > 0) {
    // firstRejection should always be set here, but just in case
    // fall back to the first rejection in the list
    const rejectionToPropogate: unknown =
      firstRejection ?? rejectedOnly[0].reason;
    if (
      typeof rejectionToPropogate === 'object' &&
      rejectionToPropogate !== null
    ) {
      // Add the other errors onto the first rejection if possible.
      // This is extremely hacky but should be safe.
      (rejectionToPropogate as any)[OTHER_ERRORS_KEY] = rejectedOnly.map(
        (rejection) => {
          // Prevent rejectionToPropogate from referencing itself
          if (rejection.reason === rejectionToPropogate) {
            return TOP_LEVEL_ERROR_PLACEHOLDER;
          }
          return rejection.reason;
        },
      );
    }
    throw rejectionToPropogate;
  }
  // At this point we know that all promises were fulfilled
  return results.map(
    (result) => (result as PromiseFulfilledResult<unknown>).value,
  ) as { -readonly [P in keyof T]: Awaited<T[P]> };
};
