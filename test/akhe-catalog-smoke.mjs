
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
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
    assert.fail(
      `${method} ${path} returned ${response.status}, expected ${status}. ${await response.text()}`,
    );
  }

  return response;
}

async function json(method, path, status, options) {
  const body = await (await request(method, path, status, options)).json();

  return body?.success === true && !Array.isArray(body.data)
    ? body.data
    : body;
}

async function login(email, password) {
  const result = await json('POST', '/auth/login', 200, {
    json: { email, password },
  });

  assert.ok(result.accessToken);

  return result.accessToken;
}

async function viewer(index) {
  const username = `demo_${suffix}_${index}`;
  const email = `${username}@anistream.test`;

  await request('POST', '/auth/register', 201, {
    json: {
      username,
      email,
      password: demoPassword,
    },
  });

  return login(email, demoPassword);
}

const admin = await login(
  process.env.ADMIN_EMAIL,
  process.env.ADMIN_PASSWORD,
);

const create = (path, body) =>
  json('POST', '/admin/' + path, 201, {
    token: admin,
    json: body,
  });

const member = await viewer('member');

await request('GET', '/admin/genres', 401);
await request('GET', '/admin/genres', 403, {
  token: member,
});

const genre = await create('genres', {
  name: `Adventure ${suffix}`,
  isPublished: true,
});

await request('POST', '/admin/genres', 409, {
  token: admin,
  json: {
    name: `ADVENTURE ${suffix}`,
  },
});

const fields = {
  slug: `star-harbor-${suffix}`,
  title: `Star Harbor ${suffix}`,
  synopsis: 'An original classroom series.',
  releaseYear: 2026,
  status: 'completed',
  isPublished: true,
};

await request('POST', '/admin/anime', 400, {
  token: admin,
  json: {
    ...fields,
    releaseYear: 1800,
  },
});

await request('POST', '/admin/anime', 409, {
  token: admin,
  json: {
    ...fields,
    genreIds: ['11111111-1111-4111-8111-111111111111'],
  },
});

const anime = await create('anime', {
  ...fields,
  genreIds: [genre.id],
});

const season = await create('seasons', {
  animeId: anime.id,
  seasonNumber: 1,
  title: 'Season One',
  isPublished: true,
});

const episode = await create('episodes', {
  seasonId: season.id,
  episodeNumber: 1,
  title: 'First Signal',
  synopsis: 'A sample episode.',
  durationSeconds: 3,
  isPublished: true,
  playback: {
    type: 'direct',
    url: 'https://media.example.test/class.mp4',
  },
});

const playback = await json(
  'GET',
  `/episodes/${episode.id}/playback`,
  200,
);

assert.equal(
  playback.url,
  'https://media.example.test/class.mp4',
);

const results = await json(
  'GET',
  `/catalog?q=${encodeURIComponent(fields.title)}`,
  200,
);

assert.equal(results.data[0].id, anime.id);

await request('PATCH', `/admin/anime/${anime.id}`, 200, {
  token: admin,
  json: { isPublished: false },
});

await request(
  'GET',
  `/episodes/${episode.id}/playback`,
  404,
);

await request('DELETE', `/admin/anime/${anime.id}`, 204, {
  token: admin,
});

await request('DELETE', `/admin/genres/${genre.id}`, 204, {
  token: admin,
});

console.log('Catalogue smoke test passed.');
