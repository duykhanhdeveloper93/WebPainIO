import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="login-wrap">
  <div class="login-card">
    <div class="login-logo">
      <div class="logo-icon"><span>P</span></div>
      <div>
        <div class="logo-brand">PaintCo</div>
        <div class="logo-sub">Admin Dashboard</div>
      </div>
    </div>

    <h2>Đăng nhập</h2>
    <p class="sub">Quản lý toàn bộ nội dung website</p>

    <div class="error-msg" *ngIf="error()">{{ error() }}</div>

    <div class="form-group">
      <label class="form-label">Email</label>
      <input class="form-control" type="email" [(ngModel)]="email" placeholder="admin@paintco.vn" (keyup.enter)="login()">
    </div>
    <div class="form-group">
      <label class="form-label">Mật khẩu</label>
      <input class="form-control" type="password" [(ngModel)]="password" placeholder="••••••••" (keyup.enter)="login()">
    </div>

    <button class="btn-login" (click)="login()" [disabled]="loading()">
      {{ loading() ? 'Đang đăng nhập...' : 'Đăng nhập' }}
    </button>

    <div class="hint">
      <strong>Demo:</strong> admin&#64;paintco.vn / admin123
    </div>
  </div>
</div>
  `,
  styles: [`
.login-wrap {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a0505 50%, #2d0b0b 100%);
}
.login-card {
  background: white; border-radius: 24px; padding: 48px 40px;
  width: 100%; max-width: 420px; box-shadow: 0 40px 80px rgba(0,0,0,.4);
}
.login-logo {
  display: flex; align-items: center; gap: 12px; margin-bottom: 32px;
}
.logo-icon {
  width: 44px; height: 44px; background: #C8102E; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  span { color: white; font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 900; }
}
.logo-brand { font-weight: 800; font-size: 1.2rem; color: #1a1a1a; }
.logo-sub { font-size: .72rem; color: #C8102E; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
h2 { font-size: 1.6rem; font-weight: 800; margin-bottom: 6px; }
.sub { color: #888; margin-bottom: 28px; }
.error-msg {
  background: #fde8ea; border: 1px solid #C8102E; color: #C8102E;
  padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; font-size: .875rem; font-weight: 600;
}
.btn-login {
  width: 100%; padding: 14px; background: #C8102E; color: white; border: none;
  border-radius: 12px; font-size: 1rem; font-weight: 700; cursor: pointer;
  margin-top: 8px; transition: all .3s;
  &:hover:not(:disabled) { background: #9B0D23; transform: translateY(-1px); }
  &:disabled { opacity: .6; cursor: not-allowed; }
}
.hint {
  margin-top: 20px; text-align: center; font-size: .8rem; color: #aaa;
  padding: 10px; background: #f8f8f8; border-radius: 8px;
}
  `]
})
export class AdminLoginComponent {
  email = 'admin@paintco.vn';
  password = 'admin123';
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedIn()) this.router.navigate(['/admin']);
  }

  login() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/admin']),
      error: () => { this.error.set('Email hoặc mật khẩu không đúng'); this.loading.set(false); }
    });
  }
}
