import { ApiProperty } from '@nestjs/swagger';
import { FolderSummaryResponse } from './folder-summary.response';

export class FolderResponse extends FolderSummaryResponse {
  @ApiProperty()
  postCount: number;

  constructor(data) {
    super(data);

    this.postCount = data.postCount;
  }
}
