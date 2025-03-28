import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('metrics')
export class Metrics extends BaseEntity {
  @Column({ name: 'is_success' })
  isSuccess: boolean;

  @Column()
  time: number;

  @Column({ name: 'post_url' })
  postURL: string;

  @Column({ name: 'post_id' })
  postId: string;
}
