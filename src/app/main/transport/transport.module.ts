import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransportRoutingModule } from './transport-routing.module';
import { TransportDashboardComponent } from './transport-dashboard/transport-dashboard.component';
import { TransportlistComponent } from './transportlist/transportlist.component';
import { TransportFormComponent } from './transport-form/transport-form.component';
import { TransportDetailsComponent } from './transport-details/transport-details.component';
import { TruckManagementComponent } from './truck-management/truck-management.component';
import { TruckDetailsComponent } from './truck-details/truck-details.component';
import { MaintenanceHistoryComponent } from './maintenance-history/maintenance-history.component';
import { MaintenanceFormComponent } from './maintenance-form/maintenance-form.component';
import { MaintenanceDetailsModalComponent } from './maintenance-details-modal/maintenance-details-modal.component';
import { MaintenanceFormModalComponent } from './maintenance-form-modal/maintenance-form-modal.component';
import { FuelAnalyticsComponent } from './fuel-analytics/fuel-analytics.component';


@NgModule({
  declarations: [
    TransportDashboardComponent,
    TransportlistComponent,
    TransportFormComponent,
    TransportDetailsComponent,
    TruckManagementComponent,
    TruckDetailsComponent,
    MaintenanceHistoryComponent,
    MaintenanceFormComponent,
    MaintenanceDetailsModalComponent,
    MaintenanceFormModalComponent,
    FuelAnalyticsComponent
  ],
  imports: [
    CommonModule,
    TransportRoutingModule
  ]
})
export class TransportModule { }
