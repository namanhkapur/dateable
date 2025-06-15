const generateNoSkipOrOnlyRule = () => {
  return [
    'test',
    'it',
    'describe',
    'dbTest',
    'dbTestNoTransaction',
    'dbDescribe',
  ].flatMap((testLike) =>
    ['skip', 'only'].map((skipOrOnly) => ({
      object: testLike,
      property: skipOrOnly,
      message: `It is generally a mistake to commit ${testLike}.${skipOrOnly}. If this is intended add an ignore comment '// eslint-disable-next-line no-restricted-properties'`,
    })),
  );
};

module.exports = {
  env: {
    browser: false,
    es2021: true,
  },
  root: true,
  ignorePatterns: [
    '**objects.ts',
    'src/types/database/*.ts',
    'src/scheduler/**/*.ts',
    '__tests__/helpers/*.ts',
    'src/database/**/*.ts',
    'src/config/**',
    'index.ts',
  ],
  extends: ['airbnb-base', 'prettier', 'plugin:mocha/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    project: './tsconfig.eslint.json',
  },
  plugins: ['@typescript-eslint', 'jest', 'mocha'],
  rules: {
    'import/extensions': [0],
    'import/no-unresolved': 0,
    'object-curly-newline': 0,
    'class-methods-use-this': 0,
    'max-len': [0],
    'no-shadow': [0],
    '@typescript-eslint/no-shadow': [0],
    'no-unused-vars': [0],
    'no-return-await': 0,
    '@typescript-eslint/return-await': ['error', 'in-try-catch'],
    'no-useless-constructor': 0,
    'no-empty-function': 0,
    'no-plusplus': 0,
    'no-constant-binary-expression': 2,
    'no-param-reassign': 0,
    '@typescript-eslint/no-confusing-non-null-assertion': 'error',
    '@typescript-eslint/no-extra-non-null-assertion': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-unused-vars': [
      2,
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-floating-promises': [2],
    '@typescript-eslint/no-misused-promises': [2],
    'no-redeclare': [0],
    'no-void': ['error', { allowAsStatement: true }],
    'no-restricted-syntax': 0,
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['src/*', 'server/*'],
            message: 'Use relative imports',
          },
        ],
        paths: [
          {
            name: '@faker-js/faker',
            message: 'Use @faker-js/faker/locale/en_US instead',
          },
        ],
      },
    ],
    'no-restricted-properties': [
      'error',
      {
        object: 'Promise',
        property: 'all',
        message:
          'Prefer promiseAll function. It is like Promise.all but waits for all promises to resolve or reject.',
      },
      ...generateNoSkipOrOnlyRule(),
    ],
    'no-use-before-define': 0,
    'no-await-in-loop': 0,
    'lines-between-class-members': [0, 'never'],
    'implicit-arrow-linebreak': [0],
    'function-paren-newline': [0],
    'prefer-destructuring': 0,
    // Jest configs
    'jest/no-disabled-tests': 1,
    'jest/no-focused-tests': 2,
    'jest/no-identical-title': 2,
    'jest/prefer-to-have-length': 1,
    'jest/valid-expect': 2,
    'jest/no-restricted-matchers': [
      'error',
      {
        toBeTruthy: null,
      },
    ],
    'mocha/no-skipped-tests': 2,
    'mocha/no-mocha-arrows': 0,
    'mocha/no-setup-in-describe': 0,
    'mocha/no-top-level-hooks': 0, // Doesn't work with dbDescribe
    'mocha/no-sibling-hooks': 0, // Incorrectly triggering on functions called `setup`
    'import/no-named-as-default': [0],
    'import/prefer-default-export': [0],
    'max-classes-per-file': [0],
    'no-underscore-dangle': [0],
    'no-nested-ternary': 0,
    yoda: 0,
  },
  overrides: [
    {
      // TODO adjust this path if needed
      files: ['src/**/*workflow.ts'],
      rules: {
        'no-restricted-imports': ['error'],
      },
    },
    {
      files: ['scripts/**/*.ts'],
      rules: {
        'import/no-extraneous-dependencies': [
          'error',
          { devDependencies: true },
        ],
      },
    },
  ],
};
