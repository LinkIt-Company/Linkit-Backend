import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export enum OrderType {
  asc = 'asc',
  desc = 'desc',
}

/**
 * Base Query for pagination
 *
 */
export class PaginationQuery {
  @ApiProperty({
    description: 'Pagination - Page',
    default: 1,
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  readonly page = 1;

  @ApiProperty({
    description: 'Pagination - Limit',
    default: 10,
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  readonly limit = 10;

  @ApiProperty({
    required: false,
    enum: OrderType,
  })
  @IsOptional()
  @IsEnum(OrderType)
  readonly order: OrderType;
}
