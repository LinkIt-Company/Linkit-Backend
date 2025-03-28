import { ApiProperty } from '@nestjs/swagger';
import { FolderListServiceDto } from '../dto/folder-list-service.dto';
import { FolderResponse } from './folder.response';

export class FolderListResponse {
  @ApiProperty({ isArray: true, type: FolderResponse })
  defaultFolders: FolderResponse[];

  @ApiProperty({ isArray: true, type: FolderResponse })
  customFolders: FolderResponse[];

  constructor(data: FolderListServiceDto) {
    this.defaultFolders = data.defaultFolders.map(
      (folder) => new FolderResponse(folder),
    );
    this.customFolders = data.customFolders.map(
      (folder) => new FolderResponse(folder),
    );
  }
}
