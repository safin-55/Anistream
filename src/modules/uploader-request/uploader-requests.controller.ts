import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Actor, CurrentUser } from '../../common/access';
import { PaginationDto } from '../../common/pagination';
import { SubmitUploaderRequestDto } from './dto/submit-uploader-request.dto';
import { UploaderRequestService } from './uploader-request.service';

@ApiTags('Uploader requests')
@ApiBearerAuth()
@Controller('uploader-requests')
export class UploaderRequestsController {
  constructor(private readonly requests: UploaderRequestService) {}

  @Post()
  submit(@CurrentUser() actor: Actor, @Body() dto: SubmitUploaderRequestDto) {
    return this.requests.submit(actor.id, dto);
  }

  @Get()
  list(@CurrentUser() actor: Actor, @Query() query: PaginationDto) {
    return this.requests.list(query, actor.id);
  }
}