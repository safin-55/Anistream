
import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';

import { VideoVisibility } from '../../../common/domain';

import { Trim } from '../../../common/inputs';

import { PaginationDto } from '../../../common/pagination';

export class PublicUploadQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'animation' })
  @Trim()
  @IsOptional()
  @IsString()
  @Length(1, 120)
  q?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  genreId?: string;
}

export class ManagedUploadQueryDto extends PublicUploadQueryDto {
  @ApiPropertyOptional({ enum: VideoVisibility })
  @IsOptional()
  @IsEnum(VideoVisibility)
  visibility?: VideoVisibility;
}
