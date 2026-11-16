import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressController } from './watch-progress.controller';
import { WatchProgressService } from './watch-progress.service';
import { WatchProgress } from './entities/watch-progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WatchProgress]),
  ],
  controllers: [
    ProgressController,
  ],
  providers: [
    WatchProgressService,
  ],
})

export class WatchProgressModule {}
