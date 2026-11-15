
import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { Trim } from '../../../common/inputs';
import { PaginationDto } from '../../../common/pagination';

export class CreateSeasonDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  animeId!: string;

  @ApiProperty({ example: 1, minimum: 1, maximum: 500 })
  @IsInt()
  @Min(1)
  @Max(500)
  seasonNumber!: number;

  @ApiProperty({ example: 'Season 1' })
  @Trim()
  @IsString()
  @Length(1, 160)
  title!: string;

  @ApiPropertyOptional({ default: false })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateSeasonDto extends PartialType(
  OmitType(CreateSeasonDto, ['animeId'] as const),
  { skipNullProperties: false },
) {}

export class SeasonQueryDto extends PaginationDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  animeId?: string;
}
