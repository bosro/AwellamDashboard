import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransportRoutingModule } from './transport-routing.module';
import { TransportDashboardComponent } from './transport-dashboard/transport-dashboard.component';
import { DriverFormComponent } from './driverlist/driver-form/driver-form.component';
import { DriverListComponent } from './driverlist/driverlist.component';
import { DriverDetailsComponent } from './driverlist/driver-details/driver-details.component';
import { TruckManagementComponent } from './truck-management/truck-management.component';
// import { TruckDetailsComponent } from './truck-details/truck-details.component';
import { TruckDetailComponent } from './truck-management/truck-details.component';
// import { MaintenanceHistoryComponent } from './maintenance-history/maintenance-history.component';
// import { MaintenanceDetailsModalComponent } from './maintenance-details-modal/maintenance-details-modal.component';
// import { FuelAnalyticsComponent } from './fuel-analytics/fuel-analytics.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormGroup } from '@angular/forms';
import { TruckFormComponent } from './truck-management/truck-form.component';
import { LoadTruckComponent } from './truck-management/load-truck.component';
import { InventoryListComponent } from './inventory-list/inventory-list.component';
import { InventoryFormComponent } from './inventory-form/inventory-form.component';
import { StockDisbursementComponent } from './stock-disbursement/stock-disbursement.component';
import { DisbursementModalComponent } from './driverlist/driver-details/disbursement-modal/disbursement-modal.component';
import { InventoryDetailsComponent } from './inventory-detail/inventory-detail.component';
import { PaymentDetailComponent } from './Payment-refs/Paymentref-details.component';
import { PaymentListComponent } from './Payment-refs/Paymentref-list.component';
import { PaymentListWithoutSocComponent } from './Payment-refs/PaymentListWithoutSoc';
import { TruckStatisticsComponent } from './truck-management/truckhistory.component';
import { TransportIncomeComponent } from './transportIncome/transaportIncome.component';
import { DepositManagementComponent } from './Deposite-Income/deposite-income-component';

// import { MetricsCardComponent } from '../dashboard/metrics-card/metrics-card.component';


@NgModule({
  declarations: [
    TransportDashboardComponent,
    DriverListComponent,
    DriverFormComponent,
    DriverDetailsComponent,
    TruckManagementComponent,
    TruckDetailComponent,
    TruckFormComponent,
    LoadTruckComponent,
    InventoryListComponent,
    InventoryFormComponent,
    StockDisbursementComponent,
    PaymentDetailComponent,
    PaymentListComponent,
    PaymentListWithoutSocComponent,
    TruckStatisticsComponent,
    TransportIncomeComponent,
    DepositManagementComponent,
    // PaymentListComponent,
    // InventoryListComponent,
    // InventoryFormComponent,
    InventoryDetailsComponent,
    // StockDisbursementComponent,
    DisbursementModalComponent,
// PaymentRefListComponent,
// PaymentRefDetailComponent
    // MetricsCardComponent 
    // MaintenanceHistoryComponent,
    // MaintenanceDetailsModalComponent,
    // MaintenanceFormModalComponent,
    // FuelAnalyticsComponent,
    // TruckDetailsComponent,

  ],
  imports: [
    CommonModule,
    TransportRoutingModule,
    MatMenuModule,
    NgxChartsModule,
    ReactiveFormsModule,
    FormsModule,
    ReactiveFormsModule,

  ]
})
export class TransportModule { }
