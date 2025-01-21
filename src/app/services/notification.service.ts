import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: Date;
  icon: string;
  iconClass: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }

  markAsRead(notificationIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/mark-read`, { ids: notificationIds });
  }
}