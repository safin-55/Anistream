
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

import { IsBoolean, IsString, Length, ValidateIf } from 'class-validator';

import { Trim } from '../../../common/inputs';
 
export class CreateGenreDto {

  @ApiProperty({ example: 'Fantasy', minLength: 2, maxLength: 80 })

  @Trim()

  @IsString()

  @Length(2, 80)

  name!: string;
 
  @ApiPropertyOptional({ default: false })

  @ValidateIf((_, value) => value !== undefined)

  @IsBoolean()

  isPublished?: boolean;

}
 
export class UpdateGenreDto extends PartialType(CreateGenreDto, {

  skipNullProperties: false,

}) {}

