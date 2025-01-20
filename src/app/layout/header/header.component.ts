import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  showProfileMenu = false;
  showNotifications = false;
  notifications = [];
  unreadCount = 0;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
    // Load notifications here
  }

  logout(): void {
    this.authService.logout();
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }
}