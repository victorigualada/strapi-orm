module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePaths: ['.'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testPathIgnorePatterns: ['/node_modules/'],
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testTimeout: 5000,
  coverageReporters: ['lcov', 'json', 'text', 'text-summary'],
  clearMocks: true,
  collectCoverageFrom: [
    '<rootDir>/**/*.ts',
    '!<rootDir>/src/types/*',
    '!<rootDir>/src/generator/strapi-schema.type.ts',
    '!<rootDir>/test/**/*',
    '!<rootDir>/src/index.ts',
  ],
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
