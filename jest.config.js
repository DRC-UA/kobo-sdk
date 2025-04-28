/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  // testMatch: ['**/playground.spec.ts'],
  testMatch: ['**/?(*.)+(spec|test|e2e).[tj]s'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: false,
  noStackTrace: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Path to your setup file
  // silent: true,
  transform: {
    '^.+.tsx?$': ['ts-jest', {}],
  },
}
