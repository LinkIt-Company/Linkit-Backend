import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class OnBoardQuery {
  @ApiProperty({
    required: false,
    description: '온보딩 데이터 받고 싶은 갯수',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit: number;
}
