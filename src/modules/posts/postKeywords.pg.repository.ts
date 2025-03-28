import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { Repository } from 'typeorm';
import { PostKeyword } from '@src/infrastructure/database/entities/post-keyword.entity';

@Injectable()
export class PostKeywordsRepository extends Repository<PostKeyword> {
  constructor(private dataSource: DataSource) {
    super(PostKeyword, dataSource.createEntityManager());
  }

  async createPostKeywords(postId: string, keywordIds: string[]) {
    const postKeywords = keywordIds.map((keywordId) => ({
      postId,
      keywordId,
    }));

    await this.insert(postKeywords);
  }

  async findKeywordsByPostId(postId: string): Promise<PostKeyword[]> {
    return await this.find({
      where: {
        postId: postId,
      },
      relations: ['keyword'],
    });
  }

  async findKeywordsByPostIds(postIds: string[]) {
    return await this.find({
      where: {
        postId: In(postIds),
      },
      relations: ['keyword'],
    });
  }
}
