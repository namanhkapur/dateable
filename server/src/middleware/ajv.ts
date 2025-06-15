import Ajv, { JSONSchemaType } from "ajv";
import addFormats from "ajv-formats";

const avjInstance = new Ajv();

addFormats(avjInstance, {
  mode: "fast",
  formats: ["date", "uuid", "time", "date-time"],
  keywords: true,
});

export type AjvT<T> = JSONSchemaType<T>;

export { avjInstance };
