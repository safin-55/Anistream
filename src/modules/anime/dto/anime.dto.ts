
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

import { AnimeStatus } from '../../../common/domain';
import { NormalizeKey, Trim } from '../../../common/inputs';

export class CreateAnimeDto {
  @ApiProperty({ example: 'star-harbor' })
  @NormalizeKey()
  @IsString()
  @Length(2, 140)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @ApiProperty({ example: 'Star Harbor' })
  @Trim()
  @IsString()
  @Length(1, 160)
  title!: string;

  @ApiProperty({
    example: 'A short series about a crew charting a distant star system.',
  })
  @Trim()
  @IsString()
  @Length(1, 5000)
  synopsis!: string;

  @ApiProperty({ example: 2026, minimum: 1900, maximum: 2100 })
  @IsInt()
  @Min(1900)
  @Max(2100)
  releaseYear!: number;

  @ApiProperty({ enum: AnimeStatus, example: AnimeStatus.COMPLETED })
  @IsEnum(AnimeStatus)
  status!: AnimeStatus;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'PG' })
  @Trim()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  ageRating?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'https://media.example.test/poster.jpg',
  })
  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  posterUrl?: string | null;

  @ApiPropertyOptional({ default: false })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ default: false })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    type: [String],
    description: 'Genre UUIDs. Supply [] to remove all genre links.',
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsArray()
  @ArrayUnique((id: unknown) =>
    typeof id === 'string' ? id.toLowerCase() : id,
  )
  @ArrayMaxSize(20)
  @IsUUID('4', { each: true })
  genreIds?: string[];
}

export class UpdateAnimeDto extends PartialType(
  CreateAnimeDto,
  { skipNullProperties: false },
) {}
