import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'session_id', length: 64, unique: true })
  sessionId: string;

  @Column({ name: 'customer_name', length: 100, nullable: true })
  customerName: string;

  @Column({ name: 'customer_email', length: 100, nullable: true })
  customerEmail: string;

  @Column({ length: 20, default: 'open' }) // open | closed
  status: string;

  @Column({ name: 'unread_count', default: 0 })
  unreadCount: number;

  @Column({ name: 'last_message', type: 'text', nullable: true })
  lastMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
