import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';
import { PostUpdateableFields } from '../type/type';

export class UpdatePostDto implements PostUpdateableFields {
  // Temporary ignore in MVP level
  title: string;
  @ApiProperty({
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isFavorite: boolean;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsDateString()
  readAt: Date;
}
