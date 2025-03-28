import { ApiProperty } from '@nestjs/swagger';
import { FolderDocument } from '@src/infrastructure';
import { FolderType } from '@src/infrastructure/database/types/folder-type.enum';

export class FolderSummaryResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: FolderType })
  type: FolderType;

  @ApiProperty()
  createdAt: Date;

  constructor(data: FolderDocument) {
    /** @todo postgres로 바꾸면서 수정하기 */
    this.id = data._id ? data._id.toString() : data.id;
    this.name = data.name;
    this.type = data.type;
    this.createdAt = data.createdAt;
  }
}
