import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User { id: number; name: string; email: string; role: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'paintco_token';
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient) {
    const token = this.getToken();
    if (token) this.loadProfile();
  }

  login(email: string, password: string) {
    return this.http.post<{ access_token: string; user: User }>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap(res => {
        localStorage.setItem(this.tokenKey, res.access_token);
        this.currentUser.set(res.user);
      }));
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.currentUser.set(null);
  }

  getToken(): string | null { return localStorage.getItem(this.tokenKey); }
  isLoggedIn(): boolean { return !!this.getToken(); }

  private loadProfile() {
    this.http.get<User>(`${environment.apiUrl}/auth/profile`).subscribe({
      next: u => this.currentUser.set(u),
      error: () => this.logout()
    });
  }
}
