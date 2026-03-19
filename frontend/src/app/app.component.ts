import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ChatWidgetComponent } from './components/chat-widget/chat-widget.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent, FooterComponent, ChatWidgetComponent],
  template: `
    <ng-container *ngIf="!isAdminRoute()">
      <app-header></app-header>
    </ng-container>
    <main>
      <router-outlet></router-outlet>
    </main>
    <ng-container *ngIf="!isAdminRoute()">
      <app-footer></app-footer>
      <app-chat-widget></app-chat-widget>
    </ng-container>
  `,
  styles: [`main { min-height: calc(100vh - 80px); }`]
})
export class AppComponent {
  constructor(private router: Router) {}
  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
