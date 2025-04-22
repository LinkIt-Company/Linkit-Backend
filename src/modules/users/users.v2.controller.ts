import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDocs, UserControllerDocs } from './docs';
import { CreateUserDto } from './dto';
import { CreateUserResponse } from './response';
import { UsersV2Service } from './users.v2.service';

@UserControllerDocs
@Controller({ version: '2', path: 'users' })
export class UsersController {
  constructor(private readonly userService: UsersV2Service) {}

  @Post()
  @CreateUserDocs
  async createUser(@Body() dto: CreateUserDto): Promise<CreateUserResponse> {
    const { userId, token } = await this.userService.createUser(dto);
    const response = new CreateUserResponse(userId, token);
    return response;
  }
}
