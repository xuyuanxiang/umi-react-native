module.exports = {
  testMatch: ['<rootDir>/packages/**/test/**/*.(spec|test).[jt]s?(x)'],
  collectCoverageFrom: ['<rootDir>/packages/*/src/**/*.{ts,tsx}'],
  coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/packages/*/lib/'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/packages/*/lib/'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: ['/node_modules/', '<rootDir>/packages/*/lib/'],
};
