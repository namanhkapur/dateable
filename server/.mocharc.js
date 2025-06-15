module.exports = {
  timeout: '20000',
  require: [
    '__tests__/helpers/db-and-log-setup.ts',
    '__tests__/helpers/mocha-hook-setup.ts',
    '__tests__/helpers/expect-extensions.ts',
    'mocha-expect-snapshot',
  ],
  reporter: 'mocha-multi-reporters',
  'reporter-options': ['configFile=./.mocha-reporter-config.json'],
  'dry-run': false,
};
