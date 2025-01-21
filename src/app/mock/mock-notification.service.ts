import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Notification {
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
  private mockNotifications: Notification[] = [
    {
      id: 1,
      title: 'New Message',
      message: 'You have received a new message from Jane Smith',
      time: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      icon: 'ri-message-2-line',
      iconClass: 'text-blue-500',
      read: false
    },
    {
      id: 2,
      title: 'Task Update',
      message: 'Your task "Project Review" has been completed',
      time: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      icon: 'ri-task-line',
      iconClass: 'text-green-500',
      read: false
    },
    {
      id: 3,
      title: 'System Update',
      message: 'System maintenance scheduled for tomorrow',
      time: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      icon: 'ri-settings-3-line',
      iconClass: 'text-yellow-500',
      read: true
    }
  ];

  getNotifications(): Observable<Notification[]> {
    return of(this.mockNotifications).pipe(delay(500)); // Simulate API delay
  }

  markAsRead(ids: number[]): Observable<void> {
    this.mockNotifications = this.mockNotifications.map(notification => ({
      ...notification,
      read: ids.includes(notification.id) ? true : notification.read
    }));
    return of(void 0).pipe(delay(500)); // Simulate API delay
  }
}