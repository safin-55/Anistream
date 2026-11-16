
import { BadRequestException } from '@nestjs/common';

import { extname } from 'node:path';

const MP4_BRANDS = new Set([
  'isom', 'iso2', 'iso3', 'iso4', 'iso5', 'iso6', 'iso7', 'iso8', 'iso9',
  'mp41', 'mp42', 'avc1', 'dash', 'M4V ', 'MSNV', 'hvc1', 'hev1',
]);

function mp4Brand(content: Buffer, start: number, end: number) {
  if (end - start < 8 || (end - start) % 4 !== 0) return false;

  if (MP4_BRANDS.has(content.toString('ascii', start, start + 4))) return true;

  // The second 4-byte field is a minor version, followed by compatible brands.
  for (let index = start + 8; index < end; index += 4) {
    if (MP4_BRANDS.has(content.toString('ascii', index, index + 4))) return true;
  }

  return false;
}

function hasMp4Boxes(content: Buffer) {
  let offset = 0;
  let metadata = false;
  let media = false;
  let boxes = 0;

  while (offset < content.length) {
    const remaining = content.length - offset;

    if (remaining < 8 || ++boxes > 10_000) return false;

    let size = content.readUInt32BE(offset);
    const type = content.toString('ascii', offset + 4, offset + 8);
    let headerLength = 8;

    if (size === 1) {
      if (remaining < 16) return false;

      const extended = content.readBigUInt64BE(offset + 8);

      if (extended > BigInt(remaining)) return false;

      size = Number(extended);
      headerLength = 16;
    } else if (size === 0) {
      size = remaining;
    }

    if (size < headerLength || size > remaining) return false;

    if (offset === 0 && (type !== 'ftyp' || !mp4Brand(content, offset + headerLength, offset + size))) {
      return false;
    }

    if (type === 'moov' && size > headerLength) metadata = true;
    if (type === 'mdat' && size > headerLength) media = true;

    offset += size;
  }

  return metadata && media;
}

export function validateMp4(file: Express.Multer.File | undefined) {
  if (!file) throw new BadRequestException('file is required');

  if (extname(file.originalname).toLowerCase() !== '.mp4'
    || !['video/mp4', 'application/octet-stream'].includes(file.mimetype)
    || !hasMp4Boxes(file.buffer)) {
    throw new BadRequestException('file must be a valid MP4 container with a .mp4 extension');
  }

  return file.buffer;
}
