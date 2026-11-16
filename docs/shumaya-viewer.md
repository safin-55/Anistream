# AniStream Viewer Features

All paths use /api/v1. Use Swagger at /api/docs for authenticated requests.

| Feature | Endpoint |
| --- | --- |
| Upload | POST /uploads |
| My uploads | GET /uploads/me |
| Public uploads | GET /uploads/public |
| Upload detail and edit | GET, PATCH and DELETE /uploads/:id |
| Play | GET /uploads/:id/stream |
| Watchlist | GET /me/watchlist and PUT or DELETE /me/watchlist/:animeId |
| Watch progress | GET /me/progress and GET, PUT or DELETE /me/progress/:episodeId |

Submit title, synopsis, visibility, rightsConfirmed=true and file as
multipart form data. Include a published genreId if you have one.
Choose public to receive a sharePath. Private clips require the owner
or admin token. The file limit is 12 MiB.

Use six original or authorized clips. Check a public stream with a
Range: bytes=0-31 header and expect 206. Test the same episode using
two viewer accounts with different lastPositionSeconds values.
