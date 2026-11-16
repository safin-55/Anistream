
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  SeasonsController,
  AdminSeasonsController,
} from './season.controller';
import { SeasonService } from './season.service';
import { Season } from './entities/season.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Season]),
  ],
  controllers: [
    SeasonsController,
    AdminSeasonsController,
  ],
  providers: [
    SeasonService,
  ],
})
export class SeasonModule {}
