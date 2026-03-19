import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products = signal<any[]>([]);
  categories = signal<any[]>([]);
  loading = signal(true);
  total = signal(0);
  page = signal(1);
  totalPages = signal(1);
  searchQuery = '';
  activeCategory = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.api.get<any[]>('products/categories').subscribe({
      next: d => this.categories.set(d),
      error: () => this.categories.set([
        { id:1, slug:'son-noi-that', nameVi:'Sơn nội thất' },
        { id:2, slug:'son-ngoai-that', nameVi:'Sơn ngoại thất' },
        { id:3, slug:'son-go', nameVi:'Sơn gỗ' },
        { id:4, slug:'son-cong-nghiep', nameVi:'Sơn công nghiệp' },
      ])
    });
  }

  loadProducts() {
    this.loading.set(true);
    const params: any = { page: this.page(), limit: 8 };
    if (this.searchQuery) params.search = this.searchQuery;
    if (this.activeCategory) params.category = this.activeCategory;

    this.api.get<any>('products', params).subscribe({
      next: d => {
        this.products.set(d.data || d);
        this.total.set(d.total || (d.data || d).length);
        this.totalPages.set(d.totalPages || 1);
        this.loading.set(false);
      },
      error: () => {
        this.products.set(this.mockProducts());
        this.loading.set(false);
      }
    });
  }

  filterByCategory(slug: string) {
    this.activeCategory = slug;
    this.page.set(1);
    this.loadProducts();
  }

  onSearch() {
    this.page.set(1);
    this.loadProducts();
  }

  changePage(p: number) {
    this.page.set(p);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  private mockProducts() {
    return [
      { id:1, nameVi:'Sơn Nội Thất SpotLess Pro', shortDesc:'Kháng khuẩn 99%, chống bám bẩn vượt trội', imageUrl:'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=500&q=80', coverage:'8-10 m²/lít', finish:'Mờ', priceRange:'350.000 - 550.000 VNĐ', category:{nameVi:'Sơn nội thất'}, isFeatured:true },
      { id:2, nameVi:'Sơn Ngoại Thất WeatherGuard Plus', shortDesc:'Chống thấm, chống UV bền vững 15 năm', imageUrl:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80', coverage:'6-8 m²/lít', finish:'Bóng', priceRange:'450.000 - 700.000 VNĐ', category:{nameVi:'Sơn ngoại thất'}, isFeatured:true },
      { id:3, nameVi:'Sơn EasyWash Nội Thất', shortDesc:'Dễ lau chùi, bề mặt siêu mịn', imageUrl:'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=500&q=80', coverage:'10-12 m²/lít', finish:'Bán bóng', priceRange:'280.000 - 420.000 VNĐ', category:{nameVi:'Sơn nội thất'}, isFeatured:false },
      { id:4, nameVi:'Sơn Chống Nấm Mốc Harmony', shortDesc:'Diệt nấm mốc, an toàn cho gia đình', imageUrl:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80', coverage:'9-11 m²/lít', finish:'Mờ', priceRange:'320.000 - 480.000 VNĐ', category:{nameVi:'Sơn nội thất'}, isFeatured:true },
      { id:5, nameVi:'Sơn Gỗ WoodShield Premium', shortDesc:'Bảo vệ và tôn vinh vân gỗ tự nhiên', imageUrl:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&q=80', coverage:'12-15 m²/lít', finish:'Bóng', priceRange:'180.000 - 320.000 VNĐ', category:{nameVi:'Sơn gỗ'}, isFeatured:false },
      { id:6, nameVi:'Sơn Epoxy Công Nghiệp', shortDesc:'Chịu hóa chất, bền cơ học cao', imageUrl:'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&q=80', coverage:'4-6 m²/lít', finish:'Bóng', priceRange:'800.000 - 1.200.000 VNĐ', category:{nameVi:'Sơn công nghiệp'}, isFeatured:false },
    ];
  }
}
