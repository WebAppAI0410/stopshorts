module.exports = {
  preset: 'detox',
  testRunner: 'jest-circus/runner',
  testTimeout: 120000,
  setupFilesAfterEnv: ['<rootDir>/init.js'],
};
