import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { UserRole } from './domain';

export interface Actor {
  id: string;
  role: UserRole;
  isVerifiedUploader: boolean;
  sessionId: string;
}

export const ACCESS_MODE = 'anistream:access';
export const REQUIRED_ROLES = 'anistream:roles';

export const Public = () => SetMetadata(ACCESS_MODE, 'public');
export const OptionalAuth = () => SetMetadata(ACCESS_MODE, 'optional');
export const Roles = (...roles: UserRole[]) => SetMetadata(REQUIRED_ROLES, roles);

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  return context.switchToHttp().getRequest<{ user?: Actor }>().user;
});