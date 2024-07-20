import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export interface ClassificationFolderWithCount {
  folderId: string;
  folderName: string;
  postCount: number;
}

export interface PostListInClassificationFolder {
  postId: string;

  folderId: string;

  title: string;

  url: string;

  description: string;

  keywords: string[];

  createdAt: Date;

  readAt: Date;
}

export class UpdateAIClassificationDto {
  @IsNotEmpty()
  @IsMongoId()
  @ApiProperty({ description: '추천된 폴더의 아이디' })
  suggestionFolderId: string;
}
