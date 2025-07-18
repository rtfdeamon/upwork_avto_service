import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Proposal } from './proposal.entity';

@Entity()
export class Conversation {
  @PrimaryColumn()
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  proposalId!: string;

  @ManyToOne(() => Proposal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'proposalId' })
  proposal!: Proposal;

  @Column()
  jobId!: string;

  @Column({ nullable: true })
  jobTitle?: string;

  @Column('text')
  snippet!: string;

  @Column({ type: 'timestamptz' })
  ts!: Date;
}
