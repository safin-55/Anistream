
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnimeController, AdminAnimeController } from './anime.controller';
import { AnimeReadsService } from './anime-reads.service';
import { AnimeWritesService } from './anime-writes.service';
import { Anime } from './entities/anime.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Anime]),
  ],
  controllers: [
    AnimeController,
    AdminAnimeController,
  ],
  providers: [
    AnimeReadsService,
    AnimeWritesService,
  ],
})
export class AnimeModule {}
