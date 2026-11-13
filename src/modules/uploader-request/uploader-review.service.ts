import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { recordAudit } from '../../common/audit';
import { UploaderStatus } from '../../common/domain';
import { User } from '../user/entities/user.entity';
import { ReviewUploaderRequestDto } from './dto/review-uploader-request.dto';
import { UploaderRequest } from './entities/uploader-request.entity';

@Injectable()
export class UploaderReviewService {
  constructor(private readonly db: DataSource) {}

  review(id: string, reviewerId: string, dto: ReviewUploaderRequestDto) {
    return this.db.transaction(async manager => {
      const requests = manager.getRepository(UploaderRequest);
      const initial = await requests.findOneBy({ id });

      if (!initial) throw new NotFoundException('Uploader request not found');

      const users = manager.getRepository(User);
      const user = await users.findOne({
        where: { id: initial.userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) throw new NotFoundException('Applicant not found');

      const request = await requests.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!request || request.status !== UploaderStatus.PENDING) {
        throw new ConflictException('This request is no longer pending');
      }

      const approved = dto.decision === UploaderStatus.APPROVED;
      request.status = dto.decision;
      request.reviewedBy = reviewerId;
      request.reviewedAt = new Date();
      request.reviewNote = dto.note ?? null;

      await requests.save(request);

      if (approved) {
        await users.update(user.id, { isVerifiedUploader: true });
      }

      await recordAudit(
        manager,
        reviewerId,
        approved ? 'approve' : 'reject',
        'uploader_request',
        id,
        { userId: user.id, status: dto.decision },
      );

      return request;
    });
  }
}