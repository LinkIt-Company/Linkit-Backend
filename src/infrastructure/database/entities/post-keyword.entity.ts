import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Keyword } from './keyword.entity';
import { Post } from './post.entity';

@Entity('post_keywords')
export class PostKeyword extends BaseEntity {
  @PrimaryColumn({ name: 'post_id' })
  postId: string;

  @PrimaryColumn({ name: 'keyword_id' })
  keywordId: string;

  @ManyToOne(() => Post, (post) => post.postKeywords)
  @JoinColumn({ name: 'post_id' })
  post: Relation<Post>;

  @ManyToOne(() => Keyword, (keyword) => keyword.postKeywords)
  @JoinColumn({ name: 'keyword_id' })
  keyword: Relation<Keyword>;
}
