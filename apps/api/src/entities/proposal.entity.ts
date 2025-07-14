import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum ProposalStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ERROR = 'ERROR',
}

@Entity()
export class Proposal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  jobId!: string;

  @Column('text')
  draft!: string;

  @Column({ type: 'enum', enum: ProposalStatus, default: ProposalStatus.DRAFT })
  status!: ProposalStatus;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt!: Date | null;

  @Column({ type: 'int', nullable: true })
  connectsUsed!: number | null;

  @Column({ type: 'text', nullable: true })
  errorReason!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
