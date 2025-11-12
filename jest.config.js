/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  transformIgnorePatterns: ["/node_modules/(?!uuid)/"],
  moduleFileExtensions: ["ts", "js", "json"],
  moduleNameMapper: {
    "^uuid$": require.resolve("uuid"),
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
};
