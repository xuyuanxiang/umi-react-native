module.exports = {
  testMatch: ['<rootDir>**/test/**/*.(spec|test).[jt]s?(x)'],
  collectCoverageFrom: ['<rootDir>/packages/*/src/**/*.{ts,tsx}'],
  preset: '@testing-library/react-native',
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: ['/node_modules/(?!(react-router|react-native)).+\\.js$'],
};
