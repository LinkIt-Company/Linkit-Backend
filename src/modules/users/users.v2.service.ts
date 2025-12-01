import { Injectable } from '@nestjs/common';
import { JwtPayload } from 'src/common/types/type';
import { DEFAULT_FOLDER_NAME } from '@src/common/constant';
import { FolderType } from '@src/infrastructure/database/types/folder-type.enum';
import { AuthService } from '../auth/auth.service';
import { FoldersPGRepository } from '../folders/folders.pg.repository';
import { CreateUserDto } from './dto';
import { UsersPGRepository } from './users.pg.repository';

@Injectable()
export class UsersV2Service {
  constructor(
    private readonly userRepository: UsersPGRepository,
    private readonly folderRepository: FoldersPGRepository,
    private readonly authService: AuthService,
  ) {}

  async createUser(
    dto: CreateUserDto,
  ): Promise<{ userId: string; token: string }> {
    let user = await this.userRepository.findUserByDeviceToken(dto.deviceToken);
    if (!user) {
      // 새로운 user의 ID
      user = await this.userRepository.findOrCreate(dto.deviceToken);
      await this.folderRepository.createOne(
        user.id,
        DEFAULT_FOLDER_NAME,
        FolderType.DEFAULT,
      );
    }

    // JWT Token Payload
    const tokenPayload: JwtPayload = {
      id: user.id,
    };
    // JWT Token 발급
    const token = await this.authService.issueAccessToken(tokenPayload);

    return {
      userId: user.id,
      token: token,
    };
  }
}
