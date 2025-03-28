import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Folder, FolderDocument } from '@src/infrastructure';
import { FolderType } from '@src/infrastructure/database/types/folder-type.enum';
import { F002 } from './error';

@Injectable()
export class FolderRepository {
  constructor(
    @InjectModel(Folder.name)
    private readonly folderModel: Model<Folder>,
  ) {}

  async create(userId: string, name: string, type: FolderType, visible = true) {
    const folder = await this.folderModel.create({
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
    const createdFolders = await this.folderModel.insertMany(
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
    const folders = await this.folderModel
      .find(onlyVisible ? { userId, visible: true } : { userId })
      .exec();
    return folders;
  }

  async checkUserHasFolder(userId: string, name: string) {
    const checkFolder = await this.folderModel
      .findOne({
        userId: userId,
        name: name,
        visible: true,
      })
      .exec();
    return checkFolder ? true : false;
  }

  async findOneOrFail(param: FilterQuery<FolderDocument>) {
    const folder = await this.folderModel.findOne(param).exec();
    if (!folder) {
      throw new NotFoundException(F002);
    }

    return folder;
  }

  async deleteAllCustomFolder(userId: string) {
    await this.folderModel.deleteMany({
      userId,
      type: FolderType.CUSTOM,
    });
  }

  async getDefaultFolder(userId: string) {
    const folder = await this.folderModel.findOne({
      userId,
      type: FolderType.DEFAULT,
    });

    return folder;
  }

  async getDefaultFolders(userId: string) {
    const folders = await this.folderModel.find({
      userId: userId,
      type: FolderType.DEFAULT,
    });
    return folders;
  }

  async makeFolderVisible(folderId: string) {
    await this.folderModel
      .findByIdAndUpdate(
        folderId,
        { $set: { visible: true } },
        { new: true, runValidators: true },
      )
      .exec();
  }
}
