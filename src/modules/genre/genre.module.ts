import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Genre } from './entities/genre.entity';

import { AdminGenresController, GenresController } from './genre.controller';

import { GenreService } from './genre.service';
 
@Module({

  imports: [TypeOrmModule.forFeature([Genre])],

  controllers: [GenresController, AdminGenresController],

  providers: [GenreService],

})

export class GenreModule {}
 