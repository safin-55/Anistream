
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
import { Actor, CurrentUser, Public, Roles } from '../../common/access';
import { UserRole } from '../../common/domain';
import { PaginationDto } from '../../common/pagination';
import {
  EpisodeReadsService,
  episodeView,
} from './episode-reads.service';
import { EpisodeWritesService } from './episode-writes.service';
import {
  CreateEpisodeDto,
  EpisodeQueryDto,
  UpdateEpisodeDto,
} from './dto/episode.dto';
import { PlaybackService } from './playback.service';

@ApiTags('Episodes and playback')
@Public()
@Controller()
export class EpisodesController {
  constructor(
    private readonly episodes: EpisodeReadsService,
    private readonly playback: PlaybackService,
  ) {}

  @Get('seasons/:id/episodes')
  list(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: PaginationDto,
  ) {
    return this.episodes.listPublic(id, query);
  }

  @Get('episodes/:id')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    return episodeView(await this.episodes.get(id));
  }

  @Get('episodes/:id/playback')
  @ApiOperation({
    summary:
      'Resolve a published episode’s approved source and adjacent episodes',
  })
  source(@Param('id', ParseUUIDPipe) id: string) {
    return this.playback.get(id);
  }
}

@ApiTags('Admin · episodes')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('admin/episodes')
export class AdminEpisodesController {
  constructor(
    private readonly reads: EpisodeReadsService,
    private readonly writes: EpisodeWritesService,
  ) {}

  @Get()
  list(@Query() query: EpisodeQueryDto) {
    return this.reads.listAdmin(query);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.reads.get(id, true);
  }

  @Post()
  create(@Body() dto: CreateEpisodeDto, @CurrentUser() actor: Actor) {
    return this.writes.create(dto, actor.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEpisodeDto,
    @CurrentUser() actor: Actor,
  ) {
    return this.writes.update(id, dto, actor.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: Actor) {
    return this.writes.remove(id, actor.id);
  }
}
