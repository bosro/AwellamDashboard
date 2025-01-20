import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
// import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
// import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { UserManagementComponent } from '../main/user-management/user-management/user-management.component';
// import { AuthGuard } from './guards/auth.guard';
// import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
//   { path: 'forgot-password', component: ForgotPasswordComponent },
//   { path: 'reset-password', component: ResetPasswordComponent },

  { 
    path: 'users', 
    component: UserManagementComponent, 
    // canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { } 