import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Folder as FolderMongoEntity,
  FolderSchema,
  User as UserMongoEntity,
  UserSchema,
} from '@src/infrastructure';
import { Folder } from '@src/infrastructure/database/entities/folder.entity';
import { User } from '@src/infrastructure/database/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { FoldersPGRepository } from '../folders/folders.pg.repository';
import { FolderRepository } from '../folders/folders.repository';
import { JwtStrategy } from './guards/strategy';
import { UsersController } from './users.controller';
import { UsersPGRepository } from './users.pg.repository';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { UsersV2Service } from './users.v2.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Folder, User]),
    /** @deprecated */
    MongooseModule.forFeature([
      { name: UserMongoEntity.name, schema: UserSchema },
      { name: FolderMongoEntity.name, schema: FolderSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersV2Service,
    UsersPGRepository,
    FoldersPGRepository,
    JwtStrategy,

    /** @deprecated */
    UsersService,
    UsersRepository,
    FolderRepository,
  ],
})
export class UsersModule {}
