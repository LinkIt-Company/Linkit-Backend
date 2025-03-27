import { ApiProperty } from '@nestjs/swagger';
import { BasePaginationResponse } from '@src/common';
import { ClassificationPostList } from '../dto/classification.dto';

export class AIPostListResponse extends BasePaginationResponse<ClassificationPostList> {
  @ApiProperty({
    type: ClassificationPostList,
    isArray: true,
  })
  list: ClassificationPostList[];
}
