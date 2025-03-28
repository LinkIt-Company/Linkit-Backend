import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Relation,
} from 'typeorm';
import { FolderType } from '@src/infrastructure/database/types/folder-type.enum';
import { BaseEntity } from './base.entity';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity('folders')
export class Folder extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: FolderType })
  type: FolderType;

  @Column({ default: true })
  visible: boolean;

  @ManyToOne(() => User, (user) => user.folders)
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @OneToMany(() => Post, (post) => post.folder)
  posts: Relation<Post>[];
}
