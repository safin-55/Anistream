import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostgresDatabaseProviderModule } from './providers/database/postgres/provider.module';

import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [PostgresDatabaseProviderModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}