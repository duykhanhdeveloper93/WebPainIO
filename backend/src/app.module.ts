import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './modules/products/products.module';
import { ColorsModule } from './modules/colors/colors.module';
import { NewsModule } from './modules/news/news.module';
import { ContactModule } from './modules/contact/contact.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        type: 'mysql',
        host: cfg.get('DB_HOST', 'localhost'),
        port: cfg.get<number>('DB_PORT', 3306),
        username: cfg.get('DB_USERNAME', 'paintco'),
        password: cfg.get('DB_PASSWORD', 'paintco123'),
        database: cfg.get('DB_DATABASE', 'paintco_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: cfg.get('NODE_ENV') !== 'production',
        ssl: cfg.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
        extra: cfg.get('NODE_ENV') === 'production' ? {
          ssl: { rejectUnauthorized: false }
        } : {},
        logging: false,
        charset: 'utf8mb4',
      }),
      inject: [ConfigService],
    }),
    ProductsModule,
    ColorsModule,
    NewsModule,
    ContactModule,
    AuthModule,
    ChatModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
