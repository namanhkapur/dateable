import { v4, validate as v4Validate } from "uuid";

export type UUID = string & { readonly _: unique symbol };

export const UUID = (): UUID => v4() as UUID;

export const validate = (str: string): boolean => v4Validate(str);
