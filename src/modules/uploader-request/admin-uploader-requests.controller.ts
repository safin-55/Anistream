import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Actor, CurrentUser, Roles } from '../../common/access';
import { UserRole } from '../../common/domain';
import { PaginationDto } from '../../common/pagination';
import { ReviewUploaderRequestDto } from './dto/review-uploader-request.dto';
import { UploaderRequestService } from './uploader-request.service';
import { UploaderReviewService } from './uploader-review.service';

@ApiTags('Admin uploader requests')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('admin/uploader-requests')
export class AdminUploaderRequestsController {
  constructor(
    private readonly requests: UploaderRequestService,
    private readonly reviews: UploaderReviewService,
  ) {}

  @Get()
  list(@Query() query: PaginationDto) {
    return this.requests.list(query);
  }

  @Patch(':id')
  review(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() actor: Actor,
    @Body() dto: ReviewUploaderRequestDto,
  ) {
    return this.reviews.review(id, actor.id, dto);
  }
}