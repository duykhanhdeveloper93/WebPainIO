import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ChatSocketService } from '../../../core/services/chat.service';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-analytics.component.html',
  styleUrls: ['./admin-analytics.component.scss']
})
export class AdminAnalyticsComponent implements OnInit {
  overview  = signal<any>(null);
  topNews   = signal<any[]>([]);
  productsByCat = signal<any[]>([]);
  contactChart  = signal<any[]>([]);
  recentContacts = signal<any[]>([]);

  constructor(private api: ApiService, public chat: ChatSocketService) {}

  ngOnInit() {
    this.api.get<any>('analytics/overview').subscribe({
      next: d => this.overview.set(d),
      error: () => this.overview.set({ products:0, news:0, contacts:0, colors:0, sessions:0, unreplied:0, openChats:0, weekContacts:0 })
    });
    this.api.get<any[]>('analytics/top-news').subscribe({
      next: d => this.topNews.set(d as any[]),
      error: () => {}
    });
    this.api.get<any[]>('analytics/products').subscribe({
      next: d => this.productsByCat.set(d as any[]),
      error: () => {}
    });
    this.api.get<any[]>('analytics/contacts').subscribe({
      next: d => { this.contactChart.set(d as any[]); },
      error: () => {}
    });
    this.api.get<any[]>('analytics/recent-contacts').subscribe({
      next: d => this.recentContacts.set(d as any[]),
      error: () => {}
    });
  }

  getBarWidth(count: number): string {
    const max = Math.max(...this.contactChart().map((d: any) => +d.count), 1);
    return `${Math.round((+count / max) * 100)}%`;
  }

  getPiePercent(count: number): number {
    const total = this.productsByCat().reduce((s, c) => s + +c.count, 0) || 1;
    return Math.round((+count / total) * 100);
  }

  pieColors = ['#C8102E','#C9A84C','#2196F3','#4CAF50','#9C27B0','#FF5722'];
}
