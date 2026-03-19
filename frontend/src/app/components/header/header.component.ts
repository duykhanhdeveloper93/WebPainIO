import { Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  scrolled = signal(false);
  mobileOpen = signal(false);

  @HostListener('window:scroll')
  onScroll() { this.scrolled.set(window.scrollY > 60); }

  toggleMobile() { this.mobileOpen.update(v => !v); }
  closeMobile() { this.mobileOpen.set(false); }

  navItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Sản phẩm', path: '/san-pham' },
    { label: 'Bảng màu', path: '/mau-sac' },
    { label: 'Tin tức', path: '/tin-tuc' },
    { label: 'Giới thiệu', path: '/gioi-thieu' },
    { label: 'Liên hệ', path: '/lien-he' },
  ];
}
