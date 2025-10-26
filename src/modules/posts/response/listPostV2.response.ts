import { ApiProperty } from '@nestjs/swagger';
import { BasePaginationResponse } from '@src/common';
import { Keyword } from '@src/infrastructure/database/entities/keyword.entity';
import { Post } from '@src/infrastructure/database/entities/post.entity';
import { PostAiStatus } from '@src/modules/posts/posts.constant';
import { KeywordItemV2 } from './keyword-listV2.response';

export type PostItemV2Dto = Post & {
  keywords: Keyword[];
};

export class ListPostItemV2 {
  @ApiProperty({ required: true, description: '피드 id', type: String })
  id: string;

  @ApiProperty({ required: true, description: '폴더 id', type: String })
  folderId: string;

  @ApiProperty({ required: true, description: '피드 URL', type: String })
  url: string;

  @ApiProperty({ required: true, description: '피드 제목', type: String })
  title: string;

  @ApiProperty({
    nullable: true,
    description: '요약 정보',
    type: String,
  })
  description: string;

  @ApiProperty()
  keywords: KeywordItemV2[];

  @ApiProperty({ required: true, description: '즐겨찾기 여부', type: Boolean })
  isFavorite: boolean;

  @ApiProperty({ required: true, description: '생성 시간', type: Date })
  createdAt: Date;

  @ApiProperty({ nullable: true, description: '읽음 시간' })
  readAt: Date | null;

  @ApiProperty({ nullable: true, description: 'URL og 이미지' })
  thumbnailImgUrl: string | null;

  @ApiProperty({
    required: true,
    enum: PostAiStatus,
    description: '피드 게시글의 ai 진행 상태',
  })
  aiStatus: PostAiStatus;

  constructor(data: PostItemV2Dto) {
    this.id = data.id;
    this.folderId = data.folderId;
    this.url = data.url;
    this.title = data.title;
    this.description = data.description;
    this.keywords = data.keywords.map((keyword) => new KeywordItemV2(keyword));
    this.isFavorite = data.isFavorite;
    this.createdAt = data.createdAt;
    this.readAt = data.readAt;
    this.thumbnailImgUrl = data.thumbnailImgUrl;
    this.aiStatus = data.aiStatus;
  }
}

export class ListPostV2Response extends BasePaginationResponse<ListPostItemV2> {
  @ApiProperty({
    type: ListPostItemV2,
    isArray: true,
  })
  list: ListPostItemV2[];
}
