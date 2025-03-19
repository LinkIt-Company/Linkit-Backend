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
import { CreatePostDto } from '@src/modules/posts/dto/create-post.dto';
import { PostsService } from '@src/modules/posts/posts.service';
import { JwtGuard } from '@src/modules/users/guards';
import {
  CountPostDocs,
  CreatePostDocs,
  DeletePostDocs,
  ListPostDocs,
  PostControllerDocs,
  RetrievePostDocs,
  UpdatePostFolderDocs,
} from './docs';
import { UpdatePostDocs } from './docs/updatePost.docs';
import {
  CountPostQueryDto,
  ListPostQueryDto,
  UpdatePostDto,
  UpdatePostFolderDto,
} from './dto';
import {
  ListPostItem,
  ListPostResponse,
  RetrievePostResponse,
} from './response';
import { KeywordItem } from './response/keyword-list.response';

@Controller('posts')
@PostControllerDocs
@UseGuards(JwtGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ListPostDocs
  async listPost(@GetUser() userId: string, @Query() query: ListPostQueryDto) {
    const { count, posts } = await this.postsService.listPost(userId, query);
    const postResponse = posts.map((post) => new ListPostItem(post));

    return new ListPostResponse(count, query.page, query.limit, postResponse);
  }

  @Get('count')
  @CountPostDocs
  async countPost(
    @GetUser() userId: string,
    @Query() query: CountPostQueryDto,
  ) {
    const count = await this.postsService.countPost(userId, query);
    return count;
  }

  @Post()
  @CreatePostDocs
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @GetUser('id') userId: string,
  ) {
    const post = await this.postsService.createPost(createPostDto, userId);
    const postSerialize = new ListPostItem(post);
    return postSerialize;
  }

  @Get(':postId')
  @RetrievePostDocs
  async getPost(@GetUser() userId: string, @Param('postId') postId: string) {
    const { post, keywords } = await this.postsService.readPost(userId, postId);
    const postKeywords = keywords.map(
      (keyword) => new KeywordItem(keyword.keywordId),
    );
    const response = new RetrievePostResponse({
      ...post,
      keywords: postKeywords,
    });
    return response;
  }

  @Patch(':postId')
  @UpdatePostDocs
  async updatePost(
    @GetUser() userId: string,
    @Param('postId') postId: string,
    @Body() dto: UpdatePostDto,
  ) {
    const post = await this.postsService.updatePost(userId, postId, dto);
    const postSerialize = new ListPostItem(post);
    return postSerialize;
  }

  @Patch(':postId/move')
  @UpdatePostFolderDocs
  async updatePostFolder(
    @GetUser() userId: string,
    @Param('postId') postId: string,
    @Body() dto: UpdatePostFolderDto,
  ) {
    return await this.postsService.updatePostFolder(userId, postId, dto);
  }

  @Delete(':postId')
  @DeletePostDocs
  async deletePost(@GetUser() userId: string, @Param('postId') postId: string) {
    return await this.postsService.deletePost(userId, postId);
  }
}
