import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { News } from '../news/news.entity';
import { Contact } from '../contact/contact.entity';
import { ChatSession } from '../chat/chat-session.entity';
import { Color } from '../colors/color.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(News)    private newsRepo: Repository<News>,
    @InjectRepository(Contact) private contactRepo: Repository<Contact>,
    @InjectRepository(ChatSession) private sessionRepo: Repository<ChatSession>,
    @InjectRepository(Color)   private colorRepo: Repository<Color>,
  ) {}

  async getOverview() {
    const [products, news, contacts, colors, sessions] = await Promise.all([
      this.productRepo.count({ where: { isActive: true } }),
      this.newsRepo.count({ where: { published: true } }),
      this.contactRepo.count(),
      this.colorRepo.count({ where: { isActive: true } }),
      this.sessionRepo.count(),
    ]);

    const unreplied = await this.contactRepo.count({ where: { replied: false } });
    const openChats = await this.sessionRepo.count({ where: { status: 'open' } });

    // This week contacts
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const weekContacts = await this.contactRepo
      .createQueryBuilder('c')
      .where('c.created_at >= :date', { date: weekAgo })
      .getCount();

    return { products, news, contacts, colors, sessions, unreplied, openChats, weekContacts };
  }

  async getContactsChart() {
    return this.contactRepo
      .createQueryBuilder('c')
      .select("DATE(c.created_at)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where("c.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)")
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();
  }

  async getTopNews() {
    return this.newsRepo.find({
      where: { published: true },
      order: { viewCount: 'DESC' },
      take: 5,
      select: ['id','title','viewCount','category','createdAt'],
    });
  }

  async getProductsByCategory() {
    return this.productRepo
      .createQueryBuilder('p')
      .leftJoin('p.category', 'cat')
      .select('cat.nameVi', 'category')
      .addSelect('COUNT(p.id)', 'count')
      .where('p.isActive = true')
      .groupBy('cat.id')
      .getRawMany();
  }

  async getRecentContacts() {
    return this.contactRepo.find({ order: { createdAt: 'DESC' }, take: 5 });
  }
}
