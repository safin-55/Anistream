import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  Equals,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateIf,
} from 'class-validator';

import { VideoVisibility } from '../../../common/domain';
import { Trim } from '../../../common/inputs';

export class CreateUploadDto {
  @ApiProperty({ example: 'First classroom animation' })
  @Trim()
  @IsString()
  @Length(1, 160)
  title!: string;

  @ApiProperty({ example: 'An original test clip made for CSC4161.' })
  @Trim()
  @IsString()
  @Length(1, 5000)
  synopsis!: string;

  @ApiPropertyOptional({ enum: VideoVisibility, default: VideoVisibility.PRIVATE })
  @ValidateIf((_, value) => value !== undefined)
  @IsEnum(VideoVisibility)
  visibility?: VideoVisibility;

  @ApiPropertyOptional({ type: String, format: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  genreId?: string | null;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'You own this media or have permission to share it.',
  })
  @Transform(({ value }) => value === 'true' ? true : value)
  @Equals(true, { message: 'rightsConfirmed must be true' })
  rightsConfirmed!: boolean;
}