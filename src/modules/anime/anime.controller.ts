
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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  Actor,
  CurrentUser,
  Public,
  Roles,
} from '../../common/access';
import { UserRole } from '../../common/domain';

import { AnimeQueryDto } from './dto/anime-query.dto';
import { AnimeReadsService } from './anime-reads.service';
import { AnimeWritesService } from './anime-writes.service';
import { CreateAnimeDto, UpdateAnimeDto } from './dto/anime.dto';

@ApiTags('Anime')
@Public()
@Controller('anime')
export class AnimeController {
  constructor(
    private readonly anime: AnimeReadsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Browse published anime by title, genre, status and featured flag',
  })
  list(@Query() query: AnimeQueryDto) {
    return this.anime.list(query);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.anime.get(id);
  }
}

@ApiTags('Admin · anime')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('admin/anime')
export class AdminAnimeController {
  constructor(
    private readonly reads: AnimeReadsService,
    private readonly writes: AnimeWritesService,
  ) {}

  @Get()
  list(@Query() query: AnimeQueryDto) {
    return this.reads.list(query, true);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.reads.get(id, true);
  }

  @Post()
  create(
    @Body() dto: CreateAnimeDto,
    @CurrentUser() actor: Actor,
  ) {
    return this.writes.create(dto, actor.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAnimeDto,
    @CurrentUser() actor: Actor,
  ) {
    return this.writes.update(id, dto, actor.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: Actor,
  ) {
    return this.writes.remove(id, actor.id);
  }
}
