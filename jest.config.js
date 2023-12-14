module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePaths: ['.'],
  testPathIgnorePatterns: ['/node_modules/'],
  roots: ['<rootDir>/test/', '<rootDir>/src/'],
  testTimeout: 5000,
  coverageReporters: ['lcov', 'json', 'text', 'text-summary'],
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.ts', 'temporal/**/*.ts'],
  coverageThreshold: {
    // TODO: keep bumping this as we improve it until we reach 80 for each
    global: {
      branches: 38,
      functions: 50,
      lines: 51,
      statements: 51,
    },
  },
}
