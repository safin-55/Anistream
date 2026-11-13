export const JWT_ISSUER = 'anistream';
export const JWT_AUDIENCE = 'anistream-api';
export const JWT_TTL_SECONDS = 3600;

export function jwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('Set JWT_SECRET to at least 32 bytes in .env');
  }

  return secret;
}