import { ApiProperty } from '@nestjs/swagger';
import { Keyword } from '@src/infrastructure/database/entities/keyword.entity';

export class KeywordItemV2 {
  @ApiProperty({ description: '키워드 id' })
  id: string;

  @ApiProperty({ description: '키워드 이름' })
  name: string;

  constructor(keyword: Keyword) {
    this.id = keyword.id;
    this.name = keyword.name;
  }
}
