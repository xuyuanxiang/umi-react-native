export default function (): { plugins: string[] } {
  return {
    plugins: [
      require.resolve('./plugins'),
      require.resolve('./plugins/generateFiles/core/appKey'),
      require.resolve('./plugins/commands/build'),
      require.resolve('./plugins/commands/dev'),
    ],
  };
}
