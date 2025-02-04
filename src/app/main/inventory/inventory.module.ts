import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing.module';
import { InventoryListComponent } from './inventory-list/inventory-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { InventoryFormComponent } from './inventory-form/inventory-form.component';
import { InventoryDetailsComponent } from './inventory-detail/inventory-detail.component';
import { StockDisbursementComponent } from './stock-disbursement/stock-disbursement.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DisbursementModalComponent } from './disbursement-modal/disbursement-modal.component';
import { ProductsRoutingModule } from '../products/products-routing.module';
import { PurchasingRoutingModule } from '../purchasing/purchasing-routing.module';
import { DestinationListComponent } from './destination/destination-list';


@NgModule({
  declarations: [
    InventoryListComponent,
    InventoryFormComponent,
    InventoryDetailsComponent,
    StockDisbursementComponent,
    DisbursementModalComponent,
    DestinationListComponent
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    NgxChartsModule,
    InventoryRoutingModule,
    ProductsRoutingModule,
    PurchasingRoutingModule,
    FormsModule

  ]
})
export class InventoryModule { }
