import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { OrderTypeListComponent } from './order-type-list/order-type-list.component';
import { OrderTypeModalComponent } from './order-type.modal/order-type-modal.component';
import { OrderTypeRoutingModule } from './orderType-routing.module';


@NgModule({
  declarations: [OrderTypeListComponent, OrderTypeModalComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule,OrderTypeRoutingModule],

})
export class OrderTypeModule {}