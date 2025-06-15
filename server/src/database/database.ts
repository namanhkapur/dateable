import pg from 'pg';
import knexFactory, { Knex } from 'knex';
import { knexSnakeCaseMappers, Model } from 'objection';
import {
  ChronoField,
  DateTimeFormatterBuilder,
  Duration,
  LocalDate,
  LocalDateTime,
  LocalTime,
  nativeJs,
  Period,
  ZonedDateTime,
} from '@js-joda/core';
import '@js-joda/timezone';

import { DEFAULT_TIMEZONE } from '../utils/time';
import { rootLogger } from '../config/rootLogger';
import { env } from '../config/env';

export const pgConfig = {
  host: env.DB_HOST,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
  port: Number(env.POSTGRES_HOST_PORT),
};

const setupTypeParsersNew = async (connection: pg.Client) => {
  // pg client type does not have this function, but at runtime it does
  const connectionWithTypeSetter = connection as pg.Client & {
    setTypeParser: typeof pg.types.setTypeParser;
  };
  rootLogger.info('Setting up type parsers');
  // Convert longs (int8) to javascript numbers. This is safe until the number exceeds 2^53-1
  connectionWithTypeSetter.setTypeParser(
    pg.types.builtins.INT8,
    (value: string) => parseInt(value, 10),
  );

  // Converts numeric to a float. Not the most accurate thing since numeric supports
  // arbitrary precision. But shouldn't fail spectacularly and will be accurate in most
  // cases since the db value was also set from javascript.
  connectionWithTypeSetter.setTypeParser(
    pg.types.builtins.NUMERIC,
    'text',
    parseFloat,
  );

  connectionWithTypeSetter.setTypeParser(
    pg.types.builtins.DATE,
    (value: string) => LocalDate.parse(value),
  );
  connectionWithTypeSetter.setTypeParser(
    pg.types.builtins.TIME,
    (value: string) => {
      // Postgres rounds times greater than 23:59:59.999999 to 24:00:00, which is not parseable by LocalTime.
      // Convert these values manually back to LocalTime.MAX which is 23:59:59.999999999
      if (value === '24:00:00') {
        return LocalTime.MAX;
      }
      return LocalTime.parse(value);
    },
  );
  const psqlLocalDateTimeFormat = new DateTimeFormatterBuilder()
    .appendPattern('yyyy-MM-dd HH:mm:ss')
    .parseLenient()
    .appendFraction(ChronoField.MICRO_OF_SECOND, 0, 6, true)
    .toFormatter();
  connectionWithTypeSetter.setTypeParser(
    pg.types.builtins.TIMESTAMP,
    (value: string) => LocalDateTime.parse(value, psqlLocalDateTimeFormat),
  );

  connectionWithTypeSetter.setTypeParser(
    pg.types.builtins.TIMESTAMPTZ,
    (value: string) =>
      ZonedDateTime.from(nativeJs(new Date(value), DEFAULT_TIMEZONE)),
  );

  connectionWithTypeSetter.setTypeParser(
    pg.types.builtins.INTERVAL,
    (value: string) => {
      // if interval has a T it should be treat as time-based, and therefor a duration
      if (value.includes('T')) {
        return Duration.parse(value);
      }
      return Period.parse(value);
    },
  );

  rootLogger.info('Setting up enum array types');
  const enumArrayTypes = (
    await connection.query("SELECT typarray FROM pg_type WHERE typtype = 'e';")
  ).rows as { typarray: number }[];

  // Use the type parser of a text array
  const textArrayParser = pg.types.getTypeParser(
    // pg.types.TypeId does not include 1009
    1009 as any,
  );
  enumArrayTypes.forEach((arrayType) =>
    connectionWithTypeSetter.setTypeParser(arrayType.typarray, textArrayParser),
  );

  rootLogger.info('Finished setting up type parsers');
};

const setupTypeParsers = async () => {
  rootLogger.info('Setting up type parsers');
  // Convert longs (int8) to javascript numbers. This is safe until the number exceeds 2^53-1
  pg.types.setTypeParser(pg.types.builtins.INT8, (value: string) =>
    parseInt(value, 10),
  );

  // Converts numeric to a float. Not the most accurate thing since numeric supports
  // arbitrary precision. But shouldn't fail spectacularly and will be accurate in most
  // cases since the db value was also set from javascript.
  pg.types.setTypeParser(pg.types.builtins.NUMERIC, 'text', parseFloat);

  pg.types.setTypeParser(pg.types.builtins.DATE, (value: string) =>
    LocalDate.parse(value),
  );
  pg.types.setTypeParser(pg.types.builtins.TIME, (value: string) => {
    // Postgres rounds times greater than 23:59:59.999999 to 24:00:00, which is not parseable by LocalTime.
    // Convert these values manually back to LocalTime.MAX which is 23:59:59.999999999
    if (value === '24:00:00') {
      return LocalTime.MAX;
    }
    return LocalTime.parse(value);
  });
  const psqlLocalDateTimeFormat = new DateTimeFormatterBuilder()
    .appendPattern('yyyy-MM-dd HH:mm:ss')
    .parseLenient()
    .appendFraction(ChronoField.MICRO_OF_SECOND, 0, 6, true)
    .toFormatter();
  pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, (value: string) =>
    LocalDateTime.parse(value, psqlLocalDateTimeFormat),
  );

  pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, (value: string) =>
    ZonedDateTime.from(nativeJs(new Date(value), DEFAULT_TIMEZONE)),
  );
};

export const setupDatabase = async () => {
  rootLogger.info('Starting DB setup');
  const knex: Knex<Record<string, Record<string, any>>> = knexFactory({
    client: 'postgres',
    connection: {
      ...pgConfig,
      application_name: `dateable-app-api`,
    },
    pool: {
      // knexjs recommends a min of 0 https://knexjs.org/guide/#pool
      min: 0,
      max: 60,
      log: (message: string, logLevel: string) => {
        rootLogger.log(logLevel as any, message);
      },
      afterCreate: async (
        connection: pg.Client,
        done: (error: null | unknown, connection: pg.Client) => void,
      ) => {
        try {
          await setupTypeParsersNew(connection);
          // iso_8601 is style P2Y3M4DT5H6M7S
          // https://www.postgresql.org/docs/current/datatype-datetime.html#DATATYPE-INTERVAL-OUTPUT
          await connection.query('SET intervalStyle = iso_8601;');
        } catch (error) {
          done(error, connection);
          throw error;
        }

        done(null, connection);
      },
    },

    ...knexSnakeCaseMappers(),
    useNullAsDefault: true,
    debug: false,
    log: env.IS_TEST ? undefined : rootLogger,
  });
  rootLogger.info('Created knex');

  // Pass knex into ObjectionJS models
  Model.knex(knex);

  rootLogger.info('Finished setting up DB');
  return {
    knex,
  };
};
