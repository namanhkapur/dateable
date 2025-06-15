module.exports = {
  transform: {
    '^.+\\.ts$': '@swc/jest',
  },
  // Fixes a memory leak that appears to be associated with typescript/babel
  runtime: '@side/jest-runtime',

  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  restoreMocks: true,

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  testTimeout: 20000,

  // Global file configs
  testPathIgnorePatterns: ['/lib'],
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testRegex: '(/__tests__/.*\\.(test|spec))\\.[tj]sx?$',
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Run a setup once before all tests
  globalSetup: './__tests__/helpers/global-setup.ts',
  setupFilesAfterEnv: ['<rootDir>/__tests__/helpers/jest-extensions.ts'],

  // coverage
  collectCoverageFrom: [
    '**/*.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!<rootDir>/__tests__/**',
  ],
  coverageReporters: ['clover', 'json', 'lcov'],

  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
    [
      'jest-watch-suspend',
      {
        'suspend-on-start': true,
      },
    ],
  ],

  reporters: [
    'default',
    [
      'jest-junit',
      {
        addFileAttribute: 'true',
        outputDirectory: 'reports/jest/',
      },
    ],
  ],
  // disabled due to error when run with coverage.
  // the resulting testResults object is too large
  // to be stringified
  // testResultsProcessor: 'jest-json-reporter',
};
