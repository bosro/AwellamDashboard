import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementRoutingModule } from './user-management-routing.module';
import { UserManagementComponent } from './user-management/user-management.component';
import { UserEditModalComponent } from './user-edit-modal/user-edit-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminFormModalComponent } from './admin-form-modal/admin-form-modal.component';


@NgModule({
  declarations: [
    UserManagementComponent,
    UserEditModalComponent,
    AdminFormModalComponent
  ],
  imports: [
    CommonModule,
    UserManagementRoutingModule,
    ReactiveFormsModule
  ]
})
export class UserManagementModule { }
