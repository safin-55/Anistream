import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { UploaderStatus } from '../../../common/domain';
import { User } from '../../user/entities/user.entity';

@Entity('uploader_requests')
export class UploaderRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 500 })
  reason!: string;

  @Column({ type: 'varchar', length: 10, default: UploaderStatus.PENDING })
  status!: UploaderStatus;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy!: string | null;

  @ManyToOne(() => User, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer!: User | null;

  @Column({ name: 'review_note', type: 'varchar', length: 500, nullable: true })
  reviewNote!: string | null;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}