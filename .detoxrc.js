module.exports = {
  testRunner: {
    $0: 'jest',
    args: {
      config: 'e2e/jest.config.js',
      runInBand: true,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath:
        process.env.DETOX_IOS_BINARY_PATH ||
        'ios/build/Build/Products/Debug-iphonesimulator/StopShorts.app',
      build:
        'npx expo prebuild --platform ios --no-install --clean && xcodebuild -workspace ios/StopShorts.xcworkspace -scheme StopShorts -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath:
        process.env.DETOX_ANDROID_BINARY_PATH ||
        'android/app/build/outputs/apk/debug/app-debug.apk',
      testBinaryPath:
        process.env.DETOX_ANDROID_TEST_BINARY_PATH ||
        'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
      build:
        'npx expo prebuild --platform android --no-install --clean && cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
    },
  },
  devices: {
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'detox',
      },
    },
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14',
      },
    },
  },
  configurations: {
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
  },
};
