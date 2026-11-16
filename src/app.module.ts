import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostgresDatabaseProviderModule } from './providers/database/postgres/provider.module';

import { AuthModule } from './modules/auth/auth.module';
import { UploaderRequestModule } from './modules/uploader-request/uploader-request.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { UploadModule } from './modules/upload/upload.module';
import { WatchlistModule } from './modules/watchlist/watchlist.module';
import { WatchProgressModule } from './modules/watch-progress/watch-progress.module';

@Module({
  imports: [
    PostgresDatabaseProviderModule,
    AuthModule,
    UploaderRequestModule,
    AuditLogModule,
    UploadModule,
    WatchlistModule,
    WatchProgressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}