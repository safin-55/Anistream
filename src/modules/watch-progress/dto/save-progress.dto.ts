import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class SaveProgressDto {
  @ApiProperty({ example: 45, minimum: 0, maximum: 21600 })
  @IsInt()
  @Min(0)
  @Max(21600)
  lastPositionSeconds!: number;
}
