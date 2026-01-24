const { getDefaultConfig } = require('expo/metro-config');
const { withStorybook } = require('@storybook/react-native/metro/withStorybook');

const config = getDefaultConfig(__dirname);

const storybookConfig = withStorybook(config, {
  enabled: process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true',
  configPath: './.rnstorybook',
});

storybookConfig.resolver = {
  ...storybookConfig.resolver,
  unstable_enablePackageExports: true,
};

module.exports = storybookConfig;
