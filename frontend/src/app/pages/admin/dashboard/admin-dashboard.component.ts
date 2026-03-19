import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats = signal<any[]>([]);
  recentProducts = signal<any[]>([]);
  recentContacts = signal<any[]>([]);

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.stats.set([
      { icon:'📦', label:'Sản phẩm', value:'...', bg:'rgba(200,16,46,.1)', link:'/admin/products' },
      { icon:'🎨', label:'Màu sắc',  value:'...', bg:'rgba(201,168,76,.1)', link:'/admin/colors' },
      { icon:'📰', label:'Bài viết', value:'...', bg:'rgba(33,150,243,.1)', link:'/admin/news' },
      { icon:'📩', label:'Liên hệ',  value:'...', bg:'rgba(76,175,80,.1)',  link:'/admin/contacts' },
    ]);

    this.api.get<any>('products', { limit: 5 }).subscribe({
      next: (d: any) => {
        const arr = d.data || d;
        this.recentProducts.set(arr.slice(0, 5));
        this.patchStat('Sản phẩm', d.total || arr.length);
      }
    });

    this.api.get<any>('colors', { limit: 1 }).subscribe({
      next: (d: any) => this.patchStat('Màu sắc', d.total || 0)
    });

    this.api.get<any>('news', { limit: 1 }).subscribe({
      next: (d: any) => this.patchStat('Bài viết', d.total || 0)
    });

    this.api.get<any[]>('contact').subscribe({
      next: (d: any) => {
        const arr = Array.isArray(d) ? d : [];
        this.recentContacts.set(arr.slice(0, 5));
        this.patchStat('Liên hệ', arr.length);
      }
    });
  }

  private patchStat(label: string, value: any) {
    this.stats.update(arr => arr.map(s => s.label === label ? { ...s, value } : s));
  }
}
