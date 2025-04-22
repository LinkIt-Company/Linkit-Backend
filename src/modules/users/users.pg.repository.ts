import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '@src/infrastructure/database/entities/user.entity';

@Injectable()
export class UsersPGRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findUserByDeviceToken(deviceToken: string) {
    const user = await this.findOne({
      where: {
        deviceToken: deviceToken,
      },
    });
    return user;
  }

  async findOrCreate(deviceToken: string) {
    const newUser = await this.save({
      deviceToken: deviceToken,
    });

    return newUser;
  }
}
