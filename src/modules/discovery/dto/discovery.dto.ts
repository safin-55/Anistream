
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { AnimeStatus } from '../../../common/domain';
import { Trim } from '../../../common/inputs';
import { PaginationDto } from '../../../common/pagination';

export class DiscoveryQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'harbor' })
  @Trim()
  @IsOptional()
  @IsString()
  @Length(1, 120)
  q?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  genreId?: string;

  @ApiPropertyOptional({ enum: ['anime', 'upload'] })
  @IsOptional()
  @IsIn(['anime', 'upload'])
  kind?: 'anime' | 'upload';

  @ApiPropertyOptional({
    enum: AnimeStatus,
    description: 'Limit results to anime with this status.',
  })
  @IsOptional()
  @IsEnum(AnimeStatus)
  status?: AnimeStatus;
}
