import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, LoginRequest, LoginResponse, AuthState } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'https://localhost:53255/api';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = localStorage.getItem(this.USER_KEY);

    if (token && user) {
      try {
        const userObj = JSON.parse(user);
        this.authStateSubject.next({
          isAuthenticated: true,
          user: userObj,
          token: token
        });
      } catch (error) {
        this.clearAuthData();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        map(response => {
          this.setAuthData(response);
          return response;
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  hasRole(roleName: string): boolean {
    const user = this.getCurrentUser();
    return user?.roleName === roleName;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.roleName) : false;
  }

  private setAuthData(authData: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authData.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authData.user));
    
    this.authStateSubject.next({
      isAuthenticated: true,
      user: authData.user,
      token: authData.token
    });
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    this.authStateSubject.next({
      isAuthenticated: false,
      user: null,
      token: null
    });
  }

  refreshToken(): Observable<LoginResponse> {
    // Implement token refresh logic if needed
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/refresh`, {})
      .pipe(
        map(response => {
          this.setAuthData(response);
          return response;
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }
}
