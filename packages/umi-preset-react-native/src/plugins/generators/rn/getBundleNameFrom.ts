export default function getBundleNameFrom(component: string): string {
  const bundleName = component.replace(/^@\//, '').replace(/\.[tj]sx?$/, '');
  if (bundleName === 'pages/index') {
    return 'host';
  }
  return bundleName;
}
