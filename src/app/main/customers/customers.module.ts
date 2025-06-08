import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomersRoutingModule } from './customers-routing.module';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerFormComponent } from './customer-form/customer-form.component';
import { CustomerDetailsComponent } from './customer-detail/customer-detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DebtorsComponent } from './customer-list/debtors-list.component';
import { BulkSmsComponent } from './customer-list/bulk-sms.component';
import { CustomerReceiptsComponent } from './customer-receipts/customer-receipts.component';
import { CustomerReceipts } from './customer-list/customer-receipts.component';
// import { CustomerReceiptsComponent } from './customer-list/customer-receipts.component';


@NgModule({
  declarations: [
    CustomerListComponent,
    CustomerFormComponent,
    CustomerDetailsComponent,
    DebtorsComponent,
    BulkSmsComponent,
    CustomerReceiptsComponent,
    CustomerReceipts
  ],
  imports: [
    CommonModule,
    CustomersRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class CustomersModule { }
