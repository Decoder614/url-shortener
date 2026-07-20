const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');

function startServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      resolve(server);
    });
  });
}

test('POST /api/v1/urls creates a short URL', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalUrl: 'https://example.com' })
    });

    assert.equal(response.status, 201);
    const data = await response.json();
    assert.equal(data.originalUrl, 'https://example.com');
    assert.ok(data.shortCode);
    assert.match(data.shortUrl, /\/[^/]+$/);
  } finally {
    server.close();
  }
});

test('POST /api/v1/urls rejects invalid URLs', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalUrl: 'not-a-url' })
    });

    assert.equal(response.status, 400);
    const data = await response.json();
    assert.equal(data.message, 'Invalid URL');
  } finally {
    server.close();
  }
});

test('POST /api/v1/urls rejects invalid custom aliases', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalUrl: 'https://example.com', customAlias: 'bad alias!' })
    });

    assert.equal(response.status, 400);
    const data = await response.json();
    assert.equal(data.message, 'Invalid custom alias');
  } finally {
    server.close();
  }
});
