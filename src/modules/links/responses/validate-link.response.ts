import { ApiProperty } from '@nestjs/swagger';

export class ValidateLinkResponse {
  @ApiProperty()
  isValidate: boolean;

  constructor(isValidate: boolean) {
    this.isValidate = isValidate;
  }
}
