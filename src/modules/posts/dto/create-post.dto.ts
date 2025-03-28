import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsUrl } from 'class-validator';

export class CreatePostDto {
  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty({ description: '폴더 id', required: true })
  folderId: string;

  @IsUrl()
  @IsNotEmpty()
  @ApiProperty({ description: '저장할 url', required: true })
  url: string;
}
