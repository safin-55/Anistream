
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostgresDatabaseProviderModule } from './providers/database/postgres/provider.module';

import { AuthModule } from './modules/auth/auth.module';
import { UploaderRequestModule } from './modules/uploader-request/uploader-request.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';

// Catalogue modules
import { AnimeModule } from './modules/anime/anime.module';
import { GenreModule } from './modules/genre/genre.module';
import { SeasonModule } from './modules/season/season.module';
import { EpisodeModule } from './modules/episode/episode.module';
import { DiscoveryModule } from './modules/discovery/discovery.module';

@Module({
  imports: [
    PostgresDatabaseProviderModule,
    AuthModule,
    UploaderRequestModule,
    AuditLogModule,

    // Catalogue modules
    AnimeModule,
    GenreModule,
    SeasonModule,
    EpisodeModule,
    DiscoveryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
