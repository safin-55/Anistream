import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, maximum: 10000 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  page = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 10;
}

export function offsetOf(query: PaginationDto) {
  return (query.page - 1) * query.limit;
}

export class PageResult<T> {
  readonly meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  constructor(readonly data: T[], total: number, query: PaginationDto) {
    this.meta = {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    };
  }
}

export function containsText(value: string) {
  return `%${value.replace(/[\\%_]/g, '\\$&')}%`;
}