import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Actor } from '../../common/access';
import { UserService, userView } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { hashPassword, passwordMatches } from './passwords';
import { SessionsService } from './sessions.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserService,
    private readonly sessions: SessionsService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await hashPassword(dto.password);
    const user = await this.users.create(dto.username, dto.email, passwordHash);
    return userView(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findForLogin(dto.email);
    const matches = await passwordMatches(dto.password, user?.passwordHash);

    if (!user || !matches) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    const session = await this.sessions.issue(user.id);
    return { ...session, user: userView(user) };
  }

  async me(actor: Actor) {
    return userView(await this.users.find(actor.id));
  }

  logout(actor: Actor) {
    return this.sessions.revoke(actor.sessionId, actor.id);
  }
}