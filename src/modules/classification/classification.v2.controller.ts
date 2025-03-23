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
import { GetUser, PaginationMetadata, PaginationQuery } from '@src/common';
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

@Controller('v2/classification')
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
    @Query() pagingQuery: PaginationQuery,
  ): Promise<AIPostListResponse> {
    const { count, classificationPostList } =
      await this.classificationService.getPostList(userId, pagingQuery);

    const metadata = new PaginationMetadata(
      pagingQuery.page,
      pagingQuery.limit,
      count,
    );

    return new AIPostListResponse(metadata, classificationPostList);
  }

  @Get('/posts/:folderId')
  @GetAIPostListDocs
  @HttpCode(HttpStatus.OK)
  async getSuggestedPostListInFolder(
    @GetUser() userId: string,
    @Param('folderId') folderId: string,
    @Query() pagingQuery: PaginationQuery,
  ): Promise<AIPostListResponse> {
    const { count, classificationPostList } =
      await this.classificationService.getPostListInFolder(
        userId,
        folderId,
        pagingQuery,
      );

    const metadata = new PaginationMetadata(
      pagingQuery.page,
      pagingQuery.limit,
      count,
    );

    return new AIPostListResponse(metadata, classificationPostList);
  }

  @Patch('/posts')
  @PatchAIPostListDocs
  @HttpCode(HttpStatus.OK)
  async moveAllPost(
    @GetUser() userId: string,
    @Query('suggestionFolderId') suggestionFolderId: string,
  ): Promise<{ success: boolean }> {
    const result =
      await this.classificationService.moveAllPostTosuggestionFolderV2(
        userId,
        suggestionFolderId,
      );

    return { success: result };
  }

  @Patch('/posts/:postId')
  @PatchAIPostDocs
  async moveOnePost(
    @GetUser() userId: string,
    @Param('postId') postId: string,
    @Body() dto: UpdateAIClassificationDto,
  ): Promise<void> {
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
