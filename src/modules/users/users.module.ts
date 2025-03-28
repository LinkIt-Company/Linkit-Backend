import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Folder, FolderSchema, User, UserSchema } from '@src/infrastructure';
import { AuthModule } from '../auth/auth.module';
import { FolderRepository } from '../folders/folders.repository';
import { JwtStrategy } from './guards/strategy';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Folder.name, schema: FolderSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, FolderRepository, JwtStrategy],
})
export class UsersModule {}
