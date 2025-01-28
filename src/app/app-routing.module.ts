import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { PreloadAllModules } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  {
    path: 'main',
    loadChildren: () => import('./main/main.module').then((m) => m.MainModule),
    // canActivate: [AuthGuard],
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: '**',
    redirectTo: 'main',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      useHash: true,
      enableTracing: false,
      preloadingStrategy: PreloadAllModules 
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}