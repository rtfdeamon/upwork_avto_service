import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ApiKey } from './api-key.entity';

export enum ProposalStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ERROR = 'ERROR',
}

export enum ProposalFeedback {
  UP = 'up',
  DOWN = 'down',
}

@Entity()
export class Proposal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  jobId!: string;

  @Column({ nullable: true })
  jobTitle!: string | null;

  @Column('text')
  draft!: string;

  @Column({ type: 'enum', enum: ProposalStatus, default: ProposalStatus.DRAFT })
  status!: ProposalStatus;

  @ManyToOne(() => ApiKey, { nullable: true, onDelete: 'SET NULL' })
  apiKey!: ApiKey | null;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt!: Date | null;

  @Column({ type: 'int', nullable: true })
  connectsUsed!: number | null;

  @Column({ type: 'text', nullable: true })
  errorReason!: string | null;

  @Column({ type: 'enum', enum: ProposalFeedback, nullable: true })
  feedback!: ProposalFeedback | null;

  @CreateDateColumn()
  createdAt!: Date;
}
