import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder, FolderSchema, Post, PostSchema } from '@src/infrastructure';
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
    TypeOrmModule.forFeature([FoldersPGRepository, PostsPGRepository]),
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Folder.name, schema: FolderSchema },
    ]),
    PostsModule,
  ],
  controllers: [FoldersController, FoldersV2Controller],
  providers: [FoldersService, FoldersV2Service, FolderRepository],
})
export class FoldersModule {}
