import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });
const base = `http://127.0.0.1:${process.env.PORT || 3000}/api/v1`;
const suffix = randomBytes(5).toString('hex');
const demoPassword = 'LocalDemoViewer-2026!';
async function request(method, path, status, options = {}) {
  const { token, json, form, headers = {} } = options;
  const response = await fetch(base + path, {
    method,
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: form ?? (json === undefined ? undefined : JSON.stringify(json)),
  });
  if (response.status !== status) {
    assert.fail(`${method} ${path} returned ${response.status}, expected ${status}. ${await response.text()}`);
  }
  return response;
}

async function json(method, path, status, options) {
  const body = await (await request(method, path, status, options)).json();
  return body?.success === true && !Array.isArray(body.data) ? body.data : body;
}

async function login(email, password) {
  const result = await json('POST', '/auth/login', 200, { json: { email, password } });
  assert.ok(result.accessToken);
  return result.accessToken;
}

async function viewer(index) {
  const username = `demo_${suffix}_${index}`;
  const email = `${username}@anistream.test`;
  await request('POST', '/auth/register', 201, {
    json: { username, email, password: demoPassword },
  });
  return login(email, demoPassword);
}

const admin = await login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
const create = (path, body) => json('POST', '/admin/' + path, 201, { token: admin, json: body });
const owner = await viewer('owner');
const other = await viewer('other');
const bytes = await readFile('samples/sample-01.mp4');
function form(visibility, file = bytes) {
  const data = new FormData();
  data.set('title', `Demo clip ${suffix}`);
  data.set('synopsis', 'An original classroom test video.');
  data.set('visibility', visibility);
  data.set('rightsConfirmed', 'true');
  data.set('file', new Blob([file], { type: 'video/mp4' }), 'sample.mp4');
  return data;
}

await request('POST', '/uploads', 403, { token: owner, form: form('public') });
const application = await json('POST', '/uploader-requests', 201, {
  token: owner, json: { reason: 'I created an original video for the classroom demo.' },
});

await request('PATCH', `/admin/uploader-requests/${application.id}`, 200, {
  token: admin, json: { decision: 'approved' },
});

await request('POST', '/uploads', 400, { token: owner, form: form('public', Buffer.from('fake')) });
const publicClip = await json('POST', '/uploads', 201, { token: owner, form: form('public') });
const privateClip = await json('POST', '/uploads', 201, { token: owner, form: form('private') });
assert.ok(publicClip.sharePath);
assert.equal(privateClip.sharePath, null);
await request('GET', `/uploads/${privateClip.id}/stream`, 404, { token: other });
await request('GET', `/uploads/${privateClip.id}/stream`, 200, { token: admin });
const stream = `/uploads/${publicClip.id}/stream`;
const partial = await request('GET', stream, 206, { headers: { Range: 'bytes=0-31' } });
assert.deepEqual(Buffer.from(await partial.arrayBuffer()), bytes.subarray(0, 32));
await request('GET', stream, 416, { headers: { Range: 'bytes=999999999-' } });
const anime = await create('anime', {
  slug: `viewer-test-${suffix}`, title: 'Viewer test', synopsis: 'A demo.',
  releaseYear: 2026, status: 'completed', isPublished: true,
});

const season = await create('seasons', {
  animeId: anime.id, seasonNumber: 1, title: 'First season', isPublished: true,
});

const episode = await create('episodes', {
  seasonId: season.id, episodeNumber: 1, title: 'First episode',
  synopsis: 'A demo episode.', durationSeconds: 3, isPublished: true,
  playback: { type: 'upload', uploadId: publicClip.id },
});

const watchlist = `/me/watchlist/${anime.id}`;
const firstSave = await json('PUT', watchlist, 200, { token: owner });
const secondSave = await json('PUT', watchlist, 200, { token: owner });
assert.equal(firstSave.addedAt, secondSave.addedAt);
const progress = `/me/progress/${episode.id}`;
await request('PUT', progress, 400, { token: owner, json: { lastPositionSeconds: 4 } });
await request('PUT', progress, 200, { token: owner, json: { lastPositionSeconds: 1 } });
await request('PUT', progress, 200, { token: other, json: { lastPositionSeconds: 2 } });
assert.equal((await json('GET', progress, 200, { token: owner })).lastPositionSeconds, 1);
assert.equal((await json('GET', progress, 200, { token: other })).lastPositionSeconds, 2);
await request('DELETE', `/admin/anime/${anime.id}`, 204, { token: admin });
await request('DELETE', `/uploads/${privateClip.id}`, 204, { token: owner });
await request('DELETE', `/uploads/${publicClip.id}`, 204, { token: owner });
console.log('Viewer smoke test passed.');
