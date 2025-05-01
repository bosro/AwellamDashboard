import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderTypeListComponent } from './order-type-list/order-type-list.component';
import { OrderTypeModalComponent } from './order-type.modal/order-type-modal.component';

const routes: Routes = [
  { path: '', component: OrderTypeListComponent }, // List all order types
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderTypeRoutingModule {}