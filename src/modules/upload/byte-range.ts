
interface ByteRange {
  start: number;
  end: number;
  partial: boolean;
}

export function selectByteRange(header: string | undefined, size: number): ByteRange | undefined {
  if (header === undefined) return { start: 0, end: size - 1, partial: false };

  const match = /^bytes=(\d*)-(\d*)$/i.exec(header.trim());
  if (!match || (!match[1] && !match[2])) return undefined;

  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return undefined;
    return { start: Math.max(0, size - suffix), end: size - 1, partial: true };
  }

  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : size - 1;

  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || end < start) {
    return undefined;
  }

  return { start, end: Math.min(end, size - 1), partial: true };
}
