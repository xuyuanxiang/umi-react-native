module.exports = {
  dependency: {
    hooks: {
      prestart: './hooks/prestart.js',
      prebundle: './hooks/prebundle.js',
    },
  },
};
