import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransportRoutingModule } from './transport-routing.module';
import { TransportDashboardComponent } from './transport-dashboard/transport-dashboard.component';
import { TransportFormComponent } from './transport-form/transport-form.component';
import { TransportListComponent } from './transportlist/transportlist.component';
import { TransportDetailsComponent } from './driver-details/transport-details.component';
import { TruckManagementComponent } from './truck-management/truck-management.component';
import { TruckDetailsComponent } from './truck-details/truck-details.component';
import { MaintenanceHistoryComponent } from './maintenance-history/maintenance-history.component';
import { MaintenanceDetailsModalComponent } from './maintenance-details-modal/maintenance-details-modal.component';
import { FuelAnalyticsComponent } from './fuel-analytics/fuel-analytics.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { NgxChartsModule } from '@swimlane/ngx-charts';


@NgModule({
  declarations: [
    TransportDashboardComponent,
    TransportListComponent,
    TransportFormComponent,
    TransportDetailsComponent,
    TruckManagementComponent,
    TruckDetailsComponent,
    MaintenanceHistoryComponent,
    MaintenanceDetailsModalComponent,
    // MaintenanceFormModalComponent,
    FuelAnalyticsComponent
  ],
  imports: [
    CommonModule,
    TransportRoutingModule,
    ReactiveFormsModule,
    MatMenuModule,
    NgxChartsModule
  ]
})
export class TransportModule { }
