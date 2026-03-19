import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ColorsService } from './colors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Color } from './color.entity';

@ApiTags('Colors')
@Controller('colors')
export class ColorsController {
  constructor(private readonly colorsService: ColorsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all colors' })
  findAll(@Query() query: any) {
    return this.colorsService.findAll(query);
  }

  @Get('families')
  @ApiOperation({ summary: 'Get color families' })
  findFamilies() {
    return this.colorsService.findFamilies();
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending colors' })
  findTrending() {
    return this.colorsService.findTrending();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.colorsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() dto: Partial<Color>) {
    return this.colorsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<Color>) {
    return this.colorsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.colorsService.remove(id);
  }
}
