import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  @Get('overview')  getOverview()         { return this.analytics.getOverview(); }
  @Get('contacts')  getContactsChart()    { return this.analytics.getContactsChart(); }
  @Get('top-news')  getTopNews()          { return this.analytics.getTopNews(); }
  @Get('products')  getProductsByCategory() { return this.analytics.getProductsByCategory(); }
  @Get('recent-contacts') getRecentContacts() { return this.analytics.getRecentContacts(); }
}
