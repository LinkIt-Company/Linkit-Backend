import { ApiProperty } from '@nestjs/swagger';
import { ClassificationFolderWithCount } from '../dto/classification.dto';

export class AIFolderNameListResponse {
  @ApiProperty({
    description: 'ai로 분류된 링크의 총 개수',
  })
  totalCounts: number;

  @ApiProperty({
    isArray: true,
  })
  list: ClassificationFolderWithCount[];

  constructor(data: ClassificationFolderWithCount[]) {
    this.totalCounts = data.reduce((sum, folder) => sum + folder.postCount, 0);
    this.list = data;
  }
}
