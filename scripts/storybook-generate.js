#!/usr/bin/env node
const { generate } = require('@storybook/react-native/scripts/generate');

generate({
  configPath: './.rnstorybook',
  useJs: false,
  docTools: true,
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
