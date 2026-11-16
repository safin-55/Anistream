import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post,
  Query, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Actor, CurrentUser, Roles } from '../../common/access';
import { UserRole } from '../../common/domain';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { ManagedUploadQueryDto } from './dto/upload-query.dto';
import { UploadReadsService } from './upload-reads.service';
import { UploadWritesService } from './upload-writes.service';
import { validateMp4 } from './validate-mp4';
import { VerifiedUploaderGuard } from './verified-uploader.guard';

class UploadMultipartDto extends CreateUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file!: unknown;
}

@ApiTags('Creator uploads')
@ApiBearerAuth()
@Controller('uploads')
export class ManageUploadsController {
  constructor(private readonly reads: UploadReadsService, private readonly writes: UploadWritesService) {}
  @Post()
  @UseGuards(VerifiedUploaderGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadMultipartDto })
  @ApiOperation({ summary: 'Upload an authorized MP4 as an approved creator or admin' })
  create(@CurrentUser() actor: Actor, @Body() dto: CreateUploadDto, @UploadedFile() file?: Express.Multer.File) {
    return this.writes.create(actor, dto, validateMp4(file));
  }
  @Get('me')
  @ApiOperation({ summary: 'List your own public and private uploads' })
  mine(@CurrentUser() actor: Actor, @Query() query: ManagedUploadQueryDto) {
    return this.reads.listMine(actor.id, query);
  }
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: Actor, @Body() dto: UpdateUploadDto) {
    return this.writes.update(id, actor, dto);
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: Actor) {
    return this.writes.remove(id, actor);
  }
}

@ApiTags('Admin · uploads')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('admin/uploads')
export class AdminUploadsController {
  constructor(private readonly uploads: UploadReadsService) {}
  @Get()
  list(@Query() query: ManagedUploadQueryDto) {
    return this.uploads.listAdmin(query);
  }
}
