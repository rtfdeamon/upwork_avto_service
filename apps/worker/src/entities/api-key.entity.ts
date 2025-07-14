import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.apiKeys, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  upworkKey!: string;

  @Column()
  upworkSecret!: string;

  @Column({ nullable: true })
  refreshToken!: string;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt!: Date;

  @Column({ nullable: true })
  alias!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
