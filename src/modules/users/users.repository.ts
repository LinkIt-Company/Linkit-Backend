import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@src/infrastructure';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findUserByDeviceToken(deviceToken: string) {
    const user = await this.userModel
      .findOne({
        deviceToken: deviceToken,
      })
      .lean();
    return user;
  }

  async findOrCreate(deviceToken: string) {
    const newUser = await this.userModel.create({
      deviceToken: deviceToken,
    });
    return newUser;
  }
}
