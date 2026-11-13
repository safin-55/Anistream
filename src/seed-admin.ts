import 'reflect-metadata';
import { isEmail, minLength } from 'class-validator';
import { UserRole } from './common/domain';
import dataSource from './database/data-source';
import { USERNAME_PATTERN } from './modules/auth/dto/register.dto';
import { hashPassword } from './modules/auth/passwords';
import { User } from './modules/user/entities/user.entity';

async function seedAdmin() {
  const username = process.env.ADMIN_USERNAME?.trim().toLowerCase() ?? '';
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? '';
  const password = process.env.ADMIN_PASSWORD ?? '';

  if (
    !USERNAME_PATTERN.test(username) ||
    !isEmail(email) ||
    email.length > 254 ||
    !minLength(password, 10) ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    throw new Error('Set valid ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env');
  }

  await dataSource.initialize();

  try {
    const users = dataSource.getRepository(User);
    const existing = await users.findOneBy({ email });

    if (existing) {
      if (existing.role !== UserRole.ADMIN) {
        throw new Error('The admin email belongs to a viewer');
      }
      console.log('Administrator already exists. Its password was preserved.');
      return;
    }

    await users.insert({
      username,
      email,
      passwordHash: await hashPassword(password),
      role: UserRole.ADMIN,
    });

    console.log('Administrator created.');
  } finally {
    await dataSource.destroy();
  }
}

void seedAdmin().catch((error: unknown) => {
  const knownError = error instanceof Error && [
    'Set valid ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env',
    'The admin email belongs to a viewer',
  ].includes(error.message);

  console.error(knownError
    ? error.message
    : 'Admin seed failed. Check migrations, database settings and account uniqueness.');

  process.exitCode = 1;
})