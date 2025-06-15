import assert from "assert";
import _ from "lodash";

declare module "assert" {
  function nil(
    actual: any,
    message?: string
  ): asserts actual is null | undefined;
  function notNil<T>(
    actual: T | null | undefined,
    message?: string
  ): asserts actual is T;
}

assert.nil = (
  actual: any,
  message?: string
): asserts actual is null | undefined => {
  if (!_.isNil(actual)) {
    throw new assert.AssertionError({ actual, message, operator: "isNil" });
  }
};

assert.notNil = <T>(
  actual: T | null | undefined,
  message?: string
): asserts actual is T => {
  if (_.isNil(actual)) {
    throw new assert.AssertionError({ actual, message, operator: "isNil" });
  }
};

export default assert;
