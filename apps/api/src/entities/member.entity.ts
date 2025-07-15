import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum MemberRole {
  SDR = 'SDR',
  VIEWER = 'VIEWER',
}

@Entity()
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  owner!: User;

  @Column()
  email!: string;

  @Column({ type: 'enum', enum: MemberRole })
  role!: MemberRole;

  @CreateDateColumn()
  invitedAt!: Date;
}
