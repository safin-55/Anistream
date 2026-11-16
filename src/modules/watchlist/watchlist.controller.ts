import { Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Actor, CurrentUser } from '../../common/access';
import { PaginationDto } from '../../common/pagination';
import { WatchlistService } from './watchlist.service';

@ApiTags('My watchlist')
@ApiBearerAuth()
@Controller('me/watchlist')
export class WatchlistController {
  constructor(private readonly watchlist: WatchlistService) {}
  @Get()
  list(@CurrentUser() actor: Actor, @Query() query: PaginationDto) {
    return this.watchlist.list(actor.id, query);
  }
  @Put(':animeId')
  add(@CurrentUser() actor: Actor, @Param('animeId', ParseUUIDPipe) animeId: string) {
    return this.watchlist.add(actor.id, animeId);
  }
  @Delete(':animeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() actor: Actor, @Param('animeId', ParseUUIDPipe) animeId: string) {
    return this.watchlist.remove(actor.id, animeId);
  }
}
