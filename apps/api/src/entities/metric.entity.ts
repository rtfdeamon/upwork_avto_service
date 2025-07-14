import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Metric {
  @PrimaryColumn({ type: 'date' })
  day!: Date;

  @PrimaryColumn('uuid')
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'int', default: 0 })
  sent!: number;

  @Column({ type: 'int', default: 0 })
  replies!: number;

  @Column({ type: 'int', default: 0 })
  wins!: number;
}
