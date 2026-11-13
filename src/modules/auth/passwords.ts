import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;
const DUMMY_HASH = '$2b$12$hQdtMrMsP1vnMp2c1g6OV.qXxQVHE7rgopUKzRDA.Y79bdRqMU3LO';

export function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function passwordMatches(password: string, storedHash?: string) {
  return bcrypt.compare(password, storedHash ?? DUMMY_HASH);
}