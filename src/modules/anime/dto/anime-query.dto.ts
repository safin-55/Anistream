
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

import { AnimeStatus } from '../../../common/domain';
import { Trim } from '../../../common/inputs';
import { PaginationDto } from '../../../common/pagination';

export class AnimeQueryDto extends PaginationDto {
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

  @ApiPropertyOptional({ enum: AnimeStatus })
  @IsOptional()
  @IsEnum(AnimeStatus)
  status?: AnimeStatus;

  @ApiPropertyOptional({ type: Boolean })
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
