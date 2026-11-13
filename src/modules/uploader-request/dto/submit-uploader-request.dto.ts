import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { Trim } from '../../../common/inputs';

export class SubmitUploaderRequestDto {
  @ApiProperty({ example: 'I want to share the short animation I made for class.' })
  @Trim()
  @IsString()
  @Length(10, 500)
  reason!: string;
}