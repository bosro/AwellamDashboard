import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from './mock.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  currentUser: Observable<User | null>;

  constructor() {
    const admin = localStorage.getItem('admin');
    const initialUser = admin ? JSON.parse(admin) : null;
    this.currentUserSubject = new BehaviorSubject<User | null>(initialUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  getUser(): Observable<User> {
    const admin = localStorage.getItem('admin');
    const user = admin ? JSON.parse(admin) : null;
    return of(user).pipe(delay(500)); // Simulate API delay
  }

  logout(): Observable<void> {
    this.currentUserSubject.next(null);
    localStorage.removeItem('admin');
    return of(void 0).pipe(delay(500)); // Simulate API delay
  }
}