import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Conversation {
  @PrimaryColumn()
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  jobId!: string;

  @Column('text')
  snippet!: string;

  @Column({ type: 'timestamptz' })
  ts!: Date;
}
