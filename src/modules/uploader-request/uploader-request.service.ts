import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UploaderStatus, UserRole } from '../../common/domain';
import { offsetOf, PageResult, PaginationDto } from '../../common/pagination';
import { User } from '../user/entities/user.entity';
import { SubmitUploaderRequestDto } from './dto/submit-uploader-request.dto';
import { UploaderRequest } from './entities/uploader-request.entity';

@Injectable()
export class UploaderRequestService {
  constructor(
    private readonly db: DataSource,
    @InjectRepository(UploaderRequest)
    private readonly requests: Repository<UploaderRequest>,
  ) {}

  submit(userId: string, dto: SubmitUploaderRequestDto) {
    return this.db.transaction(async manager => {
      const user = await manager.getRepository(User).findOne({
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) throw new NotFoundException('Applicant not found');

      if (user.role === UserRole.ADMIN || user.isVerifiedUploader) {
        throw new ConflictException('This account already has upload access');
      }

      const requests = manager.getRepository(UploaderRequest);
      if (await requests.existsBy({ userId, status: UploaderStatus.PENDING })) {
        throw new ConflictException('A request is already pending');
      }

      return requests.save(requests.create({ userId, reason: dto.reason }));
    });
  }

  async list(query: PaginationDto, userId?: string) {
    const [rows, total] = await this.requests.findAndCount({
      where: userId ? { userId } : {},
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: offsetOf(query),
      take: query.limit,
    });

    return new PageResult(rows, total, query);
  }
}