export default {
  dynamicImport: {
    loading: '@/components/Loading',
  },
  haul: {
    extraBundles: [
      {
        name: 'tabs/HomeScreen',
        entry: '@/tabs/HomeScreen.js',
      },
      {
        name: 'tabs/ProfileScreen',
        entry: '@/tabs/ProfileScreen.js',
      },
    ],
  },
};
