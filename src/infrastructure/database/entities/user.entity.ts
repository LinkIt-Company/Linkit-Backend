import { Column, Entity, OneToMany, Relation } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Folder } from './folder.entity';
import { Post } from './post.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'device_token', unique: true })
  deviceToken: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Relation<Post>[];

  @OneToMany(() => Folder, (folder) => folder.user)
  folders: Relation<Folder>[];
}
