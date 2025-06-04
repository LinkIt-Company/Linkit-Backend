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
import {
  CountPostDocs,
  CreatePostDocs,
  DeletePostDocs,
  ListPostDocs,
  PostControllerDocs,
  RetrievePostDocs,
  UpdatePostFolderDocs,
} from '@src/modules/posts/docs';
import { UpdatePostDocs } from '@src/modules/posts/docs/updatePost.docs';
import {
  CountPostQueryDto,
  CreatePostDto,
  ListPostQueryDto,
  UpdatePostDto,
  UpdatePostFolderDto,
} from '@src/modules/posts/dto';
import { PostsV2Service } from '@src/modules/posts/posts.v2.service';
import { KeywordItemV2 } from '@src/modules/posts/response/keyword-listV2.response';
import {
  ListPostItemV2,
  ListPostV2Response,
} from '@src/modules/posts/response/listPostV2.response';
import { RetrievePostV2Response } from '@src/modules/posts/response/retrievePostV2.response';
import { JwtGuard } from '@src/modules/users/guards';

@PostControllerDocs
@UseGuards(JwtGuard)
@Controller({ version: '2', path: 'posts' })
export class PostsV2Controller {
  constructor(private readonly postsService: PostsV2Service) {}

  @Get()
  @ListPostDocs
  async listPost(@GetUser() userId: string, @Query() query: ListPostQueryDto) {
    const { count, posts } = await this.postsService.listPost(userId, query);
    const postResponse = posts.map((post) => new ListPostItemV2(post));

    return new ListPostV2Response(count, query.page, query.limit, postResponse);
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
    return new ListPostItemV2(post);
  }

  @Get(':postId')
  @RetrievePostDocs
  async getPost(@GetUser() userId: string, @Param('postId') postId: string) {
    const { post, keywords } = await this.postsService.readPost(userId, postId);
    const postKeywords = keywords.map(
      (postKeyword) => new KeywordItemV2(postKeyword.keyword),
    );
    const response = new RetrievePostV2Response({
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
    return new ListPostItemV2(post);
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
