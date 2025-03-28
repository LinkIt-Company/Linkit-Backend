import { ApiProperty } from '@nestjs/swagger';
import { BasePaginationResponse } from '@src/common';
import { PostResponse } from './post.response';

export class FolderPostResponse extends BasePaginationResponse<PostResponse> {
  @ApiProperty({
    type: PostResponse,
    isArray: true,
  })
  list: PostResponse[];
}
