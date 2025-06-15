/* tslint:disable */
import _, { Many } from 'lodash';

/**
 * Adds extra typesafety to _.pick function by checking that the keys to pick are
 * present in the type of T.
 */
export const pick = <T extends object, U extends keyof T>(
  obj: T,
  ...keys: Many<U>[]
): Pick<T, U> => _.pick(obj, ...keys);

/**
 * Adds extra typesafety to _.omit function by checking that the keys to omit
 * are present in the type of T. This is not always appropriate, especially since
 * objects may have extra fields at runtime that you want to exclude. But it is safer
 * to do this by `pick`ing all the fields you expect and want to be present.
 */
export const omit = <T extends object, U extends keyof T>(
  obj: T,
  ...keys: Many<U>[]
): Omit<T, U> => _.omit(obj, ...keys);

/**
 * Adds extra type-utility to the _.keys function by return the
 * results as an Array<keyof T> instead of Array<string>. This
 * is not always correct since an object may have extra fields
 * at runtime. But it is often a more useful type regardless
 */
export const keys = <T extends object>(obj: T): Array<keyof T> =>
  _.keys(obj) as (keyof T)[];

/**
 * Get names of keys with values that are not either null or undefined.
 */
export const getNonNilableKeys = (obj: Record<string, any | null>) =>
  _.omitBy(obj, (value) => value === null || value === undefined);

export const ObjectUtils = {
  pick,
  omit,
  keys,
  getNonNilableKeys,
};

export const getFirstAndLastElements = <TType>(
  arr: TType[],
): [TType, TType] => [arr[0], arr[arr.length - 1]];

export const exclude = <TType>(arr: TType[], excludedItem: TType): TType[] =>
  arr.filter((item) => item !== excludedItem);

export const getRandomItem = <TType>(arr: TType[]): TType =>
  arr[Math.floor(Math.random() * arr.length)];

export const createCountMapFromArray = <TType extends string | number | symbol>(
  array: TType[],
): Record<TType, number> =>
  array.reduce((countMap: Record<TType, number>, element: TType) => {
    countMap[element] = (countMap[element] || 0) + 1;
    return countMap;
  }, {} as Record<TType, number>);

export const fromEntriesToArrayMap = <TKey extends string | number, TValue>(
  entries: [TKey, TValue][],
): Record<TKey, TValue[]> => {
  const result = {} as Record<TKey, TValue[]>;
  entries.forEach(([key, value]) => {
    if (result[key]) {
      result[key].push(value);
      return;
    }
    result[key] = [value];
  });
  return result;
};

export const isStringArray = (arr: unknown): arr is string[] =>
  Array.isArray(arr) && arr.every((item) => typeof item === 'string');

/**
 * A list of types that can be used for sorting. This list is not comprehensive and
 * lodash supports more options. Feel free to add more options as needed as long
 * as it is obvious how those would be sorted.
 */
type ValidSortKeyValue =
  | string
  | number
  | symbol
  | boolean
  | Date
  | null
  | undefined;
type ValidSortKeys<T> = {
  [K in keyof T]: T[K] extends ValidSortKeyValue ? K : never;
}[keyof T];

/**
 * Adds extra typesafety to _.sortBy function by checking for two things:
 * 1. When using the short hand form, the key name should be a valid key in the object
 * 2. The value used to sort, should be a primitive with an obvious sort order. Note that
 * null and undefined are always sorted last in the list
 */
const sortBy = <T extends Object, U extends ValidSortKeys<T>>(
  arr: T[],
  ...sortKeys: Array<U | ((item: T) => ValidSortKeyValue)>
): T[] => _.sortBy(arr, ...sortKeys);

export const ArrayUtils = {
  getFirstAndLastElements,
  exclude,
  getRandomItem,
  createCountMapFromArray,
  fromEntriesToArrayMap,
  isStringArray,
  sortBy,
};

// https://stackoverflow.com/questions/57683303/how-can-i-see-the-full-expanded-contract-of-a-typescript-type
// expands object types one level deep. Useful for debugging only
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// expands object types recursively. Useful for debugging only
export type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T;

// Examples are for documentation

type BaseExampleType = {
  foo: string;
  bar?: number;
  baz: boolean | null;
  asdf: string;
};

export type OptionalAttributes<T> = {
  [k in keyof T]?: T[k];
};

export type PartialRecord<K extends keyof any, V> = Partial<Record<K, V>>;
// type ExamplePartialRecord = {
//   foo?: number | undefined;
//   bar?: number | undefined;
// }
type ExamplePartialRecord = PartialRecord<'foo' | 'bar', number>;

// Validate that at least one key in type is present
export type AtLeastOne<T> = { [K in keyof T]: Pick<T, K> }[keyof T];

// Require that only one is present
export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> &
      Partial<Record<Exclude<Keys, K>, undefined>>;
  }[Keys];

// Subset selects a set from parent
export type Subset<A, B extends A> = B;

// Removes properties with type never
export type OmitNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};
// type OmitNeverExample = { a: string }
type OmitNeverExample = OmitNever<{ a: string; b: never }>;

export type KeepOnly<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};
// type KeepOnlyExample = {
//   foo: string;
//   asdf: string;
// }
type KeepOnlyExample = KeepOnly<BaseExampleType, string>;

type ConvertUndefinedToOptional<T> =
  // Make properties that can be undefined into optionals and drop everything else.
  {
    [K in keyof T as undefined extends T[K] ? K : never]+?: T[K];
  } & { [K in keyof T as undefined extends T[K] ? never : K]: T[K] }; // Drop all properties that can be undefined

// type ConvertUndefinedToOptionalExample = {
//   a?: string | undefined;
//   b?: number | undefined;
//   c?: boolean | undefined;
// } & {
//   d: number;
// }
type ConvertUndefinedToOptionalExample = ConvertUndefinedToOptional<{
  a: string | undefined;
  b?: number;
  c?: boolean | undefined;
  d: number;
}>;

export type PickKeysOfType<T, V> = keyof KeepOnly<T, V>;
// type PickKeysOfTypeExample = "foo" | "asdf"
type PickKeysOfTypeExample = PickKeysOfType<BaseExampleType, string>;

// Selects properties with the same type that are present in both A and B
// export type Common<A, B> = OmitNever<Pick<A & B, keyof A & keyof B>>;
export type Common<A, B> = ConvertUndefinedToOptional<
  OmitNever<
    {
      [K in keyof A & keyof B as A[K] extends B[K] ? K : never]: A[K];
    } & {
      [K in keyof A & keyof B as B[K] extends A[K] ? K : never]: B[K];
    }
  >
>;
// type CommonExample = {
//   d?: string | undefined;
// } & {
//   b: number;
//   e: boolean | null;
//   c: number;
// }
type CommonExample = Common<
  { a: string; b: number; c?: number; d?: string; e: boolean | null },
  { a: boolean; b: number; c: number; d?: string; e: boolean | null }
>;

export const copyNonNilValuesFrom = <
  From extends object,
  Key extends keyof From,
>(
  from: From,
  keys: Key[],
): Partial<Pick<From, Key>> => {
  const result: Partial<Pick<From, Key>> = {};
  keys.forEach((key) => {
    const value = from[key];
    if (!_.isNil(value)) {
      result[key] = value;
    }
  });
  return result;
};

// Makes every field of an object nullable.
export type PartiallyNull<T> = {
  [K in keyof T]: T[K] | null;
};

// Makes every field of an object non-nullable.
export type RequiredNonNullable<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

// Makes optional fields of an object nullable.
export type RequiredOrNullable<T> = {
  [K in keyof T]-?: T[K] extends undefined
    ? Exclude<T[K], 'undefined'> | null
    : T[K];
};

/**
 * Makes a new type where all optional fields in `T` are required (but still
 * allows null values).
 *
 * Adapted from https://stackoverflow.com/a/53050575.
 */
export type RequiredRecursive<T> = {
  [P in keyof T]-?: RequiredRecursive<T[P]>;
};

// Makes every field of an object boolean.
export type BooleanValues<T> = {
  [K in keyof T]: boolean;
};

// Sets type to any if object extends any, otherwise sets type to null
export type AnyOrNever<T> = T extends any ? any : never;
export type Nil = undefined | null;
export type Nilable<T> = T | Nil;
export type ValueOf<T> = T[keyof T];

// Initializer object for database model
export type DbInitializer<T> = Omit<T, 'id'>;

export type Awaited<T> = T extends PromiseLike<infer PT> ? PT : T;

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type PartialOfPartials<T> = T extends object
  ? {
      [P in keyof T]?: Partial<T[P]>;
    }
  : T;

// A function that takes a type as a parameter to ensure that a list has all of the specified types
export const arrayOfAll =
  <T>() =>
  <U extends T[]>(
    array: U & ([T] extends [U[number]] ? unknown : 'Invalid') & { 0: T },
  ) =>
    array;
