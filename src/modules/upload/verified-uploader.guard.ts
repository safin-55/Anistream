
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

import { Actor } from '../../common/access';

import { UserRole } from '../../common/domain';

@Injectable()
export class VerifiedUploaderGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const { user } = context.switchToHttp().getRequest<{ user?: Actor }>();

    if (user?.role === UserRole.ADMIN || user?.isVerifiedUploader) return true;

    throw new ForbiddenException('Uploader approval is required');
  }
}
