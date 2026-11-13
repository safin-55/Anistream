import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import 'dotenv/config';

const base = `http://127.0.0.1:${process.env.PORT || 3000}/api/v1`;
const username = `test_${randomUUID().slice(0, 8)}`;
const email = `${username}@anistream.test`;
const password = 'Viewer-test-passphrase-1';

function send(method, path, body, token) {
  return fetch(`${base}${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function request(method, path, expected, body, token) {
  const response = await send(method, path, body, token);
  assert.equal(response.status, expected, `${method} ${path}`);
  return expected === 204 ? undefined : response.json();
}

// Registration এবং login
assert.equal((await request('GET', '/health', 200)).status, 'ok');
await request('GET', '/auth/me', 401);

const user = await request('POST', '/auth/register', 201, {
  username, email, password,
});
assert.equal(user.role, 'user');
assert.equal(user.passwordHash, undefined);
await request('POST', '/auth/register', 409, { username, email, password });
await request('POST', '/auth/login', 401, { email, password: 'incorrect' });

const { accessToken: viewer } = await request('POST', '/auth/login', 200, {
  email, password,
});
const { accessToken: admin } = await request('POST', '/auth/login', 200, {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
});
assert.ok(viewer);
assert.ok(admin);

const profileBefore = await request('GET', '/auth/me', 200, undefined, viewer);
assert.equal(profileBefore.isVerifiedUploader, false);

// একসঙ্গে দুটি আবেদন পাঠালেও একটিই গ্রহণ হবে
const path = '/uploader-requests';
const body = { reason: 'I created an original animation for the class demo.' };
const submissions = await Promise.all([
  send('POST', path, body, viewer),
  send('POST', path, body, viewer),
]);
assert.deepEqual(submissions.map(response => response.status).sort(), [201, 409]);

const application = await submissions.find(response => response.status === 201).json();
const reviewPath = `/admin/uploader-requests/${application.id}`;
const decision = { decision: 'approved' };

await request('PATCH', reviewPath, 403, decision, viewer);
const reviewed = await request('PATCH', reviewPath, 200, decision, admin);
assert.equal(reviewed.status, 'approved');
await request('PATCH', reviewPath, 409, decision, admin);

const profileAfter = await request('GET', '/auth/me', 200, undefined, viewer);
assert.equal(profileAfter.isVerifiedUploader, true);

// Audit log এবং logout
await request('GET', '/admin/audit-logs', 403, undefined, viewer);
const logs = await request('GET', '/admin/audit-logs', 200, undefined, admin);
assert.ok(logs.data.some(log =>
  log.entity === 'uploader_request' &&
  log.entityId === application.id &&
  log.action === 'approve'
));

await request('POST', '/auth/logout', 204, undefined, viewer);
await request('GET', '/auth/me', 401, undefined, viewer);

console.log('Safin identity smoke test passed.');