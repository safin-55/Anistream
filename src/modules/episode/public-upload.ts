import { EntityManager } from 'typeorm';

export async function hasPublicUpload(
  manager: EntityManager, id: string, lock = false,
) {
  if (!manager.connection.hasMetadata('UploadedVideo')) return false;
  const rows = await manager.query<{ id: string }[]>(
    `SELECT id FROM uploads WHERE id = $1 AND visibility = 'public'
     ${lock ? 'FOR SHARE' : ''}`,
    [id],
  );
  return rows.length > 0;
}