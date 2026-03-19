import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Product } from '../products/product.entity';
import { News } from '../news/news.entity';
import { Contact } from '../contact/contact.entity';
import { ChatSession } from '../chat/chat-session.entity';
import { Color } from '../colors/color.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, News, Contact, ChatSession, Color])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
