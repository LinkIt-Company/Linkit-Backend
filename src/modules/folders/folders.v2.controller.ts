import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '@src/common';
import { ClassificationV2Service } from '../classification/classification.v2.service';
import { GetPostQueryDto } from '../posts/dto/find-in-folder.dto';
import { PostsService } from '../posts/posts.service';
import { JwtGuard } from '../users/guards/jwt.guard';
import {
  CreateFolderDocs,
  DeleteFolderDocs,
  FindAFolderListDocs,
  FindFolderDocs,
  FindLinksInFolderDocs,
  FolderControllerDocs,
  UpdateFolderDocs,
} from './docs';
import { CreateFolderDto, DeleteCustomFolderDto, UpdateFolderDto } from './dto';
import { FoldersV2Service } from './folders.v2.service';
import {
  FolderListResponse,
  FolderPostResponse,
  FolderResponse,
} from './responses';
import { PostResponse } from './responses/post.response';

@FolderControllerDocs
@UseGuards(JwtGuard)
@Controller({ version: '2', path: 'folders' })
export class FoldersV2Controller {
  constructor(
    private readonly foldersService: FoldersV2Service,
    private readonly postsService: PostsService,
    private readonly classificationService: ClassificationV2Service,
  ) {}

  @CreateFolderDocs
  @Post()
  async create(
    @GetUser('id') userId: string,
    @Body() createFolderDto: CreateFolderDto,
  ) {
    const folders = await this.foldersService.createMany(
      userId,
      createFolderDto,
    );
    const folderSerializer = folders.map(
      (folder) => new FolderResponse(folder),
    );
    return {
      list: folderSerializer,
    };
  }

  @FindAFolderListDocs
  @Get()
  async findAll(@GetUser() userId: string) {
    const result = await this.foldersService.findAll(userId);
    return new FolderListResponse(result);
  }

  @FindFolderDocs
  @Get(':folderId')
  async findOne(
    @GetUser() userId: string,
    @Param('folderId') folderId: string,
  ) {
    const folder = await this.foldersService.findOne(userId, folderId);
    return new FolderResponse(folder);
  }

  @FindLinksInFolderDocs
  @Get(':folderId/posts')
  async findLinksInFolder(
    @GetUser() userId: string,
    @Param('folderId') folderId: string,
    @Query() query: GetPostQueryDto,
  ) {
    const result = await this.postsService.findByFolderId(
      userId,
      folderId,
      query,
    );

    const posts = result.posts.map((post) => new PostResponse(post));
    return new FolderPostResponse(query.page, query.limit, result.count, posts);
  }

  @UpdateFolderDocs
  @Patch(':folderId')
  async update(
    @GetUser() userId: string,
    @Param('folderId') folderId: string,
    @Body() updateFolderDto: UpdateFolderDto,
  ) {
    const updatedFolder = await this.foldersService.update(
      userId,
      folderId,
      updateFolderDto,
    );
    return new FolderResponse(updatedFolder);
  }

  @Delete('/all')
  async removeAll(@Query() deleteCustomFolderDto: DeleteCustomFolderDto) {
    const folderIdList = await this.postsService.removeAllPostsInCustomFolders(
      deleteCustomFolderDto.userId,
    );
    await this.foldersService.removeAllCustomFolders(
      deleteCustomFolderDto.userId,
    );
    await this.classificationService.deleteClassificationBySuggestedFolderId(
      folderIdList,
    );
  }

  @DeleteFolderDocs
  @Delete(':folderId')
  async remove(@GetUser() userId: string, @Param('folderId') folderId: string) {
    await this.classificationService.deleteClassificationBySuggestedFolderId([
      folderId,
    ]);
    await this.foldersService.remove(userId, folderId);
    await this.postsService.removePostListByFolderId(userId, folderId);
  }
}
