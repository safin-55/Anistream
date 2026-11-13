import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ACCESS_MODE, Actor, REQUIRED_ROLES } from '../access';
import { UserRole } from '../domain';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const mode = this.reflector.getAllAndOverride<string>(ACCESS_MODE, [
      context.getHandler(), context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest<Request>();

    if (mode === 'public' || (mode === 'optional' && !request.headers.authorization)) {
      return true;
    }

    return await super.canActivate(context) as boolean;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(REQUIRED_ROLES, [
      context.getHandler(), context.getClass(),
    ]);
    if (!roles?.length) return true;

    const { user } = context.switchToHttp().getRequest<{ user?: Actor }>();
    return !!user && roles.includes(user.role);
  }
}