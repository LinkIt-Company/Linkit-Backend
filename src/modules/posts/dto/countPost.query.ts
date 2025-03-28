import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class CountPostQueryDto {
  @ApiProperty({
    required: false,
    description:
      '피드를 읽었는지 여부. 해당 QS 주어지지 않으면 전체 피드 개수 반환.',
  })
  @Transform(({ value }) => (value === 'true' ? true : false))
  @IsBoolean()
  @IsOptional()
  isRead: boolean;
}
