import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from '../../common/access';
import { UserRole } from '../../common/domain';
import { offsetOf, PageResult, PaginationDto } from '../../common/pagination';
import { AuditLog } from './entities/audit-log.entity';

@ApiTags('Admin audit')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('admin/audit-logs')
export class AuditLogController {
  constructor(
    @InjectRepository(AuditLog)
    private readonly logs: Repository<AuditLog>,
  ) {}

  @Get()
  async list(@Query() query: PaginationDto) {
    const [rows, total] = await this.logs.findAndCount({
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: offsetOf(query),
      take: query.limit,
    });

    return new PageResult(rows, total, query);
  }
}