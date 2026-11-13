import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { LessThanOrEqual, Repository } from 'typeorm';
import { AuthSession } from './entities/auth-session.entity';
import { JWT_AUDIENCE, JWT_ISSUER, JWT_TTL_SECONDS, jwtSecret } from './jwt-settings';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(AuthSession)
    private readonly sessions: Repository<AuthSession>,
    private readonly jwt: JwtService,
  ) {}

  async issue(userId: string) {
    const id = randomUUID();

    const accessToken = await this.jwt.signAsync({}, {
      algorithm: 'HS256',
      secret: jwtSecret(),
      subject: userId,
      jwtid: id,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      expiresIn: JWT_TTL_SECONDS,
    });

    await this.sessions.delete({ userId, expiresAt: LessThanOrEqual(new Date()) });
    await this.sessions.insert({
      id,
      userId,
      expiresAt: new Date(Date.now() + JWT_TTL_SECONDS * 1000),
    });

    return { accessToken, tokenType: 'Bearer', expiresIn: JWT_TTL_SECONDS };
  }

  async revoke(id: string, userId: string) {
    await this.sessions.delete({ id, userId });
  }
}