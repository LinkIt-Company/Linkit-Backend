import { ApiProperty } from '@nestjs/swagger';

export class CreateUserResponse {
  @ApiProperty({
    description: '사용자 ID입니다',
  })
  userId: string;

  @ApiProperty({
    description: 'Access Token 입니다',
  })
  accessToken: string;

  constructor(userId: string, accessToken: string) {
    this.userId = userId;
    this.accessToken = accessToken;
  }
}
