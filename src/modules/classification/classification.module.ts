import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AIClassification,
  AIClassificationSchema,
  Folder,
  FolderSchema,
  Post,
  PostSchema,
} from '@src/infrastructure/database/schema';
import { FoldersPGRepository } from '../folders/folders.pg.repository';
import { FolderRepository } from '../folders/folders.repository';
import { PostsPGRepository } from '../posts/posts.pg.repository';
import { PostsRepository } from '../posts/posts.repository';
import { ClassificationController } from './classification.controller';
import { ClassificationPGRepository } from './classification.pg.repository';
import { ClassficiationRepository } from './classification.repository';
import { ClassificationService } from './classification.service';
import { ClassificationV2Controller } from './classification.v2.controller';
import { ClassificationV2Service } from './classification.v2.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Folder.name, schema: FolderSchema },
      { name: AIClassification.name, schema: AIClassificationSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [ClassificationController, ClassificationV2Controller],
  providers: [
    ClassificationService,
    ClassificationV2Service,
    ClassficiationRepository,
    ClassificationPGRepository,
    PostsRepository,
    PostsPGRepository,
    FolderRepository,
    FoldersPGRepository,
  ],
  exports: [ClassificationService],
})
export class ClassificationModule {}
