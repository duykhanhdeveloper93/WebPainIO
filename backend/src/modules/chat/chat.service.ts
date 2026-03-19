import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './chat-message.entity';
import { ChatSession } from './chat-session.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage) private msgRepo: Repository<ChatMessage>,
    @InjectRepository(ChatSession) private sessionRepo: Repository<ChatSession>,
  ) {}

  async getOrCreateSession(sessionId: string, name?: string, email?: string): Promise<ChatSession> {
    let session = await this.sessionRepo.findOne({ where: { sessionId } });
    if (!session) {
      session = this.sessionRepo.create({
        sessionId,
        customerName: name || 'Khách hàng',
        customerEmail: email || null,
        status: 'open',
      });
      await this.sessionRepo.save(session);
    } else if (name && !session.customerName) {
      session.customerName = name;
      if (email) session.customerEmail = email;
      await this.sessionRepo.save(session);
    }
    return session;
  }

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    return this.msgRepo.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
      take: 200,
    });
  }

  async saveMessage(data: {
    sessionId: string;
    senderType: string;
    message?: string;
    senderName?: string;
    msgType?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  }): Promise<ChatMessage> {
    if (data.senderType === 'customer') {
      await this.sessionRepo.increment({ sessionId: data.sessionId }, 'unreadCount', 1);
    }
    const msg = this.msgRepo.create({
      sessionId: data.sessionId,
      senderType: data.senderType,
      senderName: data.senderName,
      message: data.message,
      msgType: data.msgType || 'text',
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
    });
    return this.msgRepo.save(msg);
  }

  async markAllRead(sessionId: string): Promise<void> {
    await this.msgRepo.update({ sessionId, isRead: false }, { isRead: true });
    await this.sessionRepo.update({ sessionId }, { unreadCount: 0 });
  }

  async updateLastMessage(sessionId: string, message: string): Promise<ChatSession> {
    await this.sessionRepo.update({ sessionId }, { lastMessage: message });
    return this.sessionRepo.findOne({ where: { sessionId } });
  }

  async getAllSessions(): Promise<ChatSession[]> {
    return this.sessionRepo.find({ order: { updatedAt: 'DESC' }, take: 100 });
  }

  async closeSession(sessionId: string): Promise<void> {
    await this.sessionRepo.update({ sessionId }, { status: 'closed' });
  }

  async getStats() {
    const totalSessions   = await this.sessionRepo.count();
    const openSessions    = await this.sessionRepo.count({ where: { status: 'open' } });
    const totalMessages   = await this.msgRepo.count();
    const todayStart      = new Date(); todayStart.setHours(0,0,0,0);
    const todayMessages   = await this.msgRepo.createQueryBuilder('m')
      .where('m.created_at >= :s', { s: todayStart }).getCount();
    const raw = await this.msgRepo.createQueryBuilder('m')
      .select("DATE(m.created_at)", 'date').addSelect('COUNT(*)', 'count')
      .where("m.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)")
      .groupBy('date').orderBy('date','ASC').getRawMany();
    return { totalSessions, openSessions, totalMessages, todayMessages, dailyStats: raw };
  }
}
