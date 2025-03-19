import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { BasePaginationResponse } from '@src/common/dto/response/paginated.dto';
import { Keyword, Post } from '@src/infrastructure';
import { PostAiStatus } from '@src/modules/posts/posts.constant';
import { KeywordItem } from './keyword-list.response';

export type PostItemDto = Post & {
  _id: Types.ObjectId;
  keywords: (Keyword & { _id: Types.ObjectId })[];
};

export class ListPostItem {
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
  keywords: KeywordItem[];

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

  constructor(data: PostItemDto) {
    this.id = data._id.toString();
    this.folderId = data.folderId.toString();
    this.url = data.url;
    this.title = data.title;
    this.description = data.description;
    this.keywords = data.keywords.map((keyword) => new KeywordItem(keyword));
    this.isFavorite = data.isFavorite;
    this.createdAt = data.createdAt;
    this.readAt = data.readAt;
    this.createdAt = data.createdAt;
    this.thumbnailImgUrl = data.thumbnailImgUrl;
    this.aiStatus = data.aiStatus;
  }
}

export class ListPostResponse extends BasePaginationResponse<ListPostItem> {
  @ApiProperty({
    type: ListPostItem,
    isArray: true,
  })
  list: ListPostItem[];
}
