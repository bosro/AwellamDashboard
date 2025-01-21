import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from './mock.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  mockUser: User = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    profileImage: 'assets/images/logo.jpeg'
  };

  private currentUserSubject = new BehaviorSubject<User | null>(this.mockUser);
  currentUser = this.currentUserSubject.asObservable();

  getUser(): Observable<User> {
    return of(this.mockUser).pipe(delay(500)); // Simulate API delay
  }

  logout(): Observable<void> {
    this.currentUserSubject.next(null);
    return of(void 0).pipe(delay(500)); // Simulate API delay
  }
}