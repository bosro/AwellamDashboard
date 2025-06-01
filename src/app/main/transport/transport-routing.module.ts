import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TruckManagementComponent } from './truck-management/truck-management.component';
import { DriverFormComponent } from './driverlist/driver-form/driver-form.component';
import { DriverDetailsComponent } from './driverlist/driver-details/driver-details.component';
import { DriverListComponent } from './driverlist/driverlist.component';
import { TransportDashboardComponent } from './transport-dashboard/transport-dashboard.component';
// import { FuelAnalyticsComponent } from './fuel-analytics/fuel-analytics.component';
// import { MaintenanceHistoryComponent } from './maintenance-history/maintenance-history.component';
// import { MaintenanceDetailsModalComponent } from './maintenance-details-modal/maintenance-details-modal.component';
// import { MaintenanceFormModalComponent } from './maintenance-form-modal/maintenance-form-modal.component';
// import { TruckDetailsComponent } from './truck-details/truck-details.component';
import { TruckDetailComponent } from './truck-management/truck-details.component';
import { TruckFormComponent } from './truck-management/truck-form.component';
import { LoadTruckComponent } from './truck-management/load-truck.component';
import { InventoryListComponent } from './inventory-list/inventory-list.component';
import { InventoryFormComponent } from './inventory-form/inventory-form.component';
import { InventoryDetailsComponent } from './inventory-detail/inventory-detail.component';
import { DestinationListComponent } from '../inventory/destination/destination-list';
import { StockDisbursementComponent } from './stock-disbursement/stock-disbursement.component';
import { PaymentListComponent } from './Payment-refs/Paymentref-list.component';
import { PaymentDetailComponent } from './Payment-refs/Paymentref-details.component';
import { PaymentListWithoutSocComponent } from './Payment-refs/PaymentListWithoutSoc';
import { TruckStatisticsComponent } from './truck-management/truckhistory.component';
import { TransportIncomeComponent } from './transportIncome/transaportIncome.component';
// import { PaymentRefListComponent } from './Payment-refs/Paymentref-list.component';
// import { PaymentRefDetailComponent } from './Payment-refs/Paymentref-details.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'trucks/statistics/:id', component: TruckStatisticsComponent },
      { path: 'dashboard', component: TransportDashboardComponent },
      { path: 'drivers/new', component: DriverFormComponent },
      { path: 'drivers/:id', component: DriverDetailsComponent },
      { path: 'drivers/:id/edit', component: DriverFormComponent },
      { path: 'drivers', component: DriverListComponent },
      { path: 'transport-Income', component: TransportIncomeComponent },
      
      { path: 'trucks', component: TruckManagementComponent },
      { path: 'trucks/new', component: TruckFormComponent },
      { path: 'trucks/details/:id', component: TruckDetailComponent },
      { path: 'trucks/load', component: LoadTruckComponent },
      { path: 'inventory-list', component: InventoryListComponent },
      { path: 'new', component: InventoryFormComponent },
      { path: 'edit/:id', component: InventoryFormComponent },
      { path: 'details/:id', component: InventoryDetailsComponent },
      { path: 'destination', component: DestinationListComponent },
      { path: 'disbursement', component: StockDisbursementComponent },
      {path:'paymentrefs', component: PaymentListComponent},
      {path:'payment-ref/:id' , component: PaymentDetailComponent},
      {path:'without-socs', component: PaymentListWithoutSocComponent},
      
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransportRoutingModule {}
