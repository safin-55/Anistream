
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  containsText,
  offsetOf,
  PageResult,
} from '../../common/pagination';
import { DiscoveryQueryDto } from './dto/discovery.dto';

interface CatalogueRow {
  id: string;
  title: string;
  synopsis: string;
  kind: 'anime' | 'upload';
  posterUrl: string | null;
  createdAt: Date;
}

@Injectable()
export class DiscoveryService {
  constructor(private readonly db: DataSource) {}

  async list(query: DiscoveryQueryDto) {
    const anime = `
      SELECT a.id, a.title, a.synopsis, 'anime' AS kind,
      a.poster_url AS "posterUrl", a.created_at AS "createdAt"
      FROM anime a
      WHERE a.is_published
        AND ($1::text IS NULL OR a.title ILIKE $1)
        AND ($2::uuid IS NULL OR EXISTS (
          SELECT 1 FROM anime_genres ag
          JOIN genres g ON g.id = ag.genre_id
          WHERE ag.anime_id = a.id
            AND g.id = $2 AND g.is_published
        ))
        AND ($3::text IS NULL OR $3 = 'anime')
        AND ($4::text IS NULL OR a.status = $4)
    `;

    const uploads = `
      UNION ALL
      SELECT u.id, u.title, u.synopsis, 'upload' AS kind,
      NULL, u.created_at
      FROM uploads u
      WHERE u.visibility = 'public'
        AND ($1::text IS NULL OR u.title ILIKE $1)
        AND ($2::uuid IS NULL OR EXISTS (
          SELECT 1 FROM genres g
          WHERE g.id = u.genre_id
            AND g.id = $2 AND g.is_published
        ))
        AND ($3::text IS NULL OR $3 = 'upload')
        AND $4::text IS NULL
    `;

    const filtered = this.db.hasMetadata('UploadedVideo')
      ? anime + uploads
      : anime;

    const args = [
      query.q ? containsText(query.q) : null,
      query.genreId ?? null,
      query.kind ?? null,
      query.status ?? null,
    ];

    const [rows, counts] = await Promise.all([
      this.db.query<CatalogueRow[]>(
        `
          SELECT * FROM (${filtered}) AS catalogue
          ORDER BY "createdAt" DESC, id DESC, kind ASC
          LIMIT $5 OFFSET $6
        `,
        [...args, query.limit, offsetOf(query)],
      ),
      this.db.query<{ total: string }[]>(
        `SELECT count(*) AS total FROM (${filtered}) AS catalogue`,
        args,
      ),
    ]);

    const data = rows.map((row) => ({
      ...row,
      detailPath: `/api/v1/${
        row.kind === 'anime' ? 'anime' : 'uploads'
      }/${row.id}`,
    }));

    return new PageResult(data, Number(counts[0].total), query);
  }
}
