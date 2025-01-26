import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing.module';
import { InventoryListComponent } from './inventory-list/inventory-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { InventoryFormComponent } from './inventory-form/inventory-form.component';
import { InventoryDetailsComponent } from './inventory-detail/inventory-detail.component';
import { StockDisbursementComponent } from './stock-disbursement/stock-disbursement.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DisbursementModalComponent } from './disbursement-modal/disbursement-modal.component';
import { ProductsRoutingModule } from '../products/products-routing.module';
import { PurchasingRoutingModule } from '../purchasing/purchasing-routing.module';


@NgModule({
  declarations: [
    InventoryListComponent,
    InventoryFormComponent,
    InventoryDetailsComponent,
    StockDisbursementComponent,
    DisbursementModalComponent
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    NgxChartsModule,
    InventoryRoutingModule,
    ProductsRoutingModule,
    PurchasingRoutingModule

  ]
})
export class InventoryModule { }
