const path = require('path');
const { pascalCase, camelCase } = require('change-case');
require('dotenv').config({ path: `${__dirname}/.env` });

const PUBLIC_FOLDER = path.join(
  __dirname,
  '..',
  'server',
  'src',
  'types',
  'database',
);

const omitFromModel = (name) => `
// @Custom removed property by .kanelrc.js
// ${name}`;

const connection = {
  host: 'localhost',
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: process.env.POSTGRES_HOST_PORT,
};

const DISABLED_PROPERTY_LIST = ['created_at', 'last_modified'];

module.exports = {
  connection: connection,
  preDeleteModelFolder: true,

  // file names as `SomeModel.ts`
  fileNominator: (givenName, modelName) => pascalCase(givenName),
  // Table names as `interface SomeModel {}
  modelNominator: (givenName) => pascalCase(`database_${givenName}`),
  // Type names as `SomeEnumType`
  typeNominator: (givenName) => pascalCase(`database_${givenName}`),
  // Table property names as `someKeyValue`
  propertyNominator: (propertyName, model) => {
    if (DISABLED_PROPERTY_LIST.includes(propertyName)) {
      return omitFromModel(propertyName);
    }
    return camelCase(propertyName);
  },
  modelHooks: [
    /**
     * Makes the type brand non optional so that the base type cannot
     * be assigned to the branded type without casting.
     */
    function stricterTypeBrand(lines) {
      lines = [...lines];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('" __flavor"?:')) {
          lines[i] = line.replace('?:', ':');
        }
      }
      return lines;
    },
  ],

  // Some id type imports aren't handled properly when they are defined in public but
  // used in confidential. make generate-db-types handles this by doing a find and
  // replace for the known cases, but we may need to add more over time.

  customTypeMap: {
    'bigint[]': 'number[]',
    bytea: 'Buffer',
    // These aren't quite right since a javascript number can't represent very large numbers
    int8: 'number',
    float8: 'number',
    numeric: 'number',
    time: {
      name: 'LocalTime',
      module: '@js-joda/core',
      absoluteImport: true,
      defaultImport: false,
    },
    date: {
      name: 'LocalDate',
      module: '@js-joda/core',
      absoluteImport: true,
      defaultImport: false,
    },
    timestamp: {
      name: 'LocalDateTime',
      module: '@js-joda/core',
      absoluteImport: true,
      defaultImport: false,
    },
    timestamptz: {
      name: 'ZonedDateTime',
      module: '@js-joda/core',
      absoluteImport: true,
      defaultImport: false,
    },
    vector: 'string',
    'text[]': 'string[]',
  },

  schemas: [
    {
      name: 'public',
      modelFolder: PUBLIC_FOLDER,
      ignore: ['flyway_schema_history'],
    },
  ],
};
