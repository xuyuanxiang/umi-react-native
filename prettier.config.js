module.exports = {
  printWidth: 120,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'all',
  proseWrap: 'never',
  endOfLine: 'lf',
  overrides: [
    {
      files: '.vcmrc',
      options: {
        parser: 'json',
      },
    },
  ],
};
