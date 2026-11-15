import {

  Body,

  Controller,

  Delete,

  Get,

  HttpCode,

  HttpStatus,

  Param,

  ParseUUIDPipe,

  Patch,

  Post,

  Query,

} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Actor, CurrentUser, Public, Roles } from '../../common/access';

import { UserRole } from '../../common/domain';

import { PaginationDto } from '../../common/pagination';

import { CreateGenreDto, UpdateGenreDto } from './dto/genre.dto';

import { GenreService } from './genre.service';
 
@ApiTags('Genres')

@Public()

@Controller('genres')

export class GenresController {

  constructor(private readonly genres: GenreService) {}
 
  @Get()

  list(@Query() query: PaginationDto) {

    return this.genres.list(query);

  }
 
  @Get(':id')

  get(@Param('id', ParseUUIDPipe) id: string) {

    return this.genres.get(id);

  }

}
 
@ApiTags('Admin · genres')

@ApiBearerAuth()

@Roles(UserRole.ADMIN)

@Controller('admin/genres')

export class AdminGenresController {

  constructor(private readonly genres: GenreService) {}
 
  @Get()

  list(@Query() query: PaginationDto) {

    return this.genres.list(query, true);

  }
 
  @Get(':id')

  get(@Param('id', ParseUUIDPipe) id: string) {

    return this.genres.get(id, true);

  }
 
  @Post()

  create(@Body() dto: CreateGenreDto, @CurrentUser() actor: Actor) {

    return this.genres.create(dto, actor.id);

  }
 
  @Patch(':id')

  update(

    @Param('id', ParseUUIDPipe) id: string,

    @Body() dto: UpdateGenreDto,

    @CurrentUser() actor: Actor,

  ) {

    return this.genres.update(id, dto, actor.id);

  }
 
  @Delete(':id')

  @HttpCode(HttpStatus.NO_CONTENT)

  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: Actor) {

    return this.genres.remove(id, actor.id);

  }

}
 