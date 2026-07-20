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
