import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { UploaderStatus } from '../../../common/domain';
import { Trim } from '../../../common/inputs';

export class ReviewUploaderRequestDto {
  @ApiProperty({
    enum: [UploaderStatus.APPROVED, UploaderStatus.REJECTED],
    example: UploaderStatus.APPROVED,
  })
  @IsIn([UploaderStatus.APPROVED, UploaderStatus.REJECTED])
  decision!: UploaderStatus.APPROVED | UploaderStatus.REJECTED;

  @ApiPropertyOptional({ example: 'Sample ownership confirmed.' })
  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}