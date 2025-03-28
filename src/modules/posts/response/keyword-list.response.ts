import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { Keyword } from '@src/infrastructure';

export class KeywordItem {
  @ApiProperty({ description: '키워드 id' })
  id: string;

  @ApiProperty({ description: '키워드 이름' })
  name: string;

  constructor(keyword: Keyword & { _id: Types.ObjectId }) {
    this.id = keyword._id.toString();
    this.name = keyword.name;
  }
}
