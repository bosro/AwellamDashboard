import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserManagementComponent } from './user-management/user-management.component';
import { UserEditModalComponent } from './user-edit-modal/user-edit-modal.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {path: '', redirectTo: 'user-management', pathMatch: 'full' },
      { path: 'user-management', component: UserManagementComponent },
      { path: 'edit/:id', component: UserEditModalComponent },
  
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }
