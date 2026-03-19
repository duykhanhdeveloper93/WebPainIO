import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { News } from './news.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepo: Repository<News>,
  ) {}

  async findAll(query: any = {}) {
    const { page = 1, limit = 9, search, category, featured } = query;
    const skip = (page - 1) * limit;
    const where: any = { published: true };
    if (search) where.title = Like(`%${search}%`);
    if (category) where.category = category;
    if (featured === 'true') where.isFeatured = true;

    const [data, total] = await this.newsRepo.findAndCount({
      where,
      skip,
      take: +limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page: +page, limit: +limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const news = await this.newsRepo.findOne({ where: { id } });
    if (!news) throw new NotFoundException(`News #${id} not found`);
    await this.newsRepo.update(id, { viewCount: news.viewCount + 1 });
    return news;
  }

  async findBySlug(slug: string) {
    const news = await this.newsRepo.findOne({ where: { slug } });
    if (!news) throw new NotFoundException(`News '${slug}' not found`);
    await this.newsRepo.update(news.id, { viewCount: news.viewCount + 1 });
    return news;
  }

  async findFeatured() {
    return this.newsRepo.find({ where: { isFeatured: true, published: true }, take: 3, order: { createdAt: 'DESC' } });
  }

  async create(dto: Partial<News>) {
    if (!dto.slug && dto.title) {
      dto.slug = dto.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    }
    const news = this.newsRepo.create(dto);
    return this.newsRepo.save(news);
  }

  async update(id: number, dto: Partial<News>) {
    const news = await this.findOne(id);
    Object.assign(news, dto);
    return this.newsRepo.save(news);
  }

  async remove(id: number) {
    const news = await this.findOne(id);
    return this.newsRepo.remove(news);
  }
}
