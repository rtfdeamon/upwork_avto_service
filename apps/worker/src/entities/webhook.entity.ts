import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum WebhookType {
  SLACK = 'SLACK',
  TG = 'TG',
}

@Entity()
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  url!: string;

  @Column({ type: 'enum', enum: WebhookType })
  type!: WebhookType;

  @Column()
  secret!: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
