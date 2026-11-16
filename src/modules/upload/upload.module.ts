import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ManageUploadsController, AdminUploadsController } from './manage-uploads.controller';
import { PublicUploadsController } from './public-uploads.controller';
import { UploadReadsService } from './upload-reads.service';
import { UploadWritesService } from './upload-writes.service';
import { UploadStreamService } from './upload-stream.service';
import { VerifiedUploaderGuard } from './verified-uploader.guard';
import { UploadedVideo } from './entities/uploaded-video.entity';
import { UploadFile } from './entities/upload-file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UploadedVideo, UploadFile]),
    MulterModule.register({
      limits: { fileSize: 12 * 1024 * 1024, files: 1, fields: 5, parts: 7 },
    }),
  ],
  controllers: [
    ManageUploadsController, AdminUploadsController,
    PublicUploadsController,
  ],
  providers: [
    UploadReadsService,
    UploadWritesService,
    UploadStreamService,
    VerifiedUploaderGuard,
  ],
})

export class UploadModule {}
