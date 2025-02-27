import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserManagementModule } from './user-management/user-management.module';
import { TransportModule } from './transport/transport.module';
import { PurchasingModule } from './purchasing/purchasing.module';
import { InventoryModule } from './inventory/inventory.module';
import { DistributionModule } from './distribution/distribution.module';
import { ClaimsModule } from './claims/claims.module';
import { MainLayoutComponent } from './main-layout.component';
import { AppModule } from '../app.module';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthGuard } from '../guards/auth.guard';



const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { 
        path: '',
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      },
      { 
        path: 'dashboard', 
        loadChildren: () =>
          import('./dashboard/dashboard-routing.module').then((m) => m.DashboardRoutingModule), 
      },
      {
        path: 'transport',
        loadChildren: () =>
          import('./transport/transport.module').then((m) => m.TransportModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'inventory',
        loadChildren: () =>
          import('./inventory/inventory.module').then((m) => m.InventoryModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'purchasing',
        loadChildren: () =>
          import('./purchasing/purchasing.module').then((m) => m.PurchasingModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'claims',
        loadChildren: () =>
          import('./claims/claims.module').then((m) => m.ClaimsModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'user-management',
        loadChildren: () =>
          import('./user-management/user-management.module').then((m) => m.UserManagementModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./reports/reports.module').then((m) => m.ReportsModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./products/products.module').then((m) => m.ProductsModule),
        canActivate: [AuthGuard],
      },
      {
        path:'customers-management',
        loadChildren: ()=> import ('./customers/customer.module').then((m)=>m.CustomerModule),
        canActivate: [AuthGuard],
      },
      {
        path:'transaction',
        loadChildren: ()=> import ('./transactions/transaction.module').then((m)=>m.TransactionModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'expenses',
        loadChildren: () => import('./expences/expense.module').then(m => m.ExpenseModule)
      },
//     ],
//   },
// ];


      {
        path: 'orders',
        loadChildren: () => import('./order/order.module').then(m => m.OrderModule),
        canActivate: [AuthGuard],
        // canActivate: [RoleGuard],
        // data: { roles: ['admin', 'manager'] }
      },
      {
        path: 'customers',
        loadChildren: () => import('./customers/customers.module').then(m => m.CustomersModule),
        canActivate: [AuthGuard],
        // canActivate: [RoleGuard],
        // data: { roles: ['admin'] }
      }
    ],
  },
];

@NgModule({
  declarations: [
    MainLayoutComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class MainModule {}
