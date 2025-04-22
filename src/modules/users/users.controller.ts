import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDocs, UserControllerDocs } from './docs';
import { CreateUserDto } from './dto';
import { CreateUserResponse } from './response';
import { UsersService } from './users.service';

@Controller({ version: '1', path: 'users' })
@UserControllerDocs
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @CreateUserDocs
  async createUser(@Body() dto: CreateUserDto): Promise<CreateUserResponse> {
    const { userId, token } = await this.userService.createUser(dto);
    const response = new CreateUserResponse(userId, token);
    return response;
  }
}
