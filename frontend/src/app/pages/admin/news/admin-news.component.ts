import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-news',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-news.component.html',
  styleUrls: ['../products/admin-products.component.scss']
})
export class AdminNewsComponent implements OnInit {
  news = signal<any[]>([]);
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  editingId = signal<number|null>(null);
  toast = signal('');
  form: any = {};

  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.get<any>('news', { limit: 50 }).subscribe({
      next: (d: any) => { this.news.set(d.data || d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openCreate() {
    this.form = { title:'', slug:'', excerpt:'', content:'', imageUrl:'', author:'PaintCo Team', category:'', isFeatured:false, published:true };
    this.editingId.set(null); this.showModal.set(true);
  }
  openEdit(n: any) { this.form = { ...n }; this.editingId.set(n.id); this.showModal.set(true); }
  closeModal() { this.showModal.set(false); }

  save() {
    if (!this.form.slug && this.form.title) {
      this.form.slug = this.form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    }
    this.saving.set(true);
    const obs = this.editingId()
      ? this.api.put(`news/${this.editingId()}`, this.form)
      : this.api.post('news', this.form);
    obs.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.load(); this.showToast('Đã lưu!'); },
      error: () => { this.saving.set(false); this.showToast('Lỗi!'); }
    });
  }

  delete(id: number) {
    if (!confirm('Xóa bài viết này?')) return;
    this.api.delete(`news/${id}`).subscribe({ next: () => { this.load(); this.showToast('Đã xóa!'); } });
  }

  showToast(m: string) { this.toast.set(m); setTimeout(() => this.toast.set(''), 3000); }
}
