import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  Relation,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Folder } from './folder.entity';

@Entity('ai_classifications')
export class AIClassification extends BaseEntity {
  @Column({ name: 'suggested_folder_id' })
  suggestedFolderId: string;

  @Column()
  url: string;

  @Column()
  description: string;

  @Column('text', { array: true })
  keywords: string[];

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Folder)
  @JoinColumn({ name: 'suggested_folder_id' })
  suggestedFolder: Relation<Folder>;
}
