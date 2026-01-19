export default {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  verbose: true,
  extensionsToTreatAsEsm: [".js"],
  transform: {},
  testPathIgnorePatterns: ["/node_modules/"],
};
