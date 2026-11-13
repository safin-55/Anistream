import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

export function userView(user: User) {
  const { id, username, email, role, isVerifiedUploader, createdAt } = user;
  return { id, username, email, role, isVerifiedUploader, createdAt };
}

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  async create(username: string, email: string, passwordHash: string) {
    const user = this.users.create({ username, email, passwordHash });
    return this.users.save(user);
  }

  findForLogin(email: string) {
    return this.users.createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async find(id: string) {
    const user = await this.users.findOneBy({ id });
    if (!user) throw new UnauthorizedException('Account is unavailable');
    return user;
  }
}