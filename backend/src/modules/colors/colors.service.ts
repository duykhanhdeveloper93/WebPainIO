import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Color } from './color.entity';

@Injectable()
export class ColorsService {
  constructor(
    @InjectRepository(Color)
    private colorRepo: Repository<Color>,
  ) {}

  async findAll(query: any = {}) {
    const { family, trending, search, page = 1, limit = 50 } = query;
    const qb = this.colorRepo.createQueryBuilder('c').where('c.isActive = :active', { active: true });

    if (family) qb.andWhere('c.family = :family', { family });
    if (trending === 'true') qb.andWhere('c.isTrending = :t', { t: true });
    if (search) qb.andWhere('(c.name LIKE :s OR c.nameVi LIKE :s OR c.colorCode LIKE :s)', { s: `%${search}%` });

    qb.orderBy('c.sortOrder', 'ASC').addOrderBy('c.name', 'ASC');
    qb.skip((page - 1) * limit).take(+limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page: +page };
  }

  async findFamilies() {
    const result = await this.colorRepo
      .createQueryBuilder('c')
      .select('DISTINCT c.family', 'family')
      .where('c.isActive = true AND c.family IS NOT NULL')
      .getRawMany();
    return result.map(r => r.family).filter(Boolean);
  }

  async findTrending() {
    return this.colorRepo.find({
      where: { isTrending: true, isActive: true },
      take: 12,
      order: { sortOrder: 'ASC' },
    });
  }

  async findOne(id: number) {
    const color = await this.colorRepo.findOne({ where: { id } });
    if (!color) throw new NotFoundException(`Color #${id} not found`);
    return color;
  }

  async create(dto: Partial<Color>) {
    const color = this.colorRepo.create(dto);
    return this.colorRepo.save(color);
  }

  async update(id: number, dto: Partial<Color>) {
    const color = await this.findOne(id);
    Object.assign(color, dto);
    return this.colorRepo.save(color);
  }

  async remove(id: number) {
    const color = await this.findOne(id);
    return this.colorRepo.remove(color);
  }
}
