import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateFolderDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  @ApiProperty({
    description: '추가할 폴더 이름들',
  })
  readonly names: string[];
}

export class UpdateFolderDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '폴더 이름',
  })
  readonly name: string;
}
