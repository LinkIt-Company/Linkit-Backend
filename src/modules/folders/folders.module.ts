import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from '@src/infrastructure/database/entities/folder.entity';
import { Post } from '@src/infrastructure/database/entities/post.entity';
import {
  Folder as FolderMongoEntity,
  FolderSchema,
  Post as PostMongoEntity,
  PostSchema,
} from '@src/infrastructure/database/schema';
import { ClassificationModule } from '@src/modules/classification/classification.module';
import { PostsModule } from '../posts/posts.module';
import { PostsPGRepository } from '../posts/posts.pg.repository';
import { FoldersController } from './folders.controller';
import { FoldersPGRepository } from './folders.pg.repository';
import { FolderRepository } from './folders.repository';
import { FoldersService } from './folders.service';
import { FoldersV2Controller } from './folders.v2.controller';
import { FoldersV2Service } from './folders.v2.service';

@Module({
  imports: [
    ClassificationModule,
    TypeOrmModule.forFeature([Folder, Post]),
    /** @deprecated */
    MongooseModule.forFeature([
      { name: PostMongoEntity.name, schema: PostSchema },
      { name: FolderMongoEntity.name, schema: FolderSchema },
    ]),
    PostsModule,
  ],
  controllers: [FoldersController, FoldersV2Controller],
  providers: [
    FoldersService,
    FoldersV2Service,
    FoldersPGRepository,
    PostsPGRepository,
    /** @deprecated */
    FolderRepository,
  ],
})
export class FoldersModule {}
