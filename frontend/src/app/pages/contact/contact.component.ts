import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page-hero" style="background:linear-gradient(135deg,#111,#1a0505,#c8102e);padding:96px 0 64px;text-align:center;color:white">
  <div class="container">
    <span class="section-label" style="color:rgba(255,255,255,.65)">Kết nối với chúng tôi</span>
    <h1 style="color:white">Liên Hệ PaintCo</h1>
    <p style="color:rgba(255,255,255,.65)">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
  </div>
</div>

<section class="section">
  <div class="container">
    <div style="display:grid;grid-template-columns:1fr 1.4fr;gap:64px;align-items:start">

      <!-- Info -->
      <div>
        <h2 style="margin-bottom:24px">Thông Tin Liên Hệ</h2>
        <div style="display:flex;flex-direction:column;gap:24px;margin-bottom:40px">
          <div *ngFor="let c of contacts" style="display:flex;align-items:flex-start;gap:16px">
            <div style="width:48px;height:48px;background:rgba(200,16,46,.1);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0">{{c.icon}}</div>
            <div>
              <div style="font-size:.8rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--red);margin-bottom:4px">{{c.label}}</div>
              <div style="font-weight:600;color:var(--black)">{{c.value}}</div>
              <div style="font-size:.875rem;color:var(--gray-600)">{{c.sub}}</div>
            </div>
          </div>
        </div>

        <div style="background:var(--cream);border-radius:20px;padding:24px">
          <h3 style="margin-bottom:8px">Giờ làm việc</h3>
          <p style="margin-bottom:4px">🕐 Thứ 2 - Thứ 6: 8:00 - 17:30</p>
          <p style="margin-bottom:4px">🕐 Thứ 7: 8:00 - 12:00</p>
          <p>🔴 Chủ nhật: Nghỉ</p>
        </div>
      </div>

      <!-- Form -->
      <div class="card" style="padding:40px">
        <h2 style="margin-bottom:8px">Gửi Tin Nhắn</h2>
        <p style="color:var(--gray-600);margin-bottom:28px">Điền thông tin bên dưới, chúng tôi sẽ phản hồi trong vòng 24 giờ</p>

        <div *ngIf="success()" style="background:#e8f5e9;border:1px solid #4caf50;border-radius:12px;padding:16px 20px;margin-bottom:24px;color:#2e7d32;font-weight:600">
          ✅ Cảm ơn! Chúng tôi sẽ liên hệ với bạn sớm.
        </div>
        <div *ngIf="error()" style="background:#fde8ea;border:1px solid var(--red);border-radius:12px;padding:16px 20px;margin-bottom:24px;color:var(--red);font-weight:600">
          ❌ Có lỗi xảy ra. Vui lòng thử lại.
        </div>

        <div class="grid-2" style="gap:16px">
          <div class="form-group">
            <label class="form-label">Họ và tên *</label>
            <input class="form-control" [(ngModel)]="form.name" placeholder="Nguyễn Văn A">
          </div>
          <div class="form-group">
            <label class="form-label">Số điện thoại</label>
            <input class="form-control" [(ngModel)]="form.phone" placeholder="0912 345 678">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Email *</label>
          <input class="form-control" type="email" [(ngModel)]="form.email" placeholder="email@example.com">
        </div>
        <div class="form-group">
          <label class="form-label">Chủ đề</label>
          <select class="form-control" [(ngModel)]="form.subject">
            <option value="">Chọn chủ đề...</option>
            <option>Tư vấn sản phẩm</option>
            <option>Báo giá công trình</option>
            <option>Hỗ trợ kỹ thuật</option>
            <option>Khiếu nại / Góp ý</option>
            <option>Khác</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Nội dung *</label>
          <textarea class="form-control" [(ngModel)]="form.message" rows="5" placeholder="Mô tả yêu cầu của bạn..."></textarea>
        </div>
        <button class="btn btn-primary" style="width:100%" (click)="submit()" [disabled]="sending()">
          {{ sending() ? 'Đang gửi...' : 'Gửi tin nhắn' }}
        </button>
      </div>
    </div>
  </div>
</section>
  `
})
export class ContactComponent {
  form = { name:'', email:'', phone:'', subject:'', message:'' };
  sending = signal(false);
  success = signal(false);
  error = signal(false);

  contacts = [
    { icon:'📞', label:'Hotline', value:'1800 8555', sub:'Miễn phí, 24/7' },
    { icon:'📧', label:'Email', value:'info@paintco.vn', sub:'Phản hồi trong 24h' },
    { icon:'📍', label:'Địa chỉ', value:'123 Đường Sơn Màu, Q.7, TP.HCM', sub:'Showroom mở cửa 7 ngày/tuần' },
    { icon:'🏭', label:'Nhà máy', value:'KCN Bình Dương, Tỉnh Bình Dương', sub:'Tham quan theo lịch hẹn' },
  ];

  constructor(private api: ApiService) {}

  submit() {
    if (!this.form.name || !this.form.email || !this.form.message) return;
    this.sending.set(true);
    this.api.post('contact', this.form).subscribe({
      next: () => { this.success.set(true); this.sending.set(false); this.form = { name:'', email:'', phone:'', subject:'', message:'' }; },
      error: () => { this.error.set(true); this.sending.set(false); setTimeout(() => this.error.set(false), 4000); }
    });
  }
}
