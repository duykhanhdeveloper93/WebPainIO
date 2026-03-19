import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'session_id', length: 64 })
  @Index()
  sessionId: string;

  @Column({ name: 'sender_type', length: 10 })
  senderType: string; // 'customer' | 'admin'

  @Column({ name: 'sender_name', length: 100, nullable: true })
  senderName: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  // 'text' | 'emoji' | 'sticker' | 'file' | 'image'
  @Column({ name: 'msg_type', length: 20, default: 'text' })
  msgType: string;

  // For file/image/sticker: store URL or emoji code
  @Column({ name: 'file_url', length: 500, nullable: true })
  fileUrl: string;

  @Column({ name: 'file_name', length: 255, nullable: true })
  fileName: string;

  @Column({ name: 'file_size', nullable: true })
  fileSize: number;

  @Column({ name: 'mime_type', length: 100, nullable: true })
  mimeType: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
