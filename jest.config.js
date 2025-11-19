/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["./tests/setup.ts"],
  runInBand: true,
  maxWorkers: 1,
};
