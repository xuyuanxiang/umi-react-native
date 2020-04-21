module.exports = {
  testMatch: ['<rootDir>/packages/**/__tests__/**/*.[jt]s?(x)', '<rootDir>/packages/**/?(*.)+(spec|test).[tj]s?(x)'],
  collectCoverageFrom: ['<rootDir>/packages/*/src/**/*.{ts,tsx}'],
  coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/packages/*/lib/'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/packages/*/lib/'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: ['/node_modules/', '<rootDir>/packages/*/lib/'],
};
