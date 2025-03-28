import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Relation,
} from 'typeorm';
import { PostAiStatus } from '@src/modules/posts/posts.constant';
import { AIClassification } from './ai-classification.entity';
import { BaseEntity } from './base.entity';
import { Folder } from './folder.entity';
import { PostKeyword } from './post-keyword.entity';
import { User } from './user.entity';

@Entity('posts')
export class Post extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'folder_id' })
  folderId: string;

  @Column()
  url: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'is_favorite', default: false })
  isFavorite: boolean;

  @Column({ name: 'read_at', nullable: true })
  readAt: Date;

  @Column({ name: 'thumbnail_img_url', nullable: true })
  thumbnailImgUrl: string;

  @Column({ name: 'ai_status', type: 'enum', enum: PostAiStatus })
  aiStatus: PostAiStatus;

  @Column({ name: 'ai_classification_id', nullable: true })
  aiClassificationId: string;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @ManyToOne(() => Folder, (folder) => folder.posts)
  @JoinColumn({ name: 'folder_id' })
  folder: Relation<Folder>;

  @ManyToOne(() => AIClassification)
  @JoinColumn({ name: 'ai_classification_id' })
  aiClassification: Relation<AIClassification>;

  @OneToMany(() => PostKeyword, (postKeyword) => postKeyword.post)
  postKeywords: Relation<PostKeyword>[];
}
