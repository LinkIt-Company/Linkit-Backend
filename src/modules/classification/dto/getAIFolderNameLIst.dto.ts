import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { FolderDocument } from '@src/infrastructure';

export class AIFolderNameServiceDto {
  id: string;

  name: string;

  constructor(data: FolderDocument) {
    this.id = data._id.toString();
    this.name = data.name;
  }
}
