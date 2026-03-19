import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-colors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-colors.component.html',
  styleUrls: ['../products/admin-products.component.scss', './admin-colors.component.scss']
})
export class AdminColorsComponent implements OnInit {
  colors = signal<any[]>([]);
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  editingId = signal<number|null>(null);
  toast = signal('');
  form: any = {};
  families = ['Whites','Yellows','Pinks','Greens','Blues','Reds','Grays','Browns','Purples','Oranges'];

  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.get<any>('colors', { limit: 200 }).subscribe({
      next: (d: any) => { this.colors.set(d.data || d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openCreate() {
    this.form = { name:'', nameVi:'', hex:'#FFFFFF', colorCode:'', family:'Whites', isTrending:false, isActive:true };
    this.editingId.set(null); this.showModal.set(true);
  }
  openEdit(c: any) { this.form = { ...c }; this.editingId.set(c.id); this.showModal.set(true); }
  closeModal() { this.showModal.set(false); }

  save() {
    this.saving.set(true);
    const obs = this.editingId()
      ? this.api.put(`colors/${this.editingId()}`, this.form)
      : this.api.post('colors', this.form);
    obs.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.load(); this.showToast('Đã lưu!'); },
      error: () => { this.saving.set(false); this.showToast('Lỗi!'); }
    });
  }

  delete(id: number) {
    if (!confirm('Xóa màu này?')) return;
    this.api.delete(`colors/${id}`).subscribe({ next: () => { this.load(); this.showToast('Đã xóa!'); } });
  }

  showToast(m: string) { this.toast.set(m); setTimeout(() => this.toast.set(''), 3000); }
}
