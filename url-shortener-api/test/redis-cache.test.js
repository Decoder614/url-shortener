const test = require('node:test');
const assert = require('node:assert/strict');
const { initRedis, setCachedValue, getCachedValue, deleteCachedValue } = require('../src/config/redis');

test('cache layer stores and retrieves values even without a Redis server', async () => {
  await initRedis();

  await setCachedValue('test:key', { ok: true }, 30);
  const cached = await getCachedValue('test:key');

  assert.deepEqual(cached, { ok: true });

  await deleteCachedValue('test:key');
  assert.equal(await getCachedValue('test:key'), null);
});
