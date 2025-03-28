import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class UpdatePostFolderDto {
  @IsNotEmpty()
  @IsMongoId()
  @ApiProperty()
  folderId: string;
}
