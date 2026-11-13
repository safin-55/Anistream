import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { MoreThan, Repository } from 'typeorm';
import { Actor } from '../../common/access';
import { AuthSession } from './entities/auth-session.entity';
import { JWT_AUDIENCE, JWT_ISSUER, jwtSecret } from './jwt-settings';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(AuthSession)
    private readonly sessions: Repository<AuthSession>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret(),
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
  }

  async validate(payload: { sub?: string; jti?: string }): Promise<Actor> {
    const { sub, jti } = payload;

    if (!sub || !jti || !isUUID(sub, '4') || !isUUID(jti, '4')) {
      throw new UnauthorizedException();
    }

    const session = await this.sessions.findOne({
      where: { id: jti, userId: sub, expiresAt: MoreThan(new Date()) },
      relations: { user: true },
    });

    if (!session?.user) throw new UnauthorizedException();

    return {
      id: session.user.id,
      role: session.user.role,
      isVerifiedUploader: session.user.isVerifiedUploader,
      sessionId: session.id,
    };
  }
}