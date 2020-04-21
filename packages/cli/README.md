# umi-react-native-cli

## Installation

```npm
yarn global add umi-react-native-cli
```

## Usage

### Start Dev Server

```npm
umi-rn start
```

### Run Android

```npm
umi-rn android
```

### Run iOS

```npm
umi-rn ios
```

### Create Offline Bundle

#### iOS

```npm
umi-rn bundle --platform ios --bundleOutput dist/ios/main.jsbundle --assets-dest dist/ios --dev false --minify true
```

#### android

```npm
umi-rn bundle --platform android --bundleOutput dist/android/index.android.js --assets-dest dist/android --dev false --minify true
```
