import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  replied: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
