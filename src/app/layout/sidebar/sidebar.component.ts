import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  @Input() isCollapsed = false;

  @Output() toggleSidebar = new EventEmitter<void>();
  currentRoute = '';

  menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: 'ri-layout-grid-line',
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
          icon: 'ri-dashboard-3-line'
        },
        {
          title: 'Trucks',
          route: '/main/transport/trucks',
          icon: 'ri-truck-line'
        },
        {
          title: 'Drivers',
          route: '/main/transport/drivers',
          icon: 'ri-user-star-line'
        }
      ]
    },
    {
      title: 'Inventory',
      icon: 'ri-archive-line',
      expanded: false,
      children: [
        {
          title: 'Stock Overview',
          route: '/main/inventory',
          icon: 'ri-stack-line'
        },
        {
          title: 'Disbursements',
          route: '/main/inventory/disbursement',
          icon: 'ri-arrow-left-right-line'
        }
      ]
    },
    {
      title: 'Purchasing',
      icon: 'ri-shopping-bag-3-line',
      expanded: false,
      roles: ['admin', 'manager'],
      children: [
        {
          title: 'Orders',
          route: '/main/purchasing',
          icon: 'ri-file-list-3-line'
        },
        {
          title: 'Suppliers',
          route: '/main/purchasing/suppliers',
          icon: 'ri-building-2-line'
        }
      ]
    },
    {
      title: 'Claims',
      icon: 'ri-clipboard-line',
      route: '/main/claims',
    },
    {
      title: 'Reports',
      icon: 'ri-line-chart-line',
      expanded: false,
      children: [
        {
          title: 'Reports Lists',
          route: '/main/reports/list',
          icon: 'ri-file-chart-line'
        },
        {
          title: 'Report Generator',
          route: '/main/reports/generator',
          icon: 'ri-file-settings-line'
        }

      ]
    },
    {
      title: 'Products',
      icon: 'ri-box-3-line',
      expanded: false,
      children: [
        {
          title: 'Product List',
          route: '/main/products/list',
          icon: 'ri-list-check-2'
        },
        {
          title: 'Product Inventory',
          route: '/main/products/inventory',
          icon: 'ri-inbox-archive-line'
        }
      ]
    },
    {
      title: 'Orders',
      icon: 'ri-shopping-cart-line',
      expanded: false,
      children: [
        {
          title: 'Order Analytics',
          route: '/main/orders/analytics',
          icon: 'ri-bar-chart-box-line'
        },
        {
          title: 'Order List',
          route: '/main/orders/list',
          icon: 'ri-list-ordered'
        },
        {
          title: 'Create Order',
          route: '/main/orders/processing',
          icon: 'ri-add-circle-line'
        }
      ]
    },
    {
      title: 'Customers Management',
      icon: 'ri-team-line',
      expanded: false,
      children: [
        {
          title: 'Customers',
          route: '/main/customers/list',
          icon: 'ri-user-3-line'
        },
        {
          title: 'Add Customer',
          route: '/main/customers/new',
          icon: 'ri-user-add-line'
        }
      ]
    },
    {
      title: 'Admin Management',
      icon: 'ri-shield-user-line',
      route: '/main/user-management',
    }
  ];

  // Rest of the component code remains unchanged
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // this.currentRoute = event.url;
      this.updateExpandedState();
    });
  }

  ngOnInit(): void {
    this.filterMenuByRole();
  }

  // toggleSidebar(): void {
  //   this.isCollapsed = !this.isCollapsed;
  // }

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