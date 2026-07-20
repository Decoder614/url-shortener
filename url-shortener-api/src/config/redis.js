const Redis = require('redis');

let client = null;
let isRedisReady = false;
let isRedisEnabled = false;
let connectionError = null;

async function initRedis() {
  if (client) {
    return client;
  }

  try {
    client = Redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    });

    client.on('error', () => {
      connectionError = 'Redis unavailable';
      isRedisEnabled = false;
      isRedisReady = false;
    });

    await client.connect();
    isRedisEnabled = true;
    isRedisReady = true;
    connectionError = null;
  } catch (error) {
    connectionError = error.message;
    isRedisEnabled = false;
    isRedisReady = false;
    client = null;
  }

  return client;
}

async function getCachedValue(key) {
  if (!isRedisEnabled) {
    await initRedis();
  }

  if (!client || !isRedisEnabled) {
    return null;
  }

  try {
    const value = await client.get(key);
    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

async function setCachedValue(key, value, ttlSeconds = 300) {
  if (!isRedisEnabled) {
    await initRedis();
  }

  if (!client || !isRedisEnabled) {
    return null;
  }

  try {
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    return true;
  } catch (error) {
    return null;
  }
}

async function deleteCachedValue(key) {
  if (!isRedisEnabled) {
    await initRedis();
  }

  if (!client || !isRedisEnabled) {
    return null;
  }

  try {
    await client.del(key);
    return true;
  } catch (error) {
    return null;
  }
}

module.exports = {
  initRedis,
  getCachedValue,
  setCachedValue,
  deleteCachedValue,
};
