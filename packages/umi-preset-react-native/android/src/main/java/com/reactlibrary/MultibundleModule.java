package com.reactlibrary;

import com.facebook.react.bridge.CatalystInstance;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class MultibundleModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public MultibundleModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "Multibundle";
    }

    @ReactMethod
    public void loadBundle(String bundleName, int bundleId, Promise promise) {

        try {
            CatalystInstance catalystInstance = this.reactContext.getCatalystInstance();
            catalystInstance.loadScriptFromAssets(
              this.reactContext.getAssets(),
              "assets://" + bundleName + ".android.bundle",
              bundleId,
              false);
            promise.resolve(null);
        } catch(Exception e) {
            promise.reject(e);
        }

    }
}
