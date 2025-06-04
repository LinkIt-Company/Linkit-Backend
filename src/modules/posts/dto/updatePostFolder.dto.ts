import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdatePostFolderDto {
  @IsNotEmpty()
  @ApiProperty()
  folderId: string;
}
