module.exports = {
  dependency: {
    platforms: {
      ios: {},
      android: {},
    },
    hooks: {
      prestart: './hooks/prestart.js',
      prebundle: './hooks/prebundle.js',
    },
  },
};
