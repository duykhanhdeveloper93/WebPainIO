import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-contacts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-contacts.component.html',
  styleUrls: ['../products/admin-products.component.scss', './admin-contacts.component.scss']
})
export class AdminContactsComponent implements OnInit {
  contacts = signal<any[]>([]);
  loading = signal(true);

  unreplied() { return this.contacts().filter((c: any) => !c.replied).length; }

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any[]>('contact').subscribe({
      next: (d: any) => { this.contacts.set(Array.isArray(d) ? d : []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  markReplied(id: number) {
    this.api.post(`contact/${id}/reply`, {}).subscribe({
      next: () => this.contacts.update(arr => arr.map((c: any) => c.id === id ? { ...c, replied: true } : c))
    });
  }
}
