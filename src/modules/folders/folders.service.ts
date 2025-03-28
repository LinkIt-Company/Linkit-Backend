import { BadRequestException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { sum } from '@src/common';
import { FolderType } from '@src/infrastructure/database/types/folder-type.enum';
import { PostsRepository } from '../posts/posts.repository';
import { FolderListServiceDto } from './dto/folder-list-service.dto';
import { CreateFolderDto, UpdateFolderDto } from './dto/mutate-folder.dto';
import { F001, F003 } from './error';
import { FolderRepository } from './folders.repository';

@Injectable()
export class FoldersService {
  constructor(
    private readonly folderRepository: FolderRepository,
    private readonly postRepository: PostsRepository,
  ) {}

  async createMany(userId: string, createFolderDto: CreateFolderDto) {
    for (const folderName of createFolderDto.names) {
      const isExist = await this.folderRepository.checkUserHasFolder(
        userId,
        folderName,
      );
      if (isExist) {
        throw new BadRequestException(F001(folderName));
      }
    }
    const folders = createFolderDto.names.map((name) => ({
      userId: userId,
      name,
      type: FolderType.CUSTOM,
    }));
    const createdFolders = this.folderRepository.createMany(folders);
    return createdFolders;
  }

  async findAll(userId: string): Promise<FolderListServiceDto> {
    const folders = await this.folderRepository.findByUserId(userId);
    const folderIds = folders.map((folder) => folder._id);

    const groupedFolders =
      await this.postRepository.getPostCountByFolderIds(folderIds);

    const allPostCount = sum(groupedFolders, (folder) => folder.postCount);
    const favoritePostCount =
      await this.postRepository.findFavoritePostCount(userId);

    const defaultFolder = folders.find(
      (folder) => folder.type === FolderType.DEFAULT,
    );
    const customFolders = folders
      .filter((folder) => folder.type === FolderType.CUSTOM)
      .map((folder) => {
        const post = groupedFolders.find((groupedFolder) =>
          groupedFolder._id.equals(folder._id),
        );
        return {
          ...folder.toJSON(),
          postCount: post?.postCount ?? 0,
        };
      });
    const customFoldersPostCount = sum(
      customFolders,
      (folder) => folder.postCount,
    );
    const all = {
      id: null,
      name: '전체',
      type: FolderType.ALL,
      userId: new Types.ObjectId(userId),
      postCount: allPostCount,
    };
    const favorite = {
      id: null,
      name: '즐겨찾기',
      type: FolderType.FAVORITE,
      userId: new Types.ObjectId(userId),
      postCount: favoritePostCount,
    };
    const readLater = {
      id: defaultFolder.id,
      name: defaultFolder.name,
      type: FolderType.DEFAULT,
      userId: new Types.ObjectId(userId),
      postCount: allPostCount - customFoldersPostCount,
    };

    const defaultFolders = [all, favorite, readLater].filter(
      (folder) => !!folder,
    );
    return { defaultFolders, customFolders };
  }

  async findOne(userId: string, folderId: string) {
    const postCount = await this.postRepository.getCountByFolderId(folderId);
    const folder = await this.folderRepository.findOneOrFail({
      _id: folderId,
      userId,
    });

    return { ...folder.toJSON(), postCount };
  }

  async update(
    userId: string,
    folderId: string,
    updateFolderDto: UpdateFolderDto,
  ) {
    const folder = await this.folderRepository.findOneOrFail({
      _id: folderId,
      userId,
    });

    if (folder.name === updateFolderDto.name) {
      throw new BadRequestException(F003(folder.name));
    }

    folder.name = updateFolderDto.name;
    const response = await folder.save();
    return response;
  }

  async remove(userId: string, folderId: string) {
    const folder = await this.folderRepository.findOneOrFail({
      userId,
      _id: folderId,
    });

    await folder.deleteOne().exec();
  }

  async removeAllCustomFolders(userId: string) {
    await this.folderRepository.deleteAllCustomFolder(userId);
  }
}
