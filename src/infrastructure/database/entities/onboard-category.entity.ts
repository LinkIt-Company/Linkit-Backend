import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('onboard_categories')
export class OnboardCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  category: string;
}
