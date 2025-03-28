import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FlattenMaps, Types } from 'mongoose';
import { parseLinkTitleAndContent } from '@src/common';
import { IS_LOCAL } from '@src/common/constant';
import { Keyword, Post } from '@src/infrastructure';
import { AwsLambdaService } from '@src/infrastructure/aws-lambda/aws-lambda.service';
import { AiClassificationPayload } from '@src/infrastructure/aws-lambda/type';
import { FolderType } from '@src/infrastructure/database/types/folder-type.enum';
import { CreatePostDto } from '@src/modules/posts/dto/create-post.dto';
import { PostAiStatus } from '@src/modules/posts/posts.constant';
import { PostsRepository } from '@src/modules/posts/posts.repository';
import { AiClassificationService } from '../ai-classification/ai-classification.service';
import { FolderRepository } from '../folders/folders.repository';
import {
  CountPostQueryDto,
  ListPostQueryDto,
  UpdatePostDto,
  UpdatePostFolderDto,
} from './dto';
import { GetPostQueryDto } from './dto/find-in-folder.dto';
import { PostKeywordsRepository } from './postKeywords.repository';
import { PostItemDto } from './response';

@Injectable()
export class PostsService {
  constructor(
    private readonly postRepository: PostsRepository,
    private readonly folderRepository: FolderRepository,
    private readonly postKeywordsRepository: PostKeywordsRepository,

    private readonly awsLambdaService: AwsLambdaService,
    private readonly aiClassificationService: AiClassificationService,
    private readonly config: ConfigService,
  ) {}

  async listPost(userId: string, query: ListPostQueryDto) {
    const [count, posts] = await Promise.all([
      this.postRepository.getUserPostCount(
        userId,
        query.favorite,
        query.isRead,
      ),
      this.postRepository.listPost(
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
    const count = await this.postRepository.getUserPostCount(
      userId,
      false,
      query.isRead,
    );
    return count;
  }

  async createPost(
    createPostDto: CreatePostDto,
    userId: string,
  ): Promise<PostItemDto> {
    // Validate folder is user's folder
    await this.folderRepository.findOneOrFail({
      userId: userId,
      _id: createPostDto.folderId,
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
        id: folder._id.toString(),
        name: folder.name,
      };
    });
    const post = await this.postRepository.createPost(
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
      postId: post._id.toString(),
      userId,
    } satisfies AiClassificationPayload;

    this.executeAiClassification(payload);

    return { ...post, keywords: [] } satisfies PostItemDto;
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
    await this.folderRepository.findOneOrFail({
      _id: folderId,
      userId,
    });

    const count = await this.postRepository.getCountByFolderId(
      folderId,
      query.isRead,
    );
    // NOTE: 폴더 id에 속하는 post 리스트 조회
    const posts = await this.postRepository.findByFolderId(
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
    const post = await this.postRepository.findPostOrThrow({
      _id: postId,
      userId: userId,
    });
    const keywords =
      await this.postKeywordsRepository.findKeywordsByPostId(postId);
    return { post, keywords };
  }

  async updatePost(userId: string, postId: string, dto: UpdatePostDto) {
    // Find if user post exist
    await this.postRepository.findPostOrThrow({
      _id: postId,
      userId: userId,
    });

    // Update post data
    await this.postRepository.updatePost(userId, postId, dto);
    const post = await this.postRepository.findPostOrThrow({
      _id: postId,
    });

    const [postsWithKeyword] = await this.organizeFolderWithKeywords([post]);
    return postsWithKeyword;
  }

  async updatePostFolder(
    userId: string,
    postId: string,
    dto: UpdatePostFolderDto,
  ) {
    await this.folderRepository.findOneOrFail({
      userId: userId,
      _id: dto.folderId,
    });

    // Find if post exist
    await this.postRepository.findPostOrThrow({
      _id: postId,
      userId: userId,
    });

    // Update post folder id
    await this.postRepository.updatePostFolder(userId, postId, dto.folderId);

    //return response;
    return true;
  }

  async deletePost(userId: string, postId: string) {
    // Find if post is user's post. If it's not throw NotFoundError
    const post = await this.postRepository.findPostOrThrow({
      _id: postId,
      userId: userId,
    });
    await this.postRepository.deletePost(
      userId,
      postId,
      post.aiClassificationId?.toString(),
    );
    return true;
  }

  async removePostListByFolderId(userId: string, folderId: string) {
    await this.postRepository.deleteMany({
      userId,
      folderId,
    });
  }

  async removeAllPostsInCustomFolders(userId: string): Promise<string[]> {
    const customFolders = await this.folderRepository.findByUserId(userId);
    const customFolderIds = customFolders
      .filter((folder) => folder.type === FolderType.CUSTOM)
      .map((folder) => folder._id);

    await this.postRepository.deleteMany({
      userId,
      folderId: { $in: customFolderIds },
    });
    return customFolderIds.map((folder) => folder.toString());
  }

  private async organizeFolderWithKeywords(
    posts: (FlattenMaps<Post> & { _id: Types.ObjectId })[],
  ) {
    const postIds = posts.map((post) => post._id.toString());
    const postKeywords =
      await this.postKeywordsRepository.findKeywordsByPostIds(postIds);
    const postKeywordMap: Record<
      string,
      (Keyword & { _id: Types.ObjectId })[]
    > = {};

    postKeywords.forEach((postKeyword) => {
      const postId = postKeyword.postId.toString();
      if (!postKeywordMap[postId]) {
        postKeywordMap[postId] = [];
      }

      /**
       * populate때문에 강제형변환
       */
      const keyword = postKeyword.keywordId as any as Keyword & {
        _id: Types.ObjectId;
      };
      postKeywordMap[postId].push(keyword);
    });

    const postsWithKeyword = posts.map((post) => ({
      ...post,
      keywords: postKeywordMap[post._id.toString()] ?? [],
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
