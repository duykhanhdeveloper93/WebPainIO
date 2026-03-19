import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async findAll(query: any = {}) {
    const { page = 1, limit = 12, search, category, featured } = query;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (search) where.name = Like(`%${search}%`);
    if (featured !== undefined) where.isFeatured = featured === 'true';

    const options: FindManyOptions<Product> = {
      where,
      skip,
      take: +limit,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    };

    if (category) {
      const cat = await this.categoryRepo.findOne({ where: { slug: category } });
      if (cat) where['category'] = { id: cat.id };
    }

    const [data, total] = await this.productRepo.findAndCount(options);
    return { data, total, page: +page, limit: +limit, totalPages: Math.ceil(total / limit) };
  }

  async findFeatured() {
    return this.productRepo.find({
      where: { isFeatured: true, isActive: true },
      take: 6,
      order: { sortOrder: 'ASC' },
    });
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    return product;
  }

  async findBySlugCategory(slug: string) {
    const category = await this.categoryRepo.findOne({ where: { slug } });
    if (!category) throw new NotFoundException(`Category '${slug}' not found`);
    return this.productRepo.find({
      where: { category: { id: category.id }, isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async create(dto: CreateProductDto) {
    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    return this.productRepo.remove(product);
  }

  // Categories
  async findAllCategories() {
    return this.categoryRepo.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  async createCategory(dto: Partial<Category>) {
    const cat = this.categoryRepo.create(dto);
    return this.categoryRepo.save(cat);
  }
}
