import { DefinedError } from "ajv";
import _ from "lodash";

import { Context } from "../config/context";
import { AjvT, avjInstance } from "../middleware/ajv";
import { badRequest, logError } from "../utils/error-handler";
import { Nilable } from "../utils/objects";

export const validator = <T>(
  context: Context,
  data: T,
  schema: Nilable<AjvT<T>>
): T => {
  if (_.isNil(schema)) return data;

  const validate = avjInstance.compile(schema);
  if (validate(data)) {
    return data;
  }

  for (const error of validate.errors as DefinedError[]) {
    logError(context.logger, error, "Route validation error");
  }

  const firstError = validate.errors && validate.errors[0];
  const path = firstError?.instancePath;
  throw badRequest(`${path ? `${path}: ` : ""}${firstError?.message!}`);
};

export default validator;
