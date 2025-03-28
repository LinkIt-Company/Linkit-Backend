import { Column, Entity, OneToMany, Relation } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PostKeyword } from './post-keyword.entity';

@Entity('keywords')
export class Keyword extends BaseEntity {
  @Column()
  name: string;

  @OneToMany(() => PostKeyword, (postKeyword) => postKeyword.keyword)
  postKeywords: Relation<PostKeyword>[];
}
