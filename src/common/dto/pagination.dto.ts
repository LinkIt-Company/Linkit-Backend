import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export enum OrderType {
  asc = 'asc',
  desc = 'desc',
}

// Pagination 들어가는 API에 대해서 상속해주세용
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

  getOffset(): number {
    return Math.max(0, (this.page - 1) * this.limit);
  }
}

// Pagination API Response의 Metadata로 추가해주세용
export class PaginationMetadata {
  @Exclude()
  private _page: number;

  @Exclude()
  private _limit: number;

  @Exclude()
  private _total: number;

  @Exclude()
  private _lastPage: number;

  @Exclude()
  private _nextPage: number;

  constructor(page: number, limit: number, total: number) {
    this._page = page;
    this._limit = limit;
    this._total = total;
    this._lastPage = Math.ceil(this._total / this._limit);
    this._nextPage = this._page < this._lastPage ? this._page + 1 : null;
  }

  @Expose()
  @ApiProperty({
    type: Boolean,
  })
  get hasNext(): boolean {
    return Boolean(this._nextPage);
  }

  @Expose()
  @ApiProperty({
    type: Number,
  })
  get total(): number {
    return this._total;
  }
}
