/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json', 
      },
    ],
    '^.+\\.js?$': 'babel-jest', 
  },
  
  transformIgnorePatterns: [
    'node_modules/(?!(@scalar)/)',
  ],
  
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  
  testMatch: [
    "**/__tests__/**/*.test.[jt]s",
    "**/?(*.)+(spec|test).[jt]s"
  ],
};
