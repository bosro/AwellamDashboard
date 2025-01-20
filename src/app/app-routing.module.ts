import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './main/main-layout/main-layout.component';
// import { AuthGuard } from './core/guards/auth.guard';
// import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      // {
      //   path: 'dashboard',
      //   loadChildren: () => import('./main/dashboard/dashboard.module').then(m => m.DashboardModule)
      // },
      {
        path: 'transport',
        loadChildren: () => import('./main/transport/transport.module').then(m => m.TransportModule),
        // canActivate: [RoleGuard],
        data: { roles: ['admin', 'manager', 'operator'] }
      },
      {
        path: 'inventory',
        loadChildren: () => import('./main/inventory/inventory.module').then(m => m.InventoryModule),
        // canActivate: [RoleGuard],
        data: { roles: ['admin', 'manager', 'operator'] }
      },
      {
        path: 'purchasing',
        loadChildren: () => import('./main/purchasing/purchasing.module').then(m => m.PurchasingModule),
        // canActivate: [RoleGuard],
        data: { roles: ['admin', 'manager'] }
      },
      {
        path: 'claims',
        loadChildren: () => import('./main/claims/claims.module').then(m => m.ClaimsModule),
        // canActivate: [RoleGuard],
        data: { roles: ['admin', 'manager'] }
      },
      // {
      //   path: 'reports',
      //   loadChildren: () => import('./main/reports/reports.module').then(m => m.ReportsModule),
      //   canActivate: [RoleGuard],
      //   data: { roles: ['admin', 'manager'] }
      // },
      // {
      //   path: 'settings',
      //   loadChildren: () => import('./main/settings/settings.module').then(m => m.SettingsModule),
      //   canActivate: [RoleGuard],
      //   data: { roles: ['admin'] }
      // }
    ]
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }