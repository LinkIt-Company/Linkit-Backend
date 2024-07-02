import {
  Controller,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PostsService } from '@src/modules/posts/posts.service';
import { CreatePostDto } from '@src/modules/posts/dto/create-post.dto';
import { GetUser, PaginationMetadata } from '@src/common';
import { JwtGuard } from '@src/modules/users/guards';
import { ListPostQueryDto, UpdatePostDto } from './dto';
import { UpdatePostDocs } from './docs/updatePost.docs';
import { CreatePostDocs } from './docs';
import { ListPostDocs } from './docs/listPost.docs';
import { ListPostItem, ListPostResponse } from './response';

@ApiTags('posts')
@Controller('posts')
@UseGuards(JwtGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ListPostDocs
  async listPost(@GetUser() userId: string, @Query() query: ListPostQueryDto) {
    const { count, posts } = await this.postsService.listPost(userId, query);
    const postResponse = posts.map((post) => new ListPostItem(post));
    const metadata = new PaginationMetadata(query.page, query.limit, count);
    return new ListPostResponse(metadata, postResponse);
  }

  @Post()
  @CreatePostDocs
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @GetUser('id') userId: string,
  ): Promise<boolean> {
    return await this.postsService.createPost(createPostDto, userId);
  }

  @Patch(':postId')
  @UpdatePostDocs
  async updatePost(
    @GetUser() userId: string,
    @Param('postId') postId: string,
    @Body() dto: UpdatePostDto,
  ) {
    return await this.postsService.updatePost(userId, postId, dto);
  }
}
