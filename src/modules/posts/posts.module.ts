import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
import { PostsRepository } from '@src/modules/posts/posts.repository';
import { UsersModule } from '@src/modules/users/users.module';
import { AiClassificationModule } from '../ai-classification/ai-classification.module';
import { FolderRepository } from '../folders/folders.repository';
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
    UsersModule,
    AwsLambdaModule,
    AiClassificationModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostsRepository,
    FolderRepository,
    AwsLambdaService,
    PostKeywordsRepository,
    PostsPGRepository,
  ],
  exports: [PostsService, PostsRepository, PostsPGRepository],
})
export class PostsModule {}
