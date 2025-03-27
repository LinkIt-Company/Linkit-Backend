import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { PostAiStatus } from '@src/modules/posts/posts.constant';

export interface ClassificationFolderWithCount {
  folderId: string;
  folderName: string;
  postCount: number;
}

export class ClassificationPostList {
  @ApiProperty({ required: true, description: '피드 id', type: String })
  postId: string;

  @ApiProperty({ required: true, description: '폴더 id', type: String })
  folderId: string;

  @ApiProperty({ required: true, description: '피드 제목', type: String })
  title: string;

  @ApiProperty({ required: true, description: '피드 URL', type: String })
  url: string;

  @ApiProperty({ required: true, description: '피드 요약', type: String })
  description: string;

  @ApiProperty({
    required: true,
    description: '키워드',
    isArray: true,
    type: String,
  })
  keywords: string[];

  @ApiProperty({
    required: true,
    description: 'ai 요약 상태',
    enum: PostAiStatus,
  })
  aiStatus: PostAiStatus;

  @ApiProperty({ nullable: true, description: '피드 og 이미지', type: String })
  thumbnailImgUrl: string | null;

  @ApiProperty({ description: '생성 시간', type: Date })
  createdAt: Date;

  @ApiProperty({ nullable: true, description: '읽은 시간', type: Date })
  readAt: Date | null;
}

export class UpdateAIClassificationDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '추천된 폴더의 아이디' })
  suggestionFolderId: string;
}
