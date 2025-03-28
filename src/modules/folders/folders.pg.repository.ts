import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Folder } from '@src/infrastructure/database/entities/folder.entity';
import { FolderType } from '@src/infrastructure/database/types/folder-type.enum';

@Injectable()
export class FoldersPGRepository extends Repository<Folder> {
  constructor(private dataSource: DataSource) {
    super(Folder, dataSource.createEntityManager());
  }

  async createOne(
    userId: string,
    name: string,
    type: FolderType,
    visible = true,
  ) {
    const folder = await this.insert({
      userId,
      name,
      type,
      visible,
    });

    return folder;
  }

  async createMany(
    folders: { userId: string; name: string; type: FolderType }[],
  ) {
    const createdFolders = await this.insert(
      folders.map((folder) => {
        return {
          ...folder,
          visible: true,
        };
      }),
    );
    return createdFolders;
  }

  async findByUserId(userId: string, onlyVisible = true) {
    const where = onlyVisible ? { userId, visible: true } : { userId };
    const folders = await this.find({ where });

    return folders;
  }

  async checkUserHasFolder(userId: string, name: string) {
    const checkFolder = await this.findOne({
      where: {
        userId: userId,
        name: name,
        visible: true,
      },
    });

    return checkFolder ? true : false;
  }

  async deleteAllCustomFolder(userId: string) {
    await this.delete({
      userId,
      type: FolderType.CUSTOM,
    });
  }

  async getDefaultFolder(userId: string) {
    const folder = await this.findOne({
      where: {
        userId,
        type: FolderType.DEFAULT,
      },
    });

    return folder;
  }

  async getDefaultFolders(userId: string) {
    const folders = await this.find({
      where: {
        userId: userId,
        type: FolderType.DEFAULT,
      },
    });
    return folders;
  }

  async makeFolderVisible(folderId: string) {
    await this.update(folderId, { visible: true });
  }
}
