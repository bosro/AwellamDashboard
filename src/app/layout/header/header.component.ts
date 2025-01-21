import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../mock/mock-auth.service';
import { User } from '../../mock/mock.interface';
import { NotificationService } from '../../mock/mock-notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: Date;
  icon: string;
  iconClass: string;
  read: boolean;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  showNotifications = false;
  showProfileMenu = false;
  notifications: Notification[] = [];
  currentUser?: User;
  unreadCount = 0;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadNotifications();

    // Subscribe to user changes
    this.authService.currentUser
    .pipe(takeUntil(this.destroy$))
    .subscribe(user => {
      this.currentUser = user ?? undefined; // Already handled in the code.
    });
  
  }


  private loadUserData(): void {
    this.authService.getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
        },
        error: (error) => {
          console.error('Error loading user data:', error);
        }
      });
  }

  
  private loadNotifications(): void {
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.updateUnreadCount();
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
        }
      });
  }

  private updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.showProfileMenu = false;
      this.markNotificationsAsRead();
    }
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) {
      this.showNotifications = false;
    }
  }

  private markNotificationsAsRead(): void {
    const unreadIds = this.notifications
      .filter(n => !n.read)
      .map(n => n.id);
    
    if (unreadIds.length > 0) {
      this.notificationService.markAsRead(unreadIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications = this.notifications.map(n => ({
            ...n,
            read: unreadIds.includes(n.id) ? true : n.read
          }));
          this.updateUnreadCount();
        },
        error: (error) => {
          console.error('Error marking notifications as read:', error);
        }
      });
    
    }
  }

  logout(): void {
    this.authService.logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          console.error('Error during logout:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
}