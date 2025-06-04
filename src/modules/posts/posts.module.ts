import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AIClassification,
  AIClassificationSchema,
  Folder,
  FolderSchema,
  Post,
  PostSchema,
} from '@src/infrastructure';
import { AwsLambdaModule } from '@src/infrastructure/aws-lambda/aws-lambda.module';
import { AwsLambdaService } from '@src/infrastructure/aws-lambda/aws-lambda.service';
import {
  PostKeyword,
  PostKeywordSchema,
} from '@src/infrastructure/database/schema/postKeyword.schema';
import { FoldersModule } from '@src/modules/folders/folders.module';
import { FoldersPGRepository } from '@src/modules/folders/folders.pg.repository';
import { FolderRepository } from '@src/modules/folders/folders.repository';
import { PostKeywordsPGRepository } from '@src/modules/posts/postKeywords.pg.repository';
import { PostsRepository } from '@src/modules/posts/posts.repository';
import { PostsV2Controller } from '@src/modules/posts/posts.v2.controller';
import { PostsV2Service } from '@src/modules/posts/posts.v2.service';
import { UsersModule } from '@src/modules/users/users.module';
import { AiClassificationModule } from '../ai-classification/ai-classification.module';
import { PostKeywordsRepository } from './postKeywords.repository';
import { PostsController } from './posts.controller';
import { PostsPGRepository } from './posts.pg.repository';
import { PostsService } from './posts.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Folder.name, schema: FolderSchema },
      { name: AIClassification.name, schema: AIClassificationSchema },
      { name: PostKeyword.name, schema: PostKeywordSchema },
    ]),
    TypeOrmModule.forFeature([
      PostsPGRepository,
      PostKeywordsPGRepository,
      FoldersPGRepository,
    ]),
    UsersModule,
    AwsLambdaModule,
    AiClassificationModule,
    forwardRef(() => FoldersModule),
  ],
  controllers: [PostsController, PostsV2Controller],
  providers: [
    PostsService,
    PostsRepository,
    FolderRepository,
    AwsLambdaService,
    PostKeywordsRepository,
    PostsPGRepository,
    FoldersPGRepository,
    PostKeywordsPGRepository,
    PostsV2Service,
  ],
  exports: [
    PostsService,
    PostsRepository,
    PostsV2Service,
    PostsPGRepository,
    PostKeywordsRepository,
  ],
})
export class PostsModule {}
