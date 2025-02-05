import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventoryListComponent } from '../transport/inventory-list/inventory-list.component';
import { InventoryFormComponent } from '../transport/inventory-form/inventory-form.component';
import { InventoryDetailsComponent } from '../transport/inventory-detail/inventory-detail.component';
import { StockDisbursementComponent } from '../transport/stock-disbursement/stock-disbursement.component';
import { DestinationListComponent } from './destination/destination-list';


const routes: Routes = [
  {
    path: '',
    children: [
      {path: '', redirectTo: 'inventory-list', pathMatch: 'full'},
      { path: 'inventory-list', component: InventoryListComponent },
      { path: 'new', component: InventoryFormComponent },
      { path: 'edit/:id', component: InventoryFormComponent },
      { path: 'details/:id', component: InventoryDetailsComponent },
      { path: 'destination', component: DestinationListComponent },
      { path: 'disbursement', component: StockDisbursementComponent },
      // { path: 'low-stock', component: LowStockAlertsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
