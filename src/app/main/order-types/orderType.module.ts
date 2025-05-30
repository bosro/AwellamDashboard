import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { OrderTypeListComponent } from './order-type-list/order-type-list.component';
import { OrderTypeModalComponent } from './order-type.modal/order-type-modal.component';
import { OrderTypeRoutingModule } from './orderType-routing.module';
import { OrderTypeDetails } from './order-type-details/order-type-detail';
import { GeneralExpenseComponent } from '../expences/general-expense/general-expense.component';


@NgModule({
  declarations: [OrderTypeListComponent, OrderTypeModalComponent,OrderTypeDetails],
  imports: [CommonModule, ReactiveFormsModule, FormsModule,OrderTypeRoutingModule],

})
export class OrderTypeModule {}