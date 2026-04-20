module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["./tests/setup.ts"],
  runInBand: true,
  maxWorkers: 1,
  modulePathIgnorePatterns: ["<rootDir>/dist/"],

  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
  },
};
