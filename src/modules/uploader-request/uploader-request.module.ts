import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUploaderRequestsController } from './admin-uploader-requests.controller';
import { UploaderRequest } from './entities/uploader-request.entity';
import { UploaderRequestService } from './uploader-request.service';
import { UploaderRequestsController } from './uploader-requests.controller';
import { UploaderReviewService } from './uploader-review.service';

@Module({
  imports: [TypeOrmModule.forFeature([UploaderRequest])],
  controllers: [UploaderRequestsController, AdminUploaderRequestsController],
  providers: [UploaderRequestService, UploaderReviewService],
})
export class UploaderRequestModule {}
