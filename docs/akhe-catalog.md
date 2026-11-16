# AniStream Catalogue

All paths use /api/v1. Swagger is available at /api/docs.

Admin endpoints use a bearer JWT.

| Feature | Endpoints |
| --- | --- |
| Public discovery | GET /catalog and GET /anime |
| Public details | GET /genres/:id and GET /anime/:id |
| Published seasons | GET /anime/:id/seasons and GET /seasons/:id |
| Published episodes | GET /seasons/:id/episodes and GET /episodes/:id |
| Playback | GET /episodes/:id/playback |
| Admin CRUD | GET and POST /admin/genres, /admin/anime, /admin/seasons and /admin/episodes |
| Admin record | GET, PATCH and DELETE under each collection at /:id |

Use page and limit for pagination. The public anime list accepts q,
genreId, status and featured. Drafts stay out of public reads.

## Rollback demonstration

As admin, create an anime with a new slug and a nonexistent genre UUID.
Expect 409. Repeat with the same slug and a real genre UUID. Expect 201.
The successful reuse of the slug demonstrates that the failed insert
was rolled back. Run node test/akhe-catalog-smoke.mjs with the local API
running and media.example.test present in MEDIA_HOSTS.