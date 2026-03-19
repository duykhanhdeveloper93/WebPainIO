import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { News } from './news.entity';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  findAll(@Query() query: any) { return this.newsService.findAll(query); }

  @Get('featured')
  findFeatured() { return this.newsService.findFeatured(); }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) { return this.newsService.findBySlug(slug); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.newsService.findOne(id); }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() dto: Partial<News>) { return this.newsService.create(dto); }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<News>) { return this.newsService.update(id, dto); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) { return this.newsService.remove(id); }
}
