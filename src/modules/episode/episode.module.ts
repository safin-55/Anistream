
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  EpisodesController,
  AdminEpisodesController,
} from './episode.controller';
import { EpisodeReadsService } from './episode-reads.service';
import { EpisodeWritesService } from './episode-writes.service';
import { ApprovedMediaService } from './approved-media.service';
import { PlaybackService } from './playback.service';
import { Episode } from './entities/episode.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Episode]),
  ],
  controllers: [
    EpisodesController,
    AdminEpisodesController,
  ],
  providers: [
    EpisodeReadsService,
    EpisodeWritesService,
    ApprovedMediaService,
    PlaybackService,
  ],
})
export class EpisodeModule {}
