import { promisify } from 'util';

import {
  convert,
  DateTimeFormatter,
  DayOfWeek,
  LocalDateTime,
  nativeJs,
  ZonedDateTime,
  ZoneId,
} from '@js-joda/core';
import '@js-joda/timezone'; // DO NOT REMOVE
import { Locale } from '@js-joda/locale';
import { isHoliday as isHolidayRaw } from 'nyse-holidays';
import { Logger } from '../config/rootLogger';
import { logError } from './error-handler';

export const DEFAULT_TIMEZONE = ZoneId.of('America/New_York');

export const DEFAULT_LOCALE = Locale.US;
// NOTE: add to this to avoid redeclaring the same formats everywhere
export const LOCAL_DATE_FORMATS = {
  // "1/21/2022"
  MDY_SHORT_DATE:
    DateTimeFormatter.ofPattern('MM/dd/yyyy').withLocale(DEFAULT_LOCALE),
};

declare module '@js-joda/core' {
  interface ZonedDateTime {
    toPostgres(): string;
  }
}
/**
 * Postgres does not support a named timezone, so a ZonedDateTime
 * is formatted like an OffsetDateTime, i.e. only an offset
 */
// eslint-disable-next-line func-names
ZonedDateTime.prototype.toPostgres = function (): string {
  return this.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
};

export const toISOString = (timestamp: ZonedDateTime | LocalDateTime): string =>
  convert(timestamp).toDate().toISOString();

const logJodaDateMismatch = (
  logger: Logger,
  newDateTime: ZonedDateTime | null,
  oldDateTime: Date | null,
  convertedOldDateTime: ZonedDateTime | null,
) => {
  logger.error('JodaDateTimeMismatch', {
    newDateTime,
    oldDateTime,
    convertedOldDateTime,
  });
};

type OldDateTimeFunction = () => Date;
type NewDateTimeFunction = () => ZonedDateTime;
export const jodaMigration = (
  logger: Logger,
  newFunction: NewDateTimeFunction,
  oldFunction: OldDateTimeFunction,
): ZonedDateTime => {
  let newResult: ZonedDateTime | null = null;
  let oldResult: Date | null = null;
  let oldError: any = null;
  try {
    newResult = newFunction();
  } catch (e) {
    logError(logger, e, 'NewDateTimeFunction threw an error');
  }

  try {
    oldResult = oldFunction();
  } catch (e) {
    oldError = e;
    logError(logger, e, 'OldDateTimeFunction threw an error');
  }

  if (newResult === null && oldResult === null) {
    if (oldError !== null) {
      throw oldError;
    }
    logJodaDateMismatch(logger, null, null, null);
  }

  if (oldResult === null) {
    logJodaDateMismatch(logger, newResult, null, null);
    return newResult!;
  }

  const convertedOldResult = ZonedDateTime.from(nativeJs(oldResult));
  if (newResult === null) {
    logJodaDateMismatch(logger, null, oldResult, convertedOldResult);
    return convertedOldResult;
  }

  if (!convertedOldResult.isEqual(newResult)) {
    logJodaDateMismatch(logger, newResult, oldResult, convertedOldResult);
    return convertedOldResult;
  }

  return newResult;
};

export const isWeekend = (date: ZonedDateTime): boolean =>
  [DayOfWeek.SATURDAY, DayOfWeek.SUNDAY].includes(date.dayOfWeek());

export const isHoliday = (date: ZonedDateTime): boolean =>
  isHolidayRaw(zonedDateTimeToDate(date));

export const isMarketOpen = (date: ZonedDateTime): boolean =>
  !(isWeekend(date) || isHoliday(date));

export function addBusinessDays(
  date: ZonedDateTime,
  days: number,
): ZonedDateTime {
  while (days > 0) {
    date = date.plusDays(1);
    if (!isWeekend(date) && !isHoliday(date)) {
      days--;
    }
  }
  return date;
}

export function subtractBusinessDays(
  date: ZonedDateTime,
  days: number,
): ZonedDateTime {
  while (days > 0) {
    date = date.minusDays(1);
    if (!isWeekend(date) && !isHoliday(date)) {
      days--;
    }
  }
  return date;
}

export function lastMarketClose(date: ZonedDateTime): ZonedDateTime {
  if (!isMarketOpen(date)) {
    return lastMarketClose(
      date.minusDays(1).withHour(23).withMinute(59).withSecond(59),
    );
  }

  const marketClose = date.withHour(16).withMinute(0).withSecond(0).withNano(0);
  if (date.isBefore(marketClose)) {
    return lastMarketClose(
      date.minusDays(1).withHour(23).withMinute(59).withSecond(59),
    );
  }
  return marketClose;
}

export function nextMarketOpen(date: ZonedDateTime): ZonedDateTime {
  if (!isMarketOpen(date)) {
    return nextMarketOpen(
      date.plusDays(1).withHour(0).withMinute(0).withSecond(0).withNano(0),
    );
  }

  const marketOpen = date.withHour(9).withMinute(30).withSecond(0).withNano(0);
  if (date.isAfter(marketOpen)) {
    return nextMarketOpen(
      date.plusDays(1).withHour(0).withMinute(0).withSecond(0).withNano(0),
    );
  }
  return marketOpen;
}

export const dateToZonedDateTime = (date: Date) => {
  const dateInUTC = date.toUTCString();
  return ZonedDateTime.parse(dateInUTC, DateTimeFormatter.RFC_1123_DATE_TIME);
};

export const zonedDateTimeToDate = (date: ZonedDateTime) =>
  convert(date).toDate();

export const sleep = promisify(setTimeout);
