import { EntityManager } from 'typeorm';

export type AuditEntity =
  | 'genre'
  | 'anime'
  | 'season'
  | 'episode'
  | 'uploader_request'
  | 'upload';

export async function recordAudit(
  manager: EntityManager,
  actorId: string,
  action: string,
  entity: string,
  entityId: string,
  detail: Record<string, unknown> | null = null,
) {
  await manager.query(
    'INSERT INTO audit_logs (actor_id, action, entity, entity_id, detail) VALUES ($1,$2,$3,$4,$5)',
    [actorId, action, entity, entityId, detail],
  );
}