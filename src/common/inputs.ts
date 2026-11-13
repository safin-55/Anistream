import { Transform } from 'class-transformer';

export const Trim = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  );

export const NormalizeKey = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );

export function httpsUrl(value: string): URL | undefined {
  try {
    const url = new URL(value);

    if (url.protocol === 'https:' && !url.username && !url.password && !url.port) {
      return url;
    }
  } catch {
    return undefined;
  }

  return undefined;
}