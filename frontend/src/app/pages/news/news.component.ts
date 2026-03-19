import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
<div class="page-hero" style="background:linear-gradient(135deg,#111,#2d0b0b,#c8102e);padding:96px 0 64px;text-align:center;color:white">
  <div class="container">
    <span class="section-label" style="color:rgba(255,255,255,.65)">Blog & Tin tức</span>
    <h1 style="color:white">Câu Chuyện Màu Sắc</h1>
    <p style="color:rgba(255,255,255,.65)">Xu hướng thiết kế, bí quyết sơn nhà và cảm hứng trang trí</p>
  </div>
</div>

<section class="section">
  <div class="container">
    <!-- Category tabs -->
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:40px;justify-content:center">
      <button *ngFor="let c of cats" class="filter-btn" [class.active]="activeCategory===c.val" (click)="activeCategory=c.val;loadNews()" style="padding:8px 20px;border-radius:50px;border:1.5px solid var(--gray-200);background:white;cursor:pointer;font-size:.875rem;font-weight:500;color:var(--gray-600);transition:var(--transition)">{{c.label}}</button>
    </div>

    <div class="news-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px">
      <a *ngFor="let n of news()" [routerLink]="['/tin-tuc', n.slug]" class="news-card card" style="display:flex;flex-direction:column;text-decoration:none">
        <div style="position:relative;height:220px;overflow:hidden">
          <img [src]="n.imageUrl" [alt]="n.title" style="width:100%;height:100%;object-fit:cover;transition:transform .5s" loading="lazy">
          <span style="position:absolute;top:12px;left:12px;background:var(--red);color:white;padding:3px 12px;border-radius:50px;font-size:.72rem;font-weight:700">{{n.category}}</span>
        </div>
        <div style="padding:22px;flex:1;display:flex;flex-direction:column">
          <span style="font-size:.78rem;color:var(--gray-400);margin-bottom:8px">{{n.createdAt | date:'dd/MM/yyyy'}}</span>
          <h3 style="font-size:1rem;font-weight:700;margin-bottom:10px;color:var(--black);line-height:1.4">{{n.title}}</h3>
          <p style="font-size:.875rem;color:var(--gray-600);line-height:1.6;flex:1;margin-bottom:16px">{{n.excerpt}}</p>
          <span style="font-size:.875rem;font-weight:700;color:var(--red)">Đọc tiếp →</span>
        </div>
      </a>
    </div>
  </div>
</section>
  `,
  styles: [`.filter-btn:hover,.filter-btn.active{border-color:var(--red)!important;color:var(--red)!important}.filter-btn.active{background:var(--red)!important;color:white!important}`]
})
export class NewsComponent implements OnInit {
  news = signal<any[]>([]);
  activeCategory = '';
  cats = [
    { label:'Tất cả', val:'' },
    { label:'Xu hướng', val:'Xu hướng' },
    { label:'Mẹo & Thủ thuật', val:'Mẹo & Thủ thuật' },
    { label:'Tin tức công ty', val:'Tin tức công ty' },
    { label:'Phong thủy', val:'Phong thủy' },
  ];
  constructor(private api: ApiService) {}
  ngOnInit() { this.loadNews(); }
  loadNews() {
    const p: any = { limit: 9 };
    if (this.activeCategory) p.category = this.activeCategory;
    this.api.get<any>('news', p).subscribe({
      next: d => this.news.set(d.data || d),
      error: () => this.news.set([
        { id:1, title:'Xu hướng màu sắc 2025', slug:'xu-huong-2025', excerpt:'Tông đất, xanh lá và kem dẫn đầu.', imageUrl:'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=600&q=80', category:'Xu hướng', createdAt:new Date() },
        { id:2, title:'Bí quyết chọn màu phòng ngủ', slug:'mau-phong-ngu', excerpt:'Màu sắc ảnh hưởng chất lượng giấc ngủ.', imageUrl:'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80', category:'Mẹo & Thủ thuật', createdAt:new Date() },
        { id:3, title:'PaintCo Green Series ra mắt', slug:'green-series', excerpt:'Sơn zero VOC an toàn cho cả nhà.', imageUrl:'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=600&q=80', category:'Tin tức công ty', createdAt:new Date() },
        { id:4, title:'Phong thủy màu sắc 2025', slug:'phong-thuy-2025', excerpt:'Chọn màu theo mệnh và hướng nhà.', imageUrl:'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=600&q=80', category:'Phong thủy', createdAt:new Date() },
        { id:5, title:'Cách sơn nhà đúng kỹ thuật', slug:'ky-thuat-son', excerpt:'Hướng dẫn từ A-Z quy trình sơn nhà.', imageUrl:'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80', category:'Mẹo & Thủ thuật', createdAt:new Date() },
        { id:6, title:'Màu sắc cho không gian nhỏ', slug:'mau-phong-nho', excerpt:'Bí quyết làm phòng nhỏ trông rộng hơn.', imageUrl:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80', category:'Xu hướng', createdAt:new Date() },
      ])
    });
  }
}
