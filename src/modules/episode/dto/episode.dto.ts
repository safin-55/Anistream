import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString, IsUUID, Length, Max,
  MaxLength, Min, ValidateIf, ValidateNested,
} from 'class-validator';
import { PlaybackType } from '../../../common/domain';
import { Trim } from '../../../common/inputs';
import { PaginationDto } from '../../../common/pagination';

export class PlaybackSourceDto {
  @ApiProperty({ enum: PlaybackType })
  @IsEnum(PlaybackType)
  type!: PlaybackType;

  @ApiPropertyOptional({ example: 'https://media.example.test/episode-1.mp4' })
  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  url?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'UUID of an existing public creator upload' })
  @IsOptional()
  @IsUUID('4')
  uploadId?: string;
}

export class CreateEpisodeDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  seasonId!: string;

  @ApiProperty({ example: 1, minimum: 1, maximum: 5000 })
  @IsInt()
  @Min(1)
  @Max(5000)
  episodeNumber!: number;

  @ApiProperty({ example: 'The First Signal' })
  @Trim()
  @IsString()
  @Length(1, 160)
  title!: string;

  @ApiProperty({ example: 'The crew detects a signal from the harbour.' })
  @Trim()
  @IsString()
  @Length(1, 5000)
  synopsis!: string;

  @ApiProperty({ example: 1200, minimum: 1, maximum: 21600 })
  @IsInt()
  @Min(1)
  @Max(21600)
  durationSeconds!: number;

  @ApiPropertyOptional({ type: PlaybackSourceDto, nullable: true })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PlaybackSourceDto)
  playback?: PlaybackSourceDto | null;

  @ApiPropertyOptional({ default: false })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateEpisodeDto extends PartialType(
  OmitType(CreateEpisodeDto, ['seasonId'] as const), { skipNullProperties: false },
) {}

export class EpisodeQueryDto extends PaginationDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  seasonId?: string;
}