import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { In } from 'typeorm';
import { parseLinkTitleAndContent } from '@src/common';
import { IS_LOCAL } from '@src/common/constant';
import { AwsLambdaService } from '@src/infrastructure/aws-lambda/aws-lambda.service';
import { AiClassificationPayload } from '@src/infrastructure/aws-lambda/type';
// NOTE: postgres entity
import { Keyword } from '@src/infrastructure/database/entities/keyword.entity';
import { PostKeyword } from '@src/infrastructure/database/entities/post-keyword.entity';
import { Post } from '@src/infrastructure/database/entities/post.entity';
import { FolderType } from '@src/infrastructure/database/types/folder-type.enum';
import { AiClassificationService } from '@src/modules/ai-classification/ai-classification.service';
import { FoldersPGRepository } from '@src/modules/folders/folders.pg.repository';
import {
  CountPostQueryDto,
  CreatePostDto,
  ListPostQueryDto,
  UpdatePostDto,
  UpdatePostFolderDto,
} from '@src/modules/posts/dto';
import { GetPostQueryDto } from '@src/modules/posts/dto/find-in-folder.dto';
import { PostKeywordsPGRepository } from '@src/modules/posts/postKeywords.pg.repository';
import { PostAiStatus } from '@src/modules/posts/posts.constant';
import { PostsPGRepository } from '@src/modules/posts/posts.pg.repository';
import { PostItemV2Dto } from '@src/modules/posts/response/listPostV2.response';

type PostWithKeywords = Post & {
  keywords: Keyword[];
};

@Injectable()
export class PostsV2Service {
  constructor(
    // NOTE : V2 postgres migration repository
    private readonly postPGRepository: PostsPGRepository,

    private readonly folderRepository: FoldersPGRepository,
    private readonly postKeywordsRepository: PostKeywordsPGRepository,

    private readonly awsLambdaService: AwsLambdaService,
    private readonly aiClassificationService: AiClassificationService,
    private readonly config: ConfigService,
  ) {}
  async listPost(userId: string, query: ListPostQueryDto) {
    const [count, posts] = await Promise.all([
      this.postPGRepository.getUserPostCount(
        userId,
        query.favorite,
        query.isRead,
      ),
      this.postPGRepository.listPost(
        userId,
        query.page,
        query.limit,
        query.favorite,
        query.order,
        query.isRead,
      ),
    ]);

    const postsWithKeyword = await this.organizeFolderWithKeywords(posts);

    return {
      count,
      posts: postsWithKeyword,
    };
  }

  async countPost(userId: string, query: CountPostQueryDto) {
    const count = await this.postPGRepository.getUserPostCount(
      userId,
      false,
      query.isRead,
    );
    return count;
  }

  async createPost(
    createPostDto: CreatePostDto,
    userId: string,
  ): Promise<PostItemV2Dto> {
    // Validate folder is user's folder
    await this.folderRepository.findOneByOrFail({
      userId: userId,
      id: createPostDto.folderId,
    });

    // NOTE : URL에서 얻은 정보 가져옴
    const { title, content, thumbnail, thumbnailDescription } =
      await parseLinkTitleAndContent(createPostDto.url);
    const userFolderList = await this.folderRepository.findByUserId(
      userId,
      false,
    );
    const folderList = userFolderList.map((folder) => {
      return {
        id: folder.id.toString(),
        name: folder.name,
      };
    });
    const post = await this.postPGRepository.createPost(
      userId,
      createPostDto.folderId,
      createPostDto.url,
      title,
      thumbnail,
      PostAiStatus.IN_PROGRES,
    );
    const payload = {
      url: createPostDto.url,
      postContent: content,
      postThumbnailContent: thumbnailDescription,
      folderList: folderList,
      postId: post.id,
      userId,
    } satisfies AiClassificationPayload;

    this.executeAiClassification(payload);

    return { ...post, keywords: [] };
  }

  /**
   * @todo
   * post 조회하는 플로우까지 개발되면 읽지 않음 여부 필터 적용하기
   */
  async findByFolderId(
    userId: string,
    folderId: string,
    query: GetPostQueryDto,
  ) {
    // NOTE: 폴더 존재 여부조회
    await this.folderRepository.findOneByOrFail({
      id: folderId,
      userId: userId,
    });

    const count = await this.postPGRepository.getCountByFolderId(
      folderId,
      query.isRead,
    );
    // NOTE: 폴더 id에 속하는 post 리스트 조회
    const posts = await this.postPGRepository.findByFolderId(
      folderId,
      query.page,
      query.limit,
      query.order,
      query.isRead,
    );

    const postsWithKeyword = await this.organizeFolderWithKeywords(posts);

    return {
      count,
      posts: postsWithKeyword,
    };
  }

  async readPost(userId: string, postId: string) {
    const post = await this.postPGRepository.findPostOrThrow({
      id: postId,
      userId: userId,
    });
    const keywords: PostKeyword[] =
      await this.postKeywordsRepository.findKeywordsByPostId(postId);
    return { post, keywords };
  }

  async updatePost(userId: string, postId: string, dto: UpdatePostDto) {
    // Find if user post exist
    await this.postPGRepository.findPostOrThrow({
      id: postId,
      userId: userId,
    });

    // Update post data
    await this.postPGRepository.updatePost(userId, postId, dto);
    const post = await this.postPGRepository.findPostOrThrow({
      id: postId,
    });

    const [postsWithKeyword] = await this.organizeFolderWithKeywords([post]);
    return postsWithKeyword;
  }

  async updatePostFolder(
    userId: string,
    postId: string,
    dto: UpdatePostFolderDto,
  ) {
    await this.folderRepository.findOneByOrFail({
      userId: userId,
      id: dto.folderId,
    });

    // Find if post exist
    await this.postPGRepository.findPostOrThrow({
      id: postId,
      userId: userId,
    });

    // Update post folder id
    await this.postPGRepository.updatePostFolder(userId, postId, dto.folderId);

    //return response;
    return true;
  }

  async deletePost(userId: string, postId: string) {
    // Find if post is user's post. If it's not throw NotFoundError
    const post = await this.postPGRepository.findPostOrThrow({
      id: postId,
      userId: userId,
    });
    await this.postPGRepository.deletePost(
      userId,
      postId,
      post.aiClassificationId?.toString(),
    );
    return true;
  }

  async removePostListByFolderId(userId: string, folderId: string) {
    await this.postPGRepository.deleteMany({
      userId,
      folderId,
    });
  }

  async removeAllPostsInCustomFolders(userId: string): Promise<string[]> {
    const customFolders = await this.folderRepository.findByUserId(userId);
    const customFolderIds = customFolders
      .filter((folder) => folder.type === FolderType.CUSTOM)
      .map((folder) => folder.id);

    await this.postPGRepository.deleteMany({
      userId,
      folderId: In(customFolderIds),
    });
    return customFolderIds;
  }

  private async organizeFolderWithKeywords(
    posts: Post[],
  ): Promise<PostWithKeywords[]> {
    const postIds = posts.map((post) => post.id);
    const postKeywords =
      await this.postKeywordsRepository.findKeywordsByPostIds(postIds);
    const postKeywordMap: Record<string, Keyword[]> = {};

    postKeywords.forEach((postKeyword: PostKeyword) => {
      if (!postKeywordMap[postKeyword.postId]) {
        postKeywordMap[postKeyword.postId] = [];
      }

      if (postKeyword.keyword) {
        postKeywordMap[postKeyword.postId].push(postKeyword.keyword);
      }
    });

    const postsWithKeyword = posts.map((post) => ({
      ...post,
      keywords: postKeywordMap[post.id] ?? [],
    }));

    return postsWithKeyword;
  }

  private async executeAiClassification(payload: AiClassificationPayload) {
    if (IS_LOCAL) {
      return await this.aiClassificationService.execute(payload);
    }

    const aiLambdaFunctionName = this.config.get<string>(
      'LAMBDA_FUNCTION_NAME',
    );

    await this.awsLambdaService.invokeLambda(aiLambdaFunctionName, payload);
  }
}
