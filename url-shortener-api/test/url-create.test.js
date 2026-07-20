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

test('GET /api-docs.json exposes the OpenAPI document', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api-docs.json`);

    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.openapi, '3.0.3');
    assert.ok(data.info.title.includes('URL Shortener API'));
  } finally {
    server.close();
  }
});

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

test('GET /api/v1/urls/:id, PUT /api/v1/urls/:id and DELETE /api/v1/urls/:id manage URL records', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const createResponse = await fetch(`http://127.0.0.1:${address.port}/api/v1/urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalUrl: 'https://example.com', customAlias: 'crudtest' })
    });

    assert.equal(createResponse.status, 201);
    const created = await createResponse.json();
    const id = created.id;

    const getResponse = await fetch(`http://127.0.0.1:${address.port}/api/v1/urls/${id}`);
    assert.equal(getResponse.status, 200);
    const fetched = await getResponse.json();
    assert.equal(fetched.id, id);
    assert.equal(fetched.originalUrl, 'https://example.com');

    const updateResponse = await fetch(`http://127.0.0.1:${address.port}/api/v1/urls/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalUrl: 'https://example.org', customAlias: 'crudupdated' })
    });

    assert.equal(updateResponse.status, 200);
    const updated = await updateResponse.json();
    assert.equal(updated.originalUrl, 'https://example.org');
    assert.equal(updated.shortCode, 'crudupdated');

    const deleteResponse = await fetch(`http://127.0.0.1:${address.port}/api/v1/urls/${id}`, {
      method: 'DELETE'
    });

    assert.equal(deleteResponse.status, 200);
    const deletedBody = await deleteResponse.json();
    assert.equal(deletedBody.message, 'URL deleted successfully');

    const afterDeleteResponse = await fetch(`http://127.0.0.1:${address.port}/api/v1/urls/${id}`);
    assert.equal(afterDeleteResponse.status, 404);
  } finally {
    server.close();
  }
});

test('GET /api/v1/analytics/:shortCode tracks clicks and visitor details', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const alias = `analyticsdemo${Date.now()}`;
    const createResponse = await fetch(`http://127.0.0.1:${address.port}/api/v1/urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalUrl: 'https://example.com/analytics', customAlias: alias })
    });

    assert.equal(createResponse.status, 201);
    const created = await createResponse.json();

    const redirectResponse = await fetch(`http://127.0.0.1:${address.port}/${created.shortCode}`, {
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://example.org/page',
        'X-Forwarded-For': '203.0.113.10'
      }
    });

    assert.equal(redirectResponse.status, 302);
    assert.equal(redirectResponse.headers.get('location'), 'https://example.com/analytics');

    const analyticsResponse = await fetch(`http://127.0.0.1:${address.port}/api/v1/analytics/${created.shortCode}`);
    assert.equal(analyticsResponse.status, 200);
    const analytics = await analyticsResponse.json();

    assert.equal(analytics.totalClicks, 1);
    assert.equal(analytics.uniqueVisitors, 1);
    assert.ok(Array.isArray(analytics.recentClicks));
    assert.ok(analytics.browser === 'Chrome' || analytics.browser === 'Unknown');
    assert.ok(analytics.os === 'Windows' || analytics.os === 'Unknown');
    assert.ok(analytics.country === 'US' || analytics.country === 'Unknown');
    assert.ok(analytics.deviceType === 'Desktop' || analytics.deviceType === 'Unknown');
  } finally {
    server.close();
  }
});

test('POST /api/v1/urls accepts expiration dates and rejects expired values', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const futureDate = new Date(Date.now() + 60_000).toISOString();
    const createResponse = await fetch(`http://127.0.0.1:${address.port}/api/v1/urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalUrl: 'https://example.com/expiring', expiresAt: futureDate })
    });

    assert.equal(createResponse.status, 201);
    const created = await createResponse.json();
    assert.equal(created.expiresAt, futureDate);

    const pastDate = new Date(Date.now() - 60_000).toISOString();
    const invalidResponse = await fetch(`http://127.0.0.1:${address.port}/api/v1/urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalUrl: 'https://example.com/expired', expiresAt: pastDate })
    });

    assert.equal(invalidResponse.status, 400);
    const invalidBody = await invalidResponse.json();
    assert.equal(invalidBody.message, 'Expiration date must be in the future');
  } finally {
    server.close();
  }
});

test('register/login enables authenticated URL ownership', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const email = `authuser${Date.now()}@example.com`;
    const password = 'secret123';

    const registerResponse = await fetch(`http://127.0.0.1:${address.port}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    assert.equal(registerResponse.status, 201);
    const registerData = await registerResponse.json();
    assert.ok(registerData.token);
    assert.equal(registerData.user.email, email);

    const loginResponse = await fetch(`http://127.0.0.1:${address.port}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    assert.equal(loginResponse.status, 200);
    const loginData = await loginResponse.json();
    assert.ok(loginData.token);

    const createResponse = await fetch(`http://127.0.0.1:${address.port}/api/v1/urls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginData.token}`
      },
      body: JSON.stringify({ originalUrl: 'https://example.net/auth' })
    });

    assert.equal(createResponse.status, 201);
    const created = await createResponse.json();
    assert.equal(created.userId, loginData.user.id);

    const getResponse = await fetch(`http://127.0.0.1:${address.port}/api/v1/urls/${created.id}`, {
      headers: { Authorization: `Bearer ${loginData.token}` }
    });

    assert.equal(getResponse.status, 200);
    const fetched = await getResponse.json();
    assert.equal(fetched.id, created.id);
  } finally {
    server.close();
  }
});
