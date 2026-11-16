import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Actor, CurrentUser } from '../../common/access';
import { PaginationDto } from '../../common/pagination';
import { WatchProgressService } from './watch-progress.service';
import { SaveProgressDto } from './dto/save-progress.dto';

@ApiTags('My watch progress')
@ApiBearerAuth()
@Controller('me/progress')
export class ProgressController {
  constructor(private readonly progress: WatchProgressService) {}
  @Get()
  list(@CurrentUser() actor: Actor, @Query() query: PaginationDto) {
    return this.progress.list(actor.id, query);
  }
  @Get(':episodeId')
  get(@CurrentUser() actor: Actor, @Param('episodeId', ParseUUIDPipe) episodeId: string) {
    return this.progress.get(actor.id, episodeId);
  }
  @Put(':episodeId')
  save(
    @CurrentUser() actor: Actor,
    @Param('episodeId', ParseUUIDPipe) episodeId: string,
    @Body() dto: SaveProgressDto,
  ) {
    return this.progress.save(actor.id, episodeId, dto.lastPositionSeconds);
  }
  @Delete(':episodeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() actor: Actor, @Param('episodeId', ParseUUIDPipe) episodeId: string) {
    return this.progress.remove(actor.id, episodeId);
  }
}
