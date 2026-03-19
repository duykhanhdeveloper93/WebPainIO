import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  featuredProducts = signal<any[]>([]);
  trendingColors = signal<any[]>([]);
  featuredNews = signal<any[]>([]);
  activeSlide = signal(0);

  slides = [
    {
      label: 'Công nghệ Ion Bạc',
      title: 'Bảo Vệ Hoàn Hảo\nCho Ngôi Nhà',
      desc: 'Dòng sơn cao cấp diệt 99% vi khuẩn, chống bám bẩn tuyệt đối với công nghệ tiên tiến nhất Châu Á.',
      cta: 'Khám phá ngay',
      bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
      accent: '#C8102E',
      img: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=700&q=80'
    },
    {
      label: 'Chống Thấm 15 Năm',
      title: 'Ngoại Thất Vững\nTrước Mọi Thời Tiết',
      desc: 'WeatherGuard Plus — lớp giáp bảo vệ ngôi nhà bạn trước mưa gió, tia UV và ẩm mốc suốt 15 năm.',
      cta: 'Xem sản phẩm',
      bg: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 40%, #415a77 100%)',
      accent: '#C9A84C',
      img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80'
    },
    {
      label: 'Hơn 2000 Màu Sắc',
      title: 'Tô Màu Ước Mơ\nCủa Bạn',
      desc: 'Thư viện màu sắc phong phú với hơn 2000 mã màu. Công cụ phối màu thông minh giúp bạn tìm tông màu lý tưởng.',
      cta: 'Xem bảng màu',
      bg: 'linear-gradient(135deg, #2d0b0b 0%, #5c1010 40%, #8b1a1a 100%)',
      accent: '#F7E7CE',
      img: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=700&q=80'
    }
  ];

  features = [
    { icon: '🛡️', title: 'Bền 15 Năm', desc: 'Cam kết chất lượng với công nghệ bảo vệ vượt trội theo thời gian' },
    { icon: '🦠', title: 'Kháng Khuẩn 99%', desc: 'Ion bạc tiêu diệt vi khuẩn, nấm mốc bảo vệ sức khỏe gia đình' },
    { icon: '🌿', title: 'Thân Thiện Môi Trường', desc: 'Zero VOC, an toàn tuyệt đối cho trẻ em và thai phụ' },
    { icon: '🎨', title: '2000+ Màu Sắc', desc: 'Thư viện màu sắc phong phú với công cụ phối màu thông minh' },
    { icon: '⚡', title: 'Khô Nhanh 30 Phút', desc: 'Công nghệ khô nhanh tiết kiệm thời gian thi công' },
    { icon: '🏆', title: 'Số 1 Châu Á', desc: 'Thương hiệu được tin dùng tại 30 quốc gia trên thế giới' },
  ];

  stats = [
    { value: '30+', label: 'Quốc gia' },
    { value: '2000+', label: 'Mã màu' },
    { value: '50+', label: 'Năm kinh nghiệm' },
    { value: '99%', label: 'Kháng khuẩn' },
  ];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any>('products/featured').subscribe({ next: d => this.featuredProducts.set(d), error: () => this.featuredProducts.set(this.mockProducts()) });
    this.api.get<any>('colors/trending').subscribe({ next: d => this.trendingColors.set(d), error: () => this.trendingColors.set(this.mockColors()) });
    this.api.get<any>('news/featured').subscribe({ next: d => this.featuredNews.set(d), error: () => this.featuredNews.set(this.mockNews()) });
    setInterval(() => this.activeSlide.update(s => (s + 1) % this.slides.length), 5500);
  }

  setSlide(i: number) { this.activeSlide.set(i); }

  private mockProducts() {
    return [
      { id:1, name:'SpotLess Pro', nameVi:'Sơn Nội Thất SpotLess Pro', shortDesc:'Kháng khuẩn 99%, chống bám bẩn', imageUrl:'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=500&q=80', category:{nameVi:'Sơn nội thất'}, isFeatured:true },
      { id:2, name:'WeatherGuard Plus', nameVi:'Sơn Ngoại Thất WeatherGuard', shortDesc:'Chống thấm, chống UV 15 năm', imageUrl:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80', category:{nameVi:'Sơn ngoại thất'}, isFeatured:true },
      { id:3, name:'EasyWash Interior', nameVi:'Sơn EasyWash Nội Thất', shortDesc:'Dễ lau chùi, bề mặt siêu mịn', imageUrl:'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=500&q=80', category:{nameVi:'Sơn nội thất'}, isFeatured:true },
      { id:4, name:'Harmony Anti-Mold', nameVi:'Sơn Chống Nấm Mốc Harmony', shortDesc:'Diệt nấm mốc, an toàn cho bé', imageUrl:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80', category:{nameVi:'Sơn nội thất'}, isFeatured:true },
    ];
  }
  private mockColors() {
    return [
      { id:1, name:'Ivory White', nameVi:'Trắng Ngà', hex:'#FFFFF0', colorCode:'PC-001', family:'Whites', isTrending:true },
      { id:2, name:'Champagne', nameVi:'Vàng Champagne', hex:'#F7E7CE', colorCode:'PC-002', family:'Yellows', isTrending:true },
      { id:3, name:'Dusty Rose', nameVi:'Hồng Pastel', hex:'#DCAE96', colorCode:'PC-003', family:'Pinks', isTrending:true },
      { id:4, name:'Sage Green', nameVi:'Xanh Sage', hex:'#B2AC88', colorCode:'PC-004', family:'Greens', isTrending:true },
      { id:5, name:'Sky Blue', nameVi:'Xanh Trời', hex:'#87CEEB', colorCode:'PC-005', family:'Blues', isTrending:true },
      { id:6, name:'Warm Gray', nameVi:'Xám Ấm', hex:'#C4B9B0', colorCode:'PC-007', family:'Grays', isTrending:true },
      { id:7, name:'Mint Fresh', nameVi:'Xanh Bạc Hà', hex:'#98D8C8', colorCode:'PC-009', family:'Greens', isTrending:true },
      { id:8, name:'Terracotta', nameVi:'Nâu Đất', hex:'#C07850', colorCode:'PC-010', family:'Browns', isTrending:true },
      { id:9, name:'Lavender', nameVi:'Tím Oải Hương', hex:'#C5A9D0', colorCode:'PC-011', family:'Purples', isTrending:true },
      { id:10, name:'Sunset Orange', nameVi:'Cam Hoàng Hôn', hex:'#FF7043', colorCode:'PC-014', family:'Oranges', isTrending:true },
      { id:11, name:'Deep Navy', nameVi:'Xanh Navy', hex:'#1B3A6B', colorCode:'PC-008', family:'Blues', isTrending:false },
      { id:12, name:'Coral Red', nameVi:'Đỏ San Hô', hex:'#FF6B6B', colorCode:'PC-006', family:'Reds', isTrending:false },
    ];
  }
  private mockNews() {
    return [
      { id:1, title:'Xu hướng màu sắc 2025', slug:'xu-huong-mau-sac-2025', excerpt:'Tông đất, xanh lá và kem dẫn đầu xu hướng thiết kế nội thất năm 2025.', imageUrl:'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=600&q=80', category:'Xu hướng', createdAt:new Date() },
      { id:2, title:'Bí quyết chọn màu phòng ngủ', slug:'bi-quyet-chon-mau-phong-ngu', excerpt:'Màu sắc ảnh hưởng trực tiếp đến chất lượng giấc ngủ của bạn.', imageUrl:'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80', category:'Mẹo', createdAt:new Date() },
      { id:3, title:'PaintCo ra mắt dòng sơn Green Series', slug:'paintco-green-series', excerpt:'Dòng sơn mới Zero VOC - an toàn tuyệt đối cho gia đình và môi trường.', imageUrl:'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=600&q=80', category:'Tin tức', createdAt:new Date() },
    ];
  }
}
