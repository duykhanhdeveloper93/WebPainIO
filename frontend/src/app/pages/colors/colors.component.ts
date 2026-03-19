import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-colors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page-hero" style="background:linear-gradient(135deg,#1a0a0a,#3d1010,#c8102e)">
  <div class="container">
    <span class="section-label" style="color:rgba(255,255,255,.7)">Thư viện màu sắc</span>
    <h1 style="color:white">Hơn 2000 Mã Màu<br>Tuyệt Đẹp</h1>
    <p style="color:rgba(255,255,255,.65)">Tìm màu sơn lý tưởng cho ngôi nhà của bạn</p>
  </div>
</div>

<div class="filters-bar">
  <div class="container">
    <div class="filters-inner">
      <div class="family-filters">
        <button class="filter-btn" [class.active]="activeFamily===''" (click)="filterFamily('')">Tất cả</button>
        <button *ngFor="let f of families()" class="filter-btn" [class.active]="activeFamily===f" (click)="filterFamily(f)">{{f}}</button>
      </div>
      <input class="form-control" style="width:220px" placeholder="Tìm mã màu, tên màu..." [(ngModel)]="searchQ" (input)="onSearch()">
    </div>
  </div>
</div>

<section class="section">
  <div class="container">
    <div class="colors-grid">
      <div *ngFor="let c of filtered()" class="color-card" [style.--swatch]="c.hex" (click)="select(c)" [class.selected]="selected()?.id===c.id">
        <div class="swatch" [style.background]="c.hex">
          <div class="swatch-check" *ngIf="selected()?.id===c.id">✓</div>
          <div class="trending-badge" *ngIf="c.isTrending">🔥</div>
        </div>
        <div class="color-info">
          <span class="color-code">{{c.colorCode}}</span>
          <span class="color-name">{{c.nameVi || c.name}}</span>
          <span class="color-family">{{c.family}}</span>
        </div>
      </div>
    </div>

    <!-- Preview panel -->
    <div class="preview-panel" *ngIf="selected()">
      <div class="preview-swatch" [style.background]="selected()!.hex"></div>
      <div class="preview-info">
        <h3>{{selected()!.nameVi}}</h3>
        <p class="preview-code">Mã màu: {{selected()!.colorCode}}</p>
        <p class="preview-hex">HEX: {{selected()!.hex?.toUpperCase()}}</p>
        <p class="preview-family">Họ màu: {{selected()!.family}}</p>
        <button class="btn btn-primary btn-sm" style="margin-top:16px">Đặt mẫu miễn phí</button>
        <button class="btn btn-outline btn-sm" (click)="selected.set(null)" style="margin-top:8px;margin-left:8px">Đóng</button>
      </div>
    </div>
  </div>
</section>
  `,
  styles: [`
.page-hero { padding: 96px 0 64px; text-align: center; }
.filters-bar { background: white; border-bottom: 1px solid var(--gray-200); position: sticky; top: 72px; z-index: 100; }
.filters-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 0; flex-wrap: wrap; }
.family-filters { display: flex; gap: 6px; flex-wrap: wrap; }
.filter-btn { padding: 6px 14px; border-radius: 50px; border: 1.5px solid var(--gray-200); background: white; cursor: pointer; font-size: 0.82rem; font-weight: 500; color: var(--gray-600); transition: var(--transition); &:hover { border-color: var(--red); color: var(--red); } &.active { background: var(--red); border-color: var(--red); color: white; } }
.colors-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
.color-card { border-radius: 14px; overflow: hidden; background: white; box-shadow: var(--shadow-sm); cursor: pointer; transition: var(--transition); &:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); } &.selected { outline: 3px solid var(--red); outline-offset: 2px; } }
.swatch { height: 100px; position: relative; }
.swatch-check { position: absolute; inset: 0; background: rgba(0,0,0,.3); display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white; font-weight: 900; }
.trending-badge { position: absolute; top: 6px; right: 6px; font-size: 0.8rem; }
.color-info { padding: 10px 12px; }
.color-code { display: block; font-size: 0.68rem; font-weight: 700; letter-spacing: 1px; color: var(--red); }
.color-name { display: block; font-size: 0.82rem; font-weight: 600; color: var(--black); margin: 2px 0; }
.color-family { display: block; font-size: 0.72rem; color: var(--gray-400); }
.preview-panel { position: fixed; bottom: 24px; right: 24px; background: white; border-radius: 20px; box-shadow: var(--shadow-lg); display: flex; gap: 16px; padding: 20px; z-index: 200; min-width: 320px; animation: slideUp 0.3s ease; }
.preview-swatch { width: 80px; height: 80px; border-radius: 12px; flex-shrink: 0; }
.preview-code, .preview-hex, .preview-family { font-size: 0.85rem; color: var(--gray-600); margin: 2px 0; }
@keyframes slideUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform:none; } }
@media (max-width: 1024px) { .colors-grid { grid-template-columns: repeat(4,1fr); } }
@media (max-width: 640px) { .colors-grid { grid-template-columns: repeat(3,1fr); } .preview-panel { left:16px; right:16px; bottom:16px; } }
  `]
})
export class ColorsComponent implements OnInit {
  allColors = signal<any[]>([]);
  filtered = signal<any[]>([]);
  families = signal<string[]>([]);
  selected = signal<any>(null);
  activeFamily = '';
  searchQ = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any>('colors', { limit: 200 }).subscribe({
      next: d => { const arr = d.data || d; this.allColors.set(arr); this.filtered.set(arr); },
      error: () => { this.allColors.set(this.mock()); this.filtered.set(this.mock()); }
    });
    this.api.get<string[]>('colors/families').subscribe({
      next: d => this.families.set(d),
      error: () => this.families.set(['Whites','Yellows','Pinks','Greens','Blues','Reds','Grays','Browns','Purples','Oranges'])
    });
  }

  filterFamily(f: string) { this.activeFamily = f; this.applyFilter(); }
  onSearch() { this.applyFilter(); }

  applyFilter() {
    let arr = this.allColors();
    if (this.activeFamily) arr = arr.filter(c => c.family === this.activeFamily);
    if (this.searchQ) arr = arr.filter(c => (c.nameVi+c.name+c.colorCode).toLowerCase().includes(this.searchQ.toLowerCase()));
    this.filtered.set(arr);
  }

  select(c: any) { this.selected.set(this.selected()?.id === c.id ? null : c); }

  private mock() {
    return [
      {id:1,name:'Ivory White',nameVi:'Trắng Ngà',hex:'#FFFFF0',colorCode:'PC-001',family:'Whites',isTrending:true},
      {id:2,name:'Champagne',nameVi:'Vàng Champagne',hex:'#F7E7CE',colorCode:'PC-002',family:'Yellows',isTrending:true},
      {id:3,name:'Dusty Rose',nameVi:'Hồng Pastel',hex:'#DCAE96',colorCode:'PC-003',family:'Pinks',isTrending:true},
      {id:4,name:'Sage Green',nameVi:'Xanh Sage',hex:'#B2AC88',colorCode:'PC-004',family:'Greens',isTrending:true},
      {id:5,name:'Sky Blue',nameVi:'Xanh Trời',hex:'#87CEEB',colorCode:'PC-005',family:'Blues',isTrending:true},
      {id:6,name:'Coral Red',nameVi:'Đỏ San Hô',hex:'#FF6B6B',colorCode:'PC-006',family:'Reds',isTrending:false},
      {id:7,name:'Warm Gray',nameVi:'Xám Ấm',hex:'#C4B9B0',colorCode:'PC-007',family:'Grays',isTrending:true},
      {id:8,name:'Deep Navy',nameVi:'Xanh Navy',hex:'#1B3A6B',colorCode:'PC-008',family:'Blues',isTrending:false},
      {id:9,name:'Mint Fresh',nameVi:'Xanh Bạc Hà',hex:'#98D8C8',colorCode:'PC-009',family:'Greens',isTrending:true},
      {id:10,name:'Terracotta',nameVi:'Nâu Đất',hex:'#C07850',colorCode:'PC-010',family:'Browns',isTrending:true},
      {id:11,name:'Lavender',nameVi:'Tím Oải Hương',hex:'#C5A9D0',colorCode:'PC-011',family:'Purples',isTrending:true},
      {id:12,name:'Sunset Orange',nameVi:'Cam Hoàng Hôn',hex:'#FF7043',colorCode:'PC-014',family:'Oranges',isTrending:true},
    ];
  }
}
