require('react-native-gesture-handler/jestSetup');
require('@testing-library/react-native/build/matchers/extend-expect');

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

try {
  require.resolve('react-native/Libraries/Animated/NativeAnimatedHelper');
  jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
} catch {
  // React Native version may not ship this helper path.
}

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@expo/vector-icons', () => {
  const Icon = () => null;
  Icon.glyphMap = {};
  return { Ionicons: Icon };
});

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'ja' }],
}));

const originalConsoleLog = console.log;
console.log = (...args) => {
  if (args[0] === '[ScreenTime] Native module not available - using mock mode') {
    return;
  }
  originalConsoleLog(...args);
};
