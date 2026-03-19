import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div *ngIf="product()" class="product-detail">
  <div class="container" style="padding-top:48px;padding-bottom:80px">
    <!-- Breadcrumb -->
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:32px;font-size:.875rem;color:var(--gray-400)">
      <a routerLink="/" style="color:var(--gray-400)">Trang chủ</a> /
      <a routerLink="/san-pham" style="color:var(--gray-400)">Sản phẩm</a> /
      <span style="color:var(--black)">{{ product()!.nameVi }}</span>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:start">
      <!-- Image -->
      <div>
        <img [src]="product()!.imageUrl" [alt]="product()!.nameVi" style="width:100%;border-radius:24px;box-shadow:var(--shadow-lg)">
      </div>

      <!-- Info -->
      <div>
        <span class="section-label">{{ product()!.category?.nameVi || 'Sơn cao cấp' }}</span>
        <h1 style="margin:12px 0 16px;font-size:2rem">{{ product()!.nameVi || product()!.name }}</h1>
        <p style="font-size:1.05rem;margin-bottom:28px">{{ product()!.description || product()!.shortDesc }}</p>

        <div class="specs-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px">
          <div *ngIf="product()!.coverage" class="spec-item">
            <span class="spec-label">Độ phủ</span>
            <span class="spec-val">{{ product()!.coverage }}</span>
          </div>
          <div *ngIf="product()!.finish" class="spec-item">
            <span class="spec-label">Bề mặt</span>
            <span class="spec-val">{{ product()!.finish }}</span>
          </div>
          <div *ngIf="product()!.brand" class="spec-item">
            <span class="spec-label">Thương hiệu</span>
            <span class="spec-val">{{ product()!.brand }}</span>
          </div>
          <div *ngIf="product()!.priceRange" class="spec-item">
            <span class="spec-label">Giá tham khảo</span>
            <span class="spec-val" style="color:var(--red)">{{ product()!.priceRange }}</span>
          </div>
        </div>

        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <button class="btn btn-primary">🛒 Yêu cầu báo giá</button>
          <a routerLink="/lien-he" class="btn btn-outline">💬 Tư vấn ngay</a>
        </div>
      </div>
    </div>
  </div>
</div>

<div *ngIf="!product() && !loading()" style="text-align:center;padding:80px 0">
  <div style="font-size:4rem;margin-bottom:16px">😕</div>
  <h3>Không tìm thấy sản phẩm</h3>
  <a routerLink="/san-pham" class="btn btn-primary" style="margin-top:24px;display:inline-flex">Xem tất cả sản phẩm</a>
</div>
  `,
  styles: [`.spec-item{background:var(--gray-100);border-radius:12px;padding:14px 16px}.spec-label{display:block;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--gray-400);margin-bottom:4px}.spec-val{font-size:.95rem;font-weight:700;color:var(--black)}`]
})
export class ProductDetailComponent implements OnInit {
  product = signal<any>(null);
  loading = signal(true);

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.api.get<any>(`products/${id}`).subscribe({
      next: p => { this.product.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
