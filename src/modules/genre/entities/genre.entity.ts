
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
 
@Entity('genres')

export class Genre {

  @PrimaryGeneratedColumn('uuid')

  id!: string;
 
  @Column({ type: 'varchar', length: 80 })

  name!: string;
 
  @Column({ name: 'is_published', type: 'boolean', default: false })

  isPublished!: boolean;

}

