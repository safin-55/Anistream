import {
  Controller, Get, Headers, HttpException, HttpStatus, Param, ParseUUIDPipe, Query, Res, StreamableFile,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Actor, CurrentUser, OptionalAuth, Public } from '../../common/access';
import { PublicUploadQueryDto } from './dto/upload-query.dto';
import { UploadReadsService } from './upload-reads.service';
import { UploadStreamService } from './upload-stream.service';

@ApiTags('Public uploads and playback')
@Controller('uploads')
export class PublicUploadsController {
  constructor(private readonly reads: UploadReadsService, private readonly stream: UploadStreamService) {}
  @Public()
  @Get('public')
  list(@Query() query: PublicUploadQueryDto) {
    return this.reads.listPublic(query);
  }
  @OptionalAuth()
  @Get(':id')
  @ApiOperation({
    summary: 'Get a public upload or a private upload as its owner or admin',
    security: [{}, { bearer: [] }],
  })
  get(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: Actor | undefined) {
    return this.reads.get(id, actor);
  }
  @OptionalAuth()
  @Get(':id/stream')
  @ApiOperation({ summary: 'Play a public video or an authorized private video', security: [{}, { bearer: [] }] })
  @ApiHeader({ name: 'Range', required: false, example: 'bytes=0-1023' })
  @ApiProduces('video/mp4')
  @ApiResponse({ status: 200, description: 'Complete MP4 file', schema: { type: 'string', format: 'binary' } })
  @ApiResponse({ status: 206, description: 'Requested byte range', schema: { type: 'string', format: 'binary' } })
  @ApiResponse({ status: 416, description: 'Range not satisfiable' })
  async bytes(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: Actor | undefined,
    @Headers('range') header: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.stream.getBytes(id, actor, header);
    response.setHeader('Accept-Ranges', 'bytes');
    if (!result.range) {
      response.setHeader('Content-Range', `bytes */${result.size}`);
      throw new HttpException('Request a valid single byte range', HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE);
    }
    if (result.range.partial) {
      response.status(HttpStatus.PARTIAL_CONTENT);
      response.setHeader('Content-Range', `bytes ${result.range.start}-${result.range.end}/${result.size}`);
    }
    return new StreamableFile(result.content, { type: 'video/mp4', length: result.content.length });
  }
}
