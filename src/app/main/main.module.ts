import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { UserManagementComponent } from './user-management/user-management.component';



@NgModule({
  declarations: [
    MainLayoutComponent,
    UserManagementComponent
  ],
  imports: [
    CommonModule
  ]
})
export class MainModule { }
