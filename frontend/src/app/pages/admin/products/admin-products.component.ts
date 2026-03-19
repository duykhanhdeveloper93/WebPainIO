import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss']
})
export class AdminProductsComponent implements OnInit {
  products = signal<any[]>([]);
  categories = signal<any[]>([]);
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  editingId = signal<number | null>(null);
  toast = signal('');

  form: any = this.emptyForm();

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
    this.api.get<any[]>('products/categories').subscribe({ next: d => this.categories.set(d as any[]), error: () => {} });
  }

  load() {
    this.loading.set(true);
    this.api.get<any>('products', { limit: 50 }).subscribe({
      next: d => { this.products.set(d.data || d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openCreate() { this.form = this.emptyForm(); this.editingId.set(null); this.showModal.set(true); }

  openEdit(p: any) {
    this.form = { ...p, categoryId: p.category?.id };
    this.editingId.set(p.id);
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  save() {
    this.saving.set(true);
    const obs = this.editingId()
      ? this.api.put(`products/${this.editingId()}`, this.form)
      : this.api.post('products', this.form);
    obs.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.load(); this.showToast(this.editingId() ? 'Cập nhật thành công!' : 'Tạo thành công!'); },
      error: () => { this.saving.set(false); this.showToast('Lỗi! Kiểm tra lại.'); }
    });
  }

  delete(id: number) {
    if (!confirm('Xóa sản phẩm này?')) return;
    this.api.delete(`products/${id}`).subscribe({ next: () => { this.load(); this.showToast('Đã xóa!'); }, error: () => {} });
  }

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3000);
  }

  private emptyForm() {
    return { name: '', nameVi: '', shortDesc: '', description: '', imageUrl: '', priceRange: '', coverage: '', finish: 'Mờ', brand: 'PaintCo', isFeatured: false, isActive: true, categoryId: null };
  }
}
