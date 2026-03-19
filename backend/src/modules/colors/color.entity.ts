import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('colors')
export class Color {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'name_vi', length: 100, nullable: true })
  nameVi: string;

  @Column({ length: 20 })
  hex: string;

  @Column({ name: 'color_code', length: 50, nullable: true })
  colorCode: string;

  @Column({ length: 100, nullable: true })
  family: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_trending', default: false })
  isTrending: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
