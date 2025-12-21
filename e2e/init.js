const detox = require('detox');
const config = require('../.detoxrc');
const adapter = require('detox/runners/jest/adapter');
const { beforeAll, beforeEach, afterAll } = require('@jest/globals');

beforeAll(async () => {
  await detox.init(config, { initGlobals: false });
  await adapter.beforeAll();
});

beforeEach(async () => {
  await adapter.beforeEach();
});

afterAll(async () => {
  await adapter.afterAll();
  await detox.cleanup();
});
