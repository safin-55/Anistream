
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

import {
  Actor,
  CurrentUser,
  Public,
  Roles,
} from '../../common/access';
import { UserRole } from '../../common/domain';
import { PaginationDto } from '../../common/pagination';

import {
  CreateSeasonDto,
  SeasonQueryDto,
  UpdateSeasonDto,
} from './dto/season.dto';
import { SeasonService } from './season.service';

@ApiTags('Seasons')
@Public()
@Controller()
export class SeasonsController {
  constructor(private readonly seasons: SeasonService) {}

  @Get('anime/:id/seasons')
  list(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: PaginationDto,
  ) {
    return this.seasons.listPublic(id, query);
  }

  @Get('seasons/:id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.seasons.get(id);
  }
}

@ApiTags('Admin · seasons')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('admin/seasons')
export class AdminSeasonsController {
  constructor(private readonly seasons: SeasonService) {}

  @Get()
  list(@Query() query: SeasonQueryDto) {
    return this.seasons.listAdmin(query);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.seasons.get(id, true);
  }

  @Post()
  create(
    @Body() dto: CreateSeasonDto,
    @CurrentUser() actor: Actor,
  ) {
    return this.seasons.create(dto, actor.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSeasonDto,
    @CurrentUser() actor: Actor,
  ) {
    return this.seasons.update(id, dto, actor.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: Actor,
  ) {
    return this.seasons.remove(id, actor.id);
  }
}
