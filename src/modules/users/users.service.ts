import { Injectable } from '@nestjs/common';
import { JwtPayload } from 'src/common/types/type';
import { DEFAULT_FOLDER_NAME } from '@src/common/constant';
import { FolderType } from '@src/infrastructure/database/types/folder-type.enum';
import { AuthService } from '../auth/auth.service';
import { FolderRepository } from '../folders/folders.repository';
import { CreateUserDto } from './dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly folderRepository: FolderRepository,
    private readonly authService: AuthService,
  ) {}

  async createUser(
    dto: CreateUserDto,
  ): Promise<{ userId: string; token: string }> {
    let user = await this.userRepository.findUserByDeviceToken(dto.deviceToken);
    if (!user) {
      // 새로운 user의 ID
      user = await this.userRepository.findOrCreate(dto.deviceToken);
      await this.folderRepository.create(
        user._id.toString(),
        DEFAULT_FOLDER_NAME,
        FolderType.DEFAULT,
      );
    }

    const userId = user._id.toString();
    // JWT Token Payload
    const tokenPayload: JwtPayload = {
      id: userId,
    };
    // JWT Token 발급
    const token = await this.authService.issueAccessToken(tokenPayload);

    return {
      userId: userId,
      token: token,
    };
  }
}
