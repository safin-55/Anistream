import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostgresDatabaseProviderModule } from './providers/database/postgres/provider.module';

import { AuthModule } from './modules/auth/auth.module';
import { UploaderRequestModule } from './modules/uploader-request/uploader-request.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';

@Module({
  imports: [PostgresDatabaseProviderModule, AuthModule , UploaderRequestModule,AuditLogModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}