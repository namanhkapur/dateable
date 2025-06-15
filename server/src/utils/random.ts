import assert from 'assert';
import * as crypto from 'crypto';
import seedrandom from 'seedrandom';
import { UUID } from './uuid';

// randomId: number -> string
export const randomId = (length: number = 6): string => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

/**
 * Produces a digest from the given seed.
 */
const digestFromSeed = (seed: string) => {
  const h = crypto.createHash('md5');
  h.update(seed);
  return h.digest();
};

/**
 * Returns a random integer in [-2147483648, 2147483647] based on the seed
 * passed in (ie, 32 random bits).
 */
const randomSignedIntegerFromSeed = (seed: string) => {
  if (seed === '') {
    throw new Error('empty seed passed in');
  }

  const hashBytes = digestFromSeed(seed);

  let result = 0;
  for (let i = 0; i < 4; i++) {
    // eslint-disable-next-line no-bitwise
    result += hashBytes[i] << (i * 8);
  }

  return result;
};

/**
 * Returns a random integer in [0, 2^31) based on the seed passed in.
 */
export const randomIntegerFromSeed = (seed: string) => {
  let result = randomSignedIntegerFromSeed(seed);
  // Prevent negative results
  // eslint-disable-next-line no-bitwise
  result &= ~(1 << 31);
  return result;
};

/**
 * Returns a random integer in [0, 2^31).
 */
export const randomInteger = () => randomIntegerFromSeed(UUID());

/**
 * Returns a random element from the given list based on the seed passed in.
 */
export const randomSelectionFromSeed = <T>(
  list: ReadonlyArray<T>,
  seed: string,
): T => {
  if (list.length === 0) {
    throw Error('empty list passed in');
  }
  return list[randomIntegerFromSeed(seed) % list.length];
};

/**
 * Returns a random number in [lowerBound, upperBound] based on the seed
 * passed in. If no seed is passed in, a random one is used.
 */
export const randomNumberInRange = (
  lowerBound: number,
  upperBound: number,
  seed?: string,
) => {
  assert(upperBound > lowerBound);
  assert(upperBound < 2 ** 31);
  // +1 since both bounds are inclusive
  const range = upperBound - lowerBound + 1;
  return (Math.abs(seedrandom(seed).int32()) % range) + lowerBound;
};
