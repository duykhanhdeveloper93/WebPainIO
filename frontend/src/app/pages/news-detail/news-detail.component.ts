import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div *ngIf="news()" style="max-width:800px;margin:0 auto;padding:48px 24px 80px">
  <div style="display:flex;gap:8px;align-items:center;margin-bottom:32px;font-size:.875rem;color:var(--gray-400)">
    <a routerLink="/" style="color:var(--gray-400)">Trang chủ</a> /
    <a routerLink="/tin-tuc" style="color:var(--gray-400)">Tin tức</a> /
    <span style="color:var(--black)">{{ news()!.title }}</span>
  </div>

  <span class="badge badge-red" style="margin-bottom:16px">{{ news()!.category }}</span>
  <h1 style="margin-bottom:16px;line-height:1.2">{{ news()!.title }}</h1>
  <div style="display:flex;gap:16px;color:var(--gray-400);font-size:.875rem;margin-bottom:32px">
    <span>✍️ {{ news()!.author || 'PaintCo Team' }}</span>
    <span>📅 {{ news()!.createdAt | date:'dd/MM/yyyy' }}</span>
  </div>

  <img *ngIf="news()!.imageUrl" [src]="news()!.imageUrl" [alt]="news()!.title"
       style="width:100%;border-radius:20px;margin-bottom:36px;box-shadow:var(--shadow-md)">

  <div class="article-content" [innerHTML]="news()!.content || '<p>' + news()!.excerpt + '</p>'"></div>

  <div style="margin-top:48px;padding-top:32px;border-top:1px solid var(--gray-200)">
    <a routerLink="/tin-tuc" class="btn btn-outline">← Quay lại tin tức</a>
  </div>
</div>

<div *ngIf="!news() && !loading()" style="text-align:center;padding:80px 0">
  <h3>Không tìm thấy bài viết</h3>
  <a routerLink="/tin-tuc" class="btn btn-primary" style="margin-top:24px;display:inline-flex">Xem tất cả tin tức</a>
</div>
  `,
  styles: [`.article-content p{margin-bottom:1.2em;line-height:1.8;font-size:1.05rem}.article-content h2,.article-content h3{margin:1.5em 0 .8em}.article-content img{max-width:100%;border-radius:12px}`]
})
export class NewsDetailComponent implements OnInit {
  news = signal<any>(null);
  loading = signal(true);

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    const slug = this.route.snapshot.params['slug'];
    this.api.get<any>(`news/slug/${slug}`).subscribe({
      next: n => { this.news.set(n); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
