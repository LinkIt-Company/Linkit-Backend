import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasePaginationQuery, GetUser } from '@src/common';
import { JwtGuard } from '../users/guards';
import { ClassificationV2Service } from './classification.v2.service';
import {
  ClassificationControllerDocs,
  DeleteAIClassificationDocs,
  GetAIFolderNameListDocs,
  GetAIPostListDocs,
  PatchAIPostDocs,
  PatchAIPostListDocs,
} from './docs';
import { CountClassificationDocs } from './docs/countClassification.docs';
import { UpdateAIClassificationDto } from './dto/classification.dto';
import { AIFolderNameListResponse } from './response/ai-folder-list.dto';
import { AIPostListResponse } from './response/ai-post-list.dto';

@Controller({ version: '2', path: 'classification' })
@UseGuards(JwtGuard)
@ClassificationControllerDocs
export class ClassificationV2Controller {
  constructor(
    private readonly classificationService: ClassificationV2Service,
  ) {}

  @Get('/count')
  @CountClassificationDocs
  @HttpCode(HttpStatus.OK)
  async countClassifiedPost(@GetUser() userId: string): Promise<number> {
    return await this.classificationService.countClassifiedPost(userId);
  }

  @Get('/folders')
  @GetAIFolderNameListDocs
  @HttpCode(HttpStatus.OK)
  async getSuggestedFolderNameList(
    @GetUser() userId: string,
  ): Promise<AIFolderNameListResponse> {
    const folders = await this.classificationService.getFolderNameList(userId);
    return new AIFolderNameListResponse(folders);
  }

  @Get('/posts')
  @GetAIPostListDocs
  @HttpCode(HttpStatus.OK)
  async getSuggestedPostList(
    @GetUser() userId: string,
    @Query() pagingQuery: BasePaginationQuery,
  ): Promise<AIPostListResponse> {
    const { count, classificationPostList } =
      await this.classificationService.getPostList(userId, pagingQuery);

    return new AIPostListResponse(
      pagingQuery.page,
      pagingQuery.limit,
      count,
      classificationPostList,
    );
  }

  @Get('/posts/:folderId')
  @GetAIPostListDocs
  async getSuggestedPostListInFolder(
    @GetUser() userId: string,
    @Param('folderId') folderId: string,
    @Query() pagingQuery: BasePaginationQuery,
  ): Promise<AIPostListResponse> {
    const { count, classificationPostList } =
      await this.classificationService.getPostListInFolder(
        userId,
        folderId,
        pagingQuery,
      );

    return new AIPostListResponse(
      pagingQuery.page,
      pagingQuery.limit,
      count,
      classificationPostList,
    );
  }

  @Patch('/posts')
  @PatchAIPostListDocs
  async moveAllPost(
    @GetUser() userId: string,
    @Body() dto: UpdateAIClassificationDto,
  ) {
    return await this.classificationService.moveAllPostTosuggestionFolder(
      userId,
      dto.suggestionFolderId,
    );
  }

  @Patch('/posts/:postId')
  @PatchAIPostDocs
  async moveOnePost(
    @GetUser() userId: string,
    @Param('postId') postId: string,
    @Body() dto: UpdateAIClassificationDto,
  ) {
    await this.classificationService.moveOnePostTosuggestionFolder(
      userId,
      postId,
      dto.suggestionFolderId,
    );
  }

  @Delete('/posts/:postId')
  @DeleteAIClassificationDocs
  async abortClassification(
    @GetUser() userId: string,
    @Param('postId') postId: string,
  ): Promise<void> {
    await this.classificationService.abortClassification(userId, postId);
  }
}
