import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
// import { environment } from '../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
// import { UsersResponse } from '../../main/user-management/user-management/user-management.component';
import { environment } from '../../environments/environment';
import { UserFormData } from '../../main/user-management/user-edit-modal/user-edit-modal.component';

// export interface User {
//   id: number;
//   fullName: string;
//   email: string;
//   role: 'admin' | 'manager' | 'driver' | 'operator' ;
//   permissions: string[];
//   lastLogin?: string;
//   status: 'active' | 'inactive';
//   profileImage?: string;
// }

export interface User {
  total: number;
  data: User[];
  _id: string;
  fullName: string;
  email: string;
  password: string;
  role: string;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  status?: 'active' | 'inactive'; // Optional, inferred from your metrics logic
}

interface UserFilters {
  searchTerm?: string;
  role?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  page?: number;
  pageSize?: number;
}

export interface AuthResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  admin: User;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  status: 'active' | 'inactive';
  permissions: string[];
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: 'active' | 'inactive';
  permissions?: string[];
}

export interface UsersResponse{
  message:string;
  admins: []
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private readonly TOKEN_KEY = 'transport_token';
  private readonly REFRESH_TOKEN_KEY = 'transport_refresh_token';
  private jwtHelper = new JwtHelperService();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromToken());
    this.currentUser = this.currentUserSubject.asObservable();
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const token = this.getToken();
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      this.isAuthenticatedSubject.next(true);
    } else {
      this.isAuthenticatedSubject.next(false);
    }
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/admin/login`, credentials).pipe(
      tap((response) => {
        console.log('Response:', response);
        const { tokens: { accessToken, refreshToken }, admin } = response;
        localStorage.setItem(this.TOKEN_KEY, accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
        this.currentUserSubject.next(admin);
        this.isAuthenticatedSubject.next(true); // Update authentication status
        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);
      })
    );
  }

  public getUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/me`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        localStorage.removeItem('user');
        this.clearAuthData();
      })
    );
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh-token`, { refreshToken }).pipe(
      tap((response) => {
        localStorage.setItem(this.TOKEN_KEY, response.tokens.accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, response.tokens.refreshToken);
        this.currentUserSubject.next(response.admin);
      })
    );
  }

  register(userData: { email: string; password: string; firstName: string; lastName: string; role: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, userData).pipe(
      tap((response) => {
        localStorage.setItem(this.TOKEN_KEY, response.tokens.accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, response.tokens.refreshToken);
        this.currentUserSubject.next(response.admin);
      })
    );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/reset-password`, { token, password });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/change-password`, { currentPassword, newPassword });
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/verify-email`, { token });
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/auth/profile`, userData).pipe(
      tap((user) => {
        const currentUser = this.currentUserSubject.value;
        this.currentUserSubject.next({ ...currentUser, ...user });
      })
    );
  }


  // getAdmins(filters?: any): Observable<UsersResponse> {
  //   return this.http.get<UsersResponse>(`${this.apiUrl}/get`, { params: filters });
  // }

  getAdminById(id: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/get/${id}`);
  }

  createAdmin(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/admin/add`, data);
  }

  updateAdmin(id: string, userData: UserFormData): Observable<any> {
    return this.http.put(`${environment.apiUrl}/update/id`, userData);
  }

  // Admin(data: any): Observable<any> {
  //   return this.http.post(`${environment.apiUrl}/add`, data);
  // }

  editAdmin(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/edit/${id}`, data);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }

  // hasPermission(permission: string): boolean {
  //   const user = this.currentUserSubject.value;
  //   return user?.permissions?.includes(permission) || false;
  // }

  hasRole(role: string | string[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  }

  // getUsers(filters: UserFilters): Observable<any> {
  //   return this.http.get(`${environment.apiUrl}/users`, { params: filters as any });
  // }

  getAdmins(filters: UserFilters): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(`${environment.apiUrl}/admin/get`, {
      params: filters as any
    });
  }

  updateUserStatus(userId: number, status: User['status']): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/users/${userId}/status`, { status });
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/users/${userId}`);
  }

  exportUsers(format: 'excel' | 'pdf', userIds: number[]): Observable<Blob> {
    return this.http.post(`${environment.apiUrl}/users/export`, { format, userIds }, { responseType: 'blob' });
  }

  createUser(userData: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, userData);
  }

  updateUser(userId: string, userData: UpdateUserDto): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/users/${userId}`, userData);
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