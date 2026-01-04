const { getDefaultConfig } = require('expo/metro-config');
const { withStorybook } = require('@storybook/react-native/metro/withStorybook');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

const storybookConfig = withStorybook(config, {
  enabled: process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true',
  configPath: './.rnstorybook',
});

const finalConfig = withNativeWind(storybookConfig, { input: './global.css' });

finalConfig.resolver = {
  ...finalConfig.resolver,
  unstable_enablePackageExports: true,
};

module.exports = finalConfig;
