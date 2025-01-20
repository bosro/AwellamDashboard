import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementRoutingModule } from './user-management-routing.module';
import { UserManagementComponent } from './user-management/user-management.component';
import { UserEditModalComponent } from './user-edit-modal/user-edit-modal.component';


@NgModule({
  declarations: [
    UserManagementComponent,
    UserEditModalComponent
  ],
  imports: [
    CommonModule,
    UserManagementRoutingModule
  ]
})
export class UserManagementModule { }
