import { env } from '../config/env';
import assert from '../utils/assert-extensions';

let testDbQueriesAllowed = false;

const assertDbQueriesAreAllowed = () => {
  assert(
    !env.IS_TEST || testDbQueriesAllowed,
    'DB queries are not allowed if not running inside a dbTest block',
  );
};
const setAreDbQueriesAllowed = (allowed: boolean) => {
  testDbQueriesAllowed = allowed;
};

/**
 * This helper allows us to prevent database queries from running during tests
 * unless they are run from a dbTest block. Otherwise its likely that test state
 * would not be properly cleaned up.
 *
 * Some tests of lower level functionality like DbSession may need to make db
 * queries outside of a dbTest block and they can manually call `setAreDbQueriesAllowed(true)`
 * during their tests to enable this. But that should never be done for tests of business
 * logic.
 */
export const TestDbLockoutHelper = {
  assertDbQueriesAreAllowed,
  setAreDbQueriesAllowed,
};
