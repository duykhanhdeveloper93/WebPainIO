import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from './category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'name_vi', length: 255, nullable: true })
  nameVi: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'description_vi', type: 'text', nullable: true })
  descriptionVi: string;

  @Column({ name: 'short_desc', length: 500, nullable: true })
  shortDesc: string;

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl: string;

  @Column({ name: 'price_range', length: 100, nullable: true })
  priceRange: string;

  @Column({ length: 100, nullable: true })
  coverage: string;

  @Column({ length: 100, nullable: true })
  finish: string;

  @Column({ length: 100, nullable: true })
  brand: string;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @ManyToOne(() => Category, cat => cat.products, { eager: true, nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
