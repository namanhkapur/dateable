import path from 'path';
import dotenv from 'dotenv';
import { cleanEnv, str, bool, port, host } from 'envalid';

export type TsEnv = 'LOCAL' | 'STG' | 'PROD';

// Retrieve envfile specified in the Makefile
const envfile = process.env.ENVFILE || '.env.production';
const envFound = dotenv.config({
  path: path.resolve('./', envfile),
});
if (envFound.error) {
  throw new Error("Couldn't find .env file");
}

// Envvars should only be imported from this export
export const env = cleanEnv(
  process.env,
  {
    PORT: port(),
    HTTPS_PORT: port(),
    NODE_ENV: str({ choices: ['test', 'development', 'production'] }),
    POSTGRES_PASSWORD: str(),
    POSTGRES_USER: str(),
    POSTGRES_DB: str(),
    POSTGRES_CONTAINER_PORT: port(),
    POSTGRES_HOST_PORT: port(),
    KANEL_FLYWAY_URL: str(),
    FLYWAY_GROUP: bool(),
    RUN_JOBS: bool(),
    IS_TEST: bool(),
    AWS_REGION: str({ default: 'us-east-1' }),
    AWS_S3_BUCKET: str(),
    AWS_ACCESS_KEY_ID: str({ default: '' }),
    AWS_SECRET_ACCESS_KEY: str({ default: '' }),
    DB_HOST: host(),
  },
  {
    reporter: ({ errors }) => {
      const erroredEnvVars = Object.keys(errors);
      if (erroredEnvVars.length > 0) {
        throw new Error(
          `Env vars missing or invalid: ${erroredEnvVars.join(', ')}`,
        );
      }
    },
  },
);
