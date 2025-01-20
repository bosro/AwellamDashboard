import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent implements OnInit {
  isSidebarOpen = true;
  pageTitle = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updatePageTitle();
    });
  }

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  private updatePageTitle(): void {
    const currentRoute = this.router.url;
    // Map routes to titles (can be enhanced with route data)
    const routeTitles = {
      '/dashboard': 'Dashboard',
      '/transport/trips': 'Transport Operations',
      '/inventory': 'Inventory Management',
      '/purchasing': 'Purchase Orders',
      '/claims': 'Claims Management',
      // Add more route mappings
    };

    this.pageTitle = routeTitles[currentRoute] || 'Dashboard';
  }
}