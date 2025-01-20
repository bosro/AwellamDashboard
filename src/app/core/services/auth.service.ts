import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'driver' | 'operator';
  permissions: string[];
  lastLogin?: string;
  status: 'active' | 'inactive';
  profileImage?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private readonly TOKEN_KEY = 'transport_token';
  private readonly REFRESH_TOKEN_KEY = 'transport_refresh_token';
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      this.getUserFromToken()
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    // Revoke token on server
    this.http.post(`${environment.apiUrl}/auth/logout`, {})
      .subscribe({
        next: () => this.clearAuthData(),
        error: () => this.clearAuthData()
      });
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUserSubject.next(null);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh-token`, { refreshToken })
      .pipe(
        tap(response => {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/reset-password`, {
      token,
      password
    });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword
    });
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/verify-email`, { token });
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/auth/profile`, userData)
      .pipe(
        tap(user => {
          const currentUser = this.currentUserSubject.value;
          this.currentUserSubject.next({ ...currentUser, ...user });
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean | null | "" {
    const token = this.getToken();
    return token && !this.jwtHelper.isTokenExpired(token);
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.permissions?.includes(permission) || false;
  }

  hasRole(role: string | string[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  }

  private getUserFromToken(): User | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken.user;
    } catch (error) {
      this.clearAuthData();
      return null;
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
}