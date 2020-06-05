import { NativeModules } from 'react-native';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      [bundleName: string]: { default: any };
    }
    interface ProcessEnv {
      HAUL_BUNDLES: { [bundleName: string]: number };
    }
  }
}

const { Multibundle: MultibundleNativeModule } = NativeModules;

class Multibundle {
  loadStartTimestamp: { [bundleName: string]: number } = {};
  print: (...args: unknown[]) => void = () => {
    // no-op
  };

  enableLogging() {
    this.print = (...args) => {
      console.log('Multibundle:', ...args);
    };
  }

  disableLogging() {
    this.print = () => {
      // no-op
    };
  }

  isBundleLoaded(bundleName: string) {
    return Boolean(global[bundleName]);
  }

  getBundleExport(bundleName: string) {
    if (!this.isBundleLoaded(bundleName)) {
      throw new Error(`Bundle ${bundleName} was not loaded`);
    }
    return global[bundleName].default;
  }

  async loadBundle(bundleName: string): Promise<null | number | void> {
    this.loadStartTimestamp[bundleName] = Date.now();
    const isBundleLoaded = this.isBundleLoaded(bundleName);

    this.print(
      `request to load '${bundleName}' received at '${new Date(
        this.loadStartTimestamp[bundleName],
      ).toLocaleTimeString()}'`,
    );

    if (isBundleLoaded) {
      this.print(`bundle '${bundleName}' already loaded`);
      return null;
    }

    if (!isBundleLoaded) {
      this.print(`bundle '${bundleName}' not available - loading`);
      const bundleId = process.env.HAUL_BUNDLES[bundleName];

      if (typeof bundleId !== 'number') {
        throw new Error(`Cannot find bundle id for bundle name ${bundleName}`);
      }

      try {
        await MultibundleNativeModule.loadBundle(bundleName, bundleId);
      } catch (e) {
        console.error(`Cannot load bundle: ${bundleName}`, e);
      }

      return bundleId;
    }
  }
}

export default new Multibundle();
