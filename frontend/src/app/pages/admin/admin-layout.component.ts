import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ChatSocketService } from '../../core/services/chat.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
  collapsed = signal(false);

  navItems = [
    { label: 'Dashboard',  path: '/admin',            exact: true  },
    { label: 'San pham',   path: '/admin/products',   exact: false },
    { label: 'Bang mau',   path: '/admin/colors',     exact: false },
    { label: 'Tin tuc',    path: '/admin/news',       exact: false },
    { label: 'Lien he',    path: '/admin/contacts',   exact: false },
    { label: 'Chat',       path: '/admin/chat',       exact: false },
    { label: 'Thong ke',   path: '/admin/analytics',  exact: false },
  ];

  navIcons: Record<string, string> = {
    'Dashboard': '📊',
    'San pham':  '📦',
    'Bang mau':  '🎨',
    'Tin tuc':   '📰',
    'Lien he':   '📩',
    'Chat':      '💬',
    'Thong ke':  '📈',
  };

  navLabelsVi: Record<string, string> = {
    'Dashboard': 'Dashboard',
    'San pham':  'Sản phẩm',
    'Bang mau':  'Bảng màu',
    'Tin tuc':   'Tin tức',
    'Lien he':   'Liên hệ',
    'Chat':      'Chat',
    'Thong ke':  'Thống kê',
  };

  constructor(
    public authService: AuthService,
    public chatService: ChatSocketService,
    private router: Router
  ) {
    if (!authService.isLoggedIn()) router.navigate(['/admin/login']);
  }

  toggleSidebar(): void { this.collapsed.set(!this.collapsed()); }
  isCollapsed(): boolean { return this.collapsed(); }

  currentTitle(): string {
    const path = window.location.pathname;
    if (path === '/admin') return 'Dashboard';
    const found = this.navItems.find(n => n.path !== '/admin' && path.startsWith(n.path));
    return found ? this.navLabelsVi[found.label] : 'Admin';
  }

  userInitial(): string { return (this.authService.currentUser()?.name || 'A')[0].toUpperCase(); }
  getUserName(): string { return this.authService.currentUser()?.name || 'Admin'; }
  getUserRole(): string { return this.authService.currentUser()?.role || ''; }
  getChatUnread(): number { return this.chatService.totalUnread(); }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
