import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CustomerComponent } from './customer.component';
import { CustomerManagementRouting } from './customer.module-routing.module'

@NgModule({
  declarations: [
    CustomerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    CustomerManagementRouting
  ]
})
export class CustomerModule { }