import { Component, EventEmitter, Input, OnInit, Output, HostListener } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
// import { Router, NavigationEnd } from '@angular/router';

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
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Output() sidebarToggled = new EventEmitter<void>();
  
  isSidebarOpen = false;
  isCollapsed: boolean = false;
  isMobileSidebarOpen: boolean = false;
  isMobile: boolean = false;

  menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: 'ri-dashboard-line',
      route: '/main/dashboard',
      roles: ['super_admin', 'Admin_Support', 'Loading_officer', 'Stocks_Manager', ]
    },
    {
      title: 'Orders',
      icon: 'ri-file-list-3-line',
      expanded: false,
      roles: ['super_admin', 'Admin_Support', ],
      // roles: ['admin', 'manager'],
      children: [
        {
          title: 'Order Analytics',
          route: '/main/orders/analytics',
          icon: 'ri-pie-chart-2-line'
        },
         {
          title: 'Create Order',
          route: '/main/orders/processing',
          icon: 'ri-play-list-add-fill'
        },
        {
          title: 'Order List',
          route: '/main/orders/list',
          icon: 'ri-file-list-2-line'
        },
        {
          title: 'Sales List',
          route: '/main/orders/saleslist',
          icon: 'ri-file-list-2-line'
        },
        {
          title: 'Outside Load Order',
          route: '/main/orders/outsideload',
          icon: 'ri-play-list-add-fill'
        }
      ]
    },
    {
      title: 'Inventory',
      icon: 'ri-stock-line',
      expanded: false,
      roles: ['super_admin', 'Admin_Support', 'Stocks_Manager'],
      children: [
        // {
        //   title: 'Stock Overview',
        //   route: '/main/inventory',
        //   icon: 'ri-database-2-line'
        // },
        {
          title: 'Product List',
          route: '/main/products/list',
          icon: 'ri-file-list-2-line'
        },
        {
          title: 'Product Inventory',
          route: '/main/products/inventory',
          icon: 'ri-file-list-3-line'
        },
        // {
        //   title: 'Purchase Overview',
        //   route: '/main/purchasing',
        //   icon: 'ri-order-play-line'
        // },
        {
          title: 'Destinations',
          route: '/main/inventory/destination',
          icon: 'ri-exchange-funds-line'
        },
        // {
        //   title: 'Disbursements',
        //   route: '/main/inventory/disbursement',
        //   icon: 'ri-exchange-funds-line'
        // },
        
      ]
    },
    // {
    //   title: 'Products',
    //   icon: 'ri-bar-chart-2-line',
    //   expanded: false,
    //   children: [
    //     {
    //       title: 'Product List',
    //       route: '/main/products/list',
    //       icon: 'ri-file-list-2-line'
    //     },
        
    //     // {
    //     //   title: 'Product Categories',
    //     //   route: '/main/products/categories',
    //     //   icon: 'ri-pie-chart-2-line'
    //     // },
    //     {
    //       title: 'Product Inventory',
    //       route: '/main/products/inventory',
    //       icon: 'ri-file-list-3-line'
    //     }
    //   ]
    // },
    {
      title: 'Transport',
      icon: 'ri-truck-line',
      expanded: false,
      roles: ['super_admin', 'Admin_Support', 'Loading_officer'],
      children: [
        {
          title: 'Dashboard',
          route: '/main/transport/dashboard',
          icon: 'ri-speed-up-line'
        },
        {
          title: 'Payment Ref /SOCs ',
          route: '/main/transport/paymentrefs',
          icon: 'ri-database-2-line'
        },

        {
          title: 'Stock Overview',
          route: '/main/transport/inventory-list',
          icon: 'ri-database-2-line'
        },

        // {
        //   title: 'Operations',
        //   route: '/main/transport/trips',
        //   icon: 'ri-route-line'
        // },
        {
          title: 'Trucks',
          route: '/main/transport/trucks',
          icon: 'ri-truck-fill'
        },
        {
          title: 'Drivers',
          route: '/main/transport/drivers',
          icon: 'ri-caravan-line'
        },
        {
          title: 'Disbursements',
          route: '/main/transport/disbursement',
          icon: 'ri-exchange-funds-line'
        },
      
        // {
        //   title: 'Fuel Analytics',
        //   route: '/main/transport/fuel-analytics',
        //   icon: 'ri-ink-bottle-line'
        // },
        // {
        //   title: 'Maintenance',
        //   route: '/main/transport/maintenance-history',
        //   icon: 'ri-tools-line'
        // }
      ]
    },
    
    // {
    //   title: 'Purchasing',
    //   icon: 'ri-shopping-cart-2-line',
    //   expanded: false,
    //   // roles: ['super_admin', 'manager'],
    //   children: [
    //     {
    //       title: 'Orders',
    //       route: '/main/purchasing',
    //       icon: 'ri-order-play-line'
    //     },
    //     {
    //       title: 'Suppliers',
    //       route: '/main/purchasing/suppliers',
    //       icon: 'ri-store-2-line'
    //     }
    //   ]
    // },

    {
      title: 'Expenses',
      icon: 'ri-user-settings-line',
      expanded: false,
      roles: ['super_admin', 'Admin_Support'],
      children: [
        {
          title: ' Dashboard',
          route: '/main/expenses/dashboard',
          icon: 'ri-group-line'
        },
        {
          title: 'Expense Types',
          route: '/main/expenses/expense-types',
          icon: 'ri-group-line'
        },
        {
          title: 'Transport Expenses',
          route: '/main/expenses/transport',
          icon: 'i-user-add-line',
        
        },
        {
          title: 'General Expenses',
          route: '/main/expenses/general',
          icon: 'i-user-add-line',
        }
      ]
    },

    {
      title: 'Customers Mgt',
      icon: 'ri-user-settings-line',
      expanded: false,
      roles: ['super_admin', 'Admin_Support'],
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
    {
      title: 'Customer Payment ',
      icon: 'ri-bar-chart-2-line',
      expanded: false,
      roles: ['super_admin', 'Admin_Support'],
      children: [
        {
          title: 'Payment Dashboard ',
          route: '/main/transaction/main',
          icon: 'ri-list-view'
        },
        {
          title: 'Receive Payment ',
          route: '/main/transaction/list',
          icon: 'ri-list-view'
        },
        // {
        //   title: 'Pruchase Report ',
        //   route: '/main/reports/purchase-list',
        //   icon: 'ri-list-view'
        // },
        // {
        //   title: 'SOC Report ',
        //   route: '/main/reports/soc-report',
        //   icon: 'ri-list-view'
        // },

        
        // {
        //   title: 'Report Generator',
        //   route: '/main/reports/generator',
        //   icon: 'ri-ai-generate-text'
        // },
        // {
        //   title: 'Report Schedule',
        //   route: '/main/reports/scheduled',
        //   icon: 'ri-calendar-2-line'
        // },
        // {
        //   title: 'Report Templates',
        //   route: '/main/reports/templates',
        //   icon: 'ri-book-open-line'
        // }
      ]
    },
    {
      title: 'Claims',
      icon: 'ri-file-list-3-line',
      roles: ['super_admin', 'Admin_Support'],
      // route: '/main/claims',
      children: [
        {
          title: 'Awellam Invoices ',
          route: '/main/claims/awellam-claims',
          icon: 'ri-list-view'
        },
        {
          title: 'Outside Load Invoices  ',
          route: '/main/claims/outside-claims',
          icon: 'ri-list-view'
        },
      ]
    },
    {
      title: 'Reports',
      icon: 'ri-bar-chart-2-line',
      expanded: false,
      roles: ['super_admin', 'Admin_Support'],
      children: [
        {
          title: 'Sales Report ',
          route: '/main/reports/list',
          icon: 'ri-list-view'
        },
        // {
        //   title: 'Pruchase Report ',
        //   route: '/main/reports/purchase-list',
        //   icon: 'ri-list-view'
        // },
        {
          title: 'SOC Report ',
          route: '/main/reports/soc-report',
          icon: 'ri-list-view'
        },
{
        title: 'Borrowed SOC ',
        route: '/main/reports/borrowed-soc',
        icon: 'ri-list-view'
      }

        

        
        // {
        //   title: 'Report Generator',
        //   route: '/main/reports/generator',
        //   icon: 'ri-ai-generate-text'
        // },
        // {
        //   title: 'Report Schedule',
        //   route: '/main/reports/scheduled',
        //   icon: 'ri-calendar-2-line'
        // },
        // {
        //   title: 'Report Templates',
        //   route: '/main/reports/templates',
        //   icon: 'ri-book-open-line'
        // }
      ]
    },
    
    // {
    //   title: 'Customers Management',
    //   icon: 'ri-user-settings-line',
    //   expanded: false,
    //   // roles: ['admin', 'manager'],
    //   children: [
    //     {
    //       title: 'Customers',
    //       route: '/main/customers/list',
    //       icon: 'ri-group-line'
    //     },
    //     {
    //       title: 'Add Customer',
    //       route: '/main/customers/new',
    //       icon: 'i-user-add-line'
    //     },
       
    //   ]
    // },

    // {
    //   title: 'Customer Management',
    //   icon: 'ri-user-settings-line',
    //   route: '/main/customers-management',
    // },
    {
      title: 'Settings',
      icon: 'ri-user-settings-line',
      route: '/main/user-management',
      roles: ['super_admin']
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateExpandedState();
      if (this.isMobile) {
        this.isMobileSidebarOpen = false;
      }
    });
  }

  ngOnInit(): void {
    this.filterMenuByRole();
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.checkScreenSize();
    if (!this.isMobile) {
      this.isMobileSidebarOpen = false;
    }
  }

  toggleSidebar(): void {
    if (this.isMobile) {
      this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
    } else {
      this.isCollapsed = !this.isCollapsed;
      this.sidebarToggled.emit();
    }
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) {
      this.isMobileSidebarOpen = false;
    }
  }

  private filterMenuByRole(): void {
    const userRole = this.authService.getUserRole();
    
    this.menuItems = this.menuItems.filter(item => {
      if (!item.roles || !userRole) return false; // Only show items with explicit role permissions
      return item.roles.includes(userRole);
    });

    // Filter children if they exist
    this.menuItems.forEach(item => {
      if (item.children) {
        item.children = item.children.filter(child => {
          if (!child.roles) return true; // Show child items without specific roles
          return userRole ? child.roles.includes(userRole) : false;
        });
      }
    });

    // Remove menu items with no remaining children
    this.menuItems = this.menuItems.filter(item => {
      if (item.children) {
        return item.children.length > 0;
      }
      return true;
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

  toggleSubmenu(item: MenuItem): void {
    item.expanded = !item.expanded;
  }

  isMenuActive(item: MenuItem): boolean {
    if (item.route) {
      return this.router.isActive(item.route, false);
    }
    if (item.children) {
      return item.children.some(child => 
        child.route ? this.router.isActive(child.route, false) : false
      );
    }
    return false;
  }

  isActive(route: string | undefined): boolean {
    if (!route) return false;
    return this.router.isActive(route, false);
  }

  // isMenuActive(item: MenuItem): boolean {
  //   if (item.route) {
  //     return this.isActive(item.route);
  //   }
  //   if (item.children) {
  //     return item.children.some(child => child.route ? this.isActive(child.route) : false);
  //   }
  //   return false;
  // }
}