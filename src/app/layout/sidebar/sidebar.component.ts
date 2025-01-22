import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface MenuItem {
  title: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  roles?: string[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  currentRoute = '';
  menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: 'ri-dashboard-line',
      route: '/main/dashboard',
    },
    {
      title: 'Transport',
      icon: 'ri-truck-line',
      expanded: false,
      children: [
        {
          title: 'Dashboard',
          route: '/main/transport/dashboard',
          icon: 'ri-speed-up-line'
        },
        {
          title: 'Operations',
          route: '/main/transport/trips',
          icon: 'ri-route-line'
        },
        {
          title: 'Trucks',
          route: '/main/transport/trucks',
          icon: 'ri-truck-fill'
        },
        // {
        //   title: 'Trips',
        //   route: '/main/transport/trips',
        //   icon: 'ri-caravan-line'
        // },
        {
          title: 'Fuel Analytics',
          route: '/main/transport/fuel-analytics',
          icon: 'ri-ink-bottle-line'
        },
        {
          title: 'Maintenance',
          route: '/main/transport/maintenance-history',
          icon: 'ri-tools-line'
        }
      ]
    },
    {
      title: 'Inventory',
      icon: 'ri-stock-line',
      expanded: false,
      children: [
        {
          title: 'Stock Overview',
          route: '/main/inventory',
          icon: 'ri-database-2-line'
        },
        {
          title: 'Disbursements',
          route: '/main/inventory/disbursement',
          icon: 'ri-exchange-funds-line'
        }
      ]
    },
    {
      title: 'Purchasing',
      icon: 'ri-shopping-cart-2-line',
      expanded: false,
      roles: ['admin', 'manager'],
      children: [
        {
          title: 'Orders',
          route: '/main/purchasing',
          icon: 'ri-order-play-line'
        },
        {
          title: 'Suppliers',
          route: '/main/purchasing/suppliers',
          icon: 'ri-store-2-line'
        }
      ]
    },
    {
      title: 'Claims',
      icon: 'ri-file-list-3-line',
      route: '/main/claims',
    },
    {
      title: 'Reports',
      icon: 'ri-bar-chart-2-line',
      expanded: false,
      children: [
        {
          title: 'Reports Lists',
          route: '/main/reports/list',
          icon: 'ri-list-view'
        },
        {
          title: 'Report Generator',
          route: '/main/reports/generator',
          icon: 'ri-ai-generate-text'
        },
        {
          title: 'Report Schedule',
          route: '/main/reports/scheduled',
          icon: 'ri-calendar-2-line'
        },
        {
          title: 'Report Templates',
          route: '/main/reports/templates',
          icon: 'ri-book-open-line'
        }
      ]
    },
    {
      title: 'Products',
      icon: 'ri-bar-chart-2-line',
      expanded: false,
      children: [
        {
          title: 'Product List',
          route: '/main/products/list',
          icon: 'ri-file-list-2-line'
        },
        // {
        //   title: 'Product Categories',
        //   route: '/main/products/categories',
        //   icon: 'ri-pie-chart-2-line'
        // },
        {
          title: 'Product Inventory',
          route: '/main/products/inventory',
          icon: 'ri-file-list-3-line'
        }
      ]
    },
    {
      title: 'Orders',
      icon: 'ri-file-list-3-line',
      expanded: false,
      // roles: ['admin', 'manager'],
      children: [
        {
          title: 'Order Analytics',
          route: '/main/orders/analytics',
          icon: 'ri-pie-chart-2-line'
        },
        {
          title: 'Order List',
          route: '/main/orders/list',
          icon: 'ri-file-list-2-line'
        },
        {
          title: 'Create Order',
          route: '/main/orders/processing',
          icon: 'ri-play-list-add-fill'
        }
      ]
    },

    {
      title: 'Customers Management',
      icon: 'ri-user-settings-line',
      expanded: false,
      // roles: ['admin', 'manager'],
      children: [
        {
          title: 'Customers',
          route: '/main/customers/list',
          icon: 'ri-group-line'
        },
        {
          title: 'Add Customer',
          route: '/main/customers/new',
          icon: 'i-user-add-line'
        },
       
      ]
    },

  
    // {
    //   title: 'Customer Management',
    //   icon: 'ri-user-settings-line',
    //   route: '/main/customers-management',
    // },
    {
      title: 'Admin Management',
      icon: 'ri-user-settings-line',
      route: '/main/user-management',
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
      this.updateExpandedState();
    });
  }

  ngOnInit(): void {
    this.filterMenuByRole();
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleSubmenu(item: MenuItem): void {
    item.expanded = !item.expanded;
  }

  private filterMenuByRole(): void {
    this.menuItems = this.menuItems.filter(item => {
      if (!item.roles) return true;
      return this.authService.hasRole(item.roles);
    });
  }

  private updateExpandedState(): void {
    this.menuItems.forEach(item => {
      if (item.children) {
        item.expanded = item.children.some(child => 
          child.route ? this.router.isActive(child.route, false) : false
        );
      }
    });
  }

  isActive(route: string | undefined): boolean {
    if (!route) return false;
    return this.router.isActive(route, false);
  }

  isMenuActive(item: MenuItem): boolean {
    if (item.route) {
      return this.isActive(item.route);
    }
    if (item.children) {
      return item.children.some(child => child.route ? this.isActive(child.route) : false);
    }
    return false;
  }
}