import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '../../../common/domain';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 32, unique: true })
  username!: string;

  @Column({ type: 'varchar', length: 254, unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 60, select: false })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 10, default: UserRole.USER })
  role!: UserRole;

  @Column({ name: 'is_verified_uploader', type: 'boolean', default: false })
  isVerifiedUploader!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}