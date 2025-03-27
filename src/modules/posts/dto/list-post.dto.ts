import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { BasePaginationQuery } from '@src/common';

export class ListPostQueryDto extends BasePaginationQuery {
  @ApiProperty({
    required: false,
    description: '즐겨찾기 필터링 여부 확인',
  })
  @Transform(({ value }) => (value === 'true' ? true : false))
  @IsBoolean()
  @IsOptional()
  favorite: boolean;

  @ApiProperty({
    required: false,
    description: '읽음 필터링 여부',
  })
  @Transform(({ value }) => (value === 'true' ? true : false))
  @IsBoolean()
  @IsOptional()
  isRead: boolean;
}
