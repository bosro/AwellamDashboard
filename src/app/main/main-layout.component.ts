import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

type RouteConfig = {
  path: string;
  title: string;
};

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent implements OnInit {
  isSidebarOpen = true;
  pageTitle = '';
  loading = false;

  private readonly routes: RouteConfig[] = [
    { path: '/main/dashboard', title: 'Dashboard' },
    { path: '/main/transport', title: 'Transport Operations' },
    { path: '/main/inventory', title: 'Inventory Management' },
    { path: '/main/purchasing', title: 'Purchase Orders' },
    { path: '/main/claims', title: 'Claims Management' }
  ];

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
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.updatePageTitle();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  private updatePageTitle(): void {
    const currentRoute = this.router.url;
    this.pageTitle = this.findMatchingRouteTitle(currentRoute);
  }

  private findMatchingRouteTitle(currentRoute: string): string {
    const exactMatch = this.routes.find(route => route.path === currentRoute);
    if (exactMatch) {
      return exactMatch.title;
    }

    const partialMatch = this.routes
      .sort((a, b) => b.path.length - a.path.length)
      .find(route => currentRoute.startsWith(route.path));

    return partialMatch?.title || 'Dashboard';
  }

  getAvailableTitles(): string[] {
    return this.routes.map(route => route.title);
  }

  getAvailablePaths(): string[] {
    return this.routes.map(route => route.path);
  }

  isValidRoute(path: string): boolean {
    return this.routes.some(route => route.path === path);
  }

  getRouteTitle(path: string): string {
    return this.routes.find(route => route.path === path)?.title || 'Dashboard';
  }
}