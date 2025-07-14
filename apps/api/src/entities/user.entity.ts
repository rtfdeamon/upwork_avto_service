import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { ApiKey } from './api-key.entity';

export enum UserRole {
  OWNER = 'OWNER',
  SDR = 'SDR',
  VIEWER = 'VIEWER',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.OWNER })
  role!: UserRole;

  @Column()
  hashedPw!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => ApiKey, (key) => key.user)
  apiKeys!: ApiKey[];
}
