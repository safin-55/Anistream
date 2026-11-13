# AniStream Backend

NestJS REST API for anime discovery and authorized video streaming.

## Local setup

Install Node.js 24 and start Docker Desktop. From the project folder, run:

```bash
npm ci
cp -n .env.example .env
docker compose up -d --wait db
npm run db:migrate
npm run dev
```

Health check: http://127.0.0.1:3000/api/v1/health
Swagger: http://127.0.0.1:3000/api/docs
 The team starter tag is `anistream-start`.
