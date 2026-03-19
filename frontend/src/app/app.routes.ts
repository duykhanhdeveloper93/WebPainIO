import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'san-pham', loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent) },
  { path: 'san-pham/:id', loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'mau-sac', loadComponent: () => import('./pages/colors/colors.component').then(m => m.ColorsComponent) },
  { path: 'tin-tuc', loadComponent: () => import('./pages/news/news.component').then(m => m.NewsComponent) },
  { path: 'tin-tuc/:slug', loadComponent: () => import('./pages/news-detail/news-detail.component').then(m => m.NewsDetailComponent) },
  { path: 'gioi-thieu', loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) },
  { path: 'lien-he', loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) },

  { path: 'admin/login', loadComponent: () => import('./pages/admin/login/admin-login.component').then(m => m.AdminLoginComponent) },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./pages/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'products', loadComponent: () => import('./pages/admin/products/admin-products.component').then(m => m.AdminProductsComponent) },
      { path: 'colors', loadComponent: () => import('./pages/admin/colors/admin-colors.component').then(m => m.AdminColorsComponent) },
      { path: 'news', loadComponent: () => import('./pages/admin/news/admin-news.component').then(m => m.AdminNewsComponent) },
      { path: 'contacts', loadComponent: () => import('./pages/admin/contacts/admin-contacts.component').then(m => m.AdminContactsComponent) },
      { path: 'chat', loadComponent: () => import('./pages/admin/chat/admin-chat.component').then(m => m.AdminChatComponent) },
      { path: 'analytics', loadComponent: () => import('./pages/admin/analytics/admin-analytics.component').then(m => m.AdminAnalyticsComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
