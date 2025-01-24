import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TruckManagementComponent } from './truck-management/truck-management.component';
import { TransportFormComponent } from './transport-form/transport-form.component';
import { TransportDetailsComponent } from './driver-details/transport-details.component';
import { TransportListComponent } from './transportlist/transportlist.component';
import { TransportDashboardComponent } from './transport-dashboard/transport-dashboard.component';
import { FuelAnalyticsComponent } from './fuel-analytics/fuel-analytics.component';
import { MaintenanceHistoryComponent } from './maintenance-history/maintenance-history.component';
import { MaintenanceDetailsModalComponent } from './maintenance-details-modal/maintenance-details-modal.component';
import { MaintenanceFormModalComponent } from './maintenance-form-modal/maintenance-form-modal.component';
import { TruckDetailsComponent } from './truck-details/truck-details.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: TransportDashboardComponent },
      { path: 'drivers', component: TransportListComponent },
      { path: 'drivers/new', component: TransportFormComponent },
      { path: 'drivers/:id', component: TransportDetailsComponent },
      { path: 'drivers/:id/edit', component: TransportFormComponent },
      { path: 'trucks', component: TruckManagementComponent },
      { path: 'trucks/details/:id', component: TruckDetailsComponent },
      // { path: 'fuel-analytics', component: FuelAnalyticsComponent },
      // { path: 'maintenance-history', component: MaintenanceHistoryComponent },
      // { path: 'maintenance-details', component: MaintenanceDetailsModalComponent },
      // { path: 'maintenance-forms', component: MaintenanceFormModalComponent },

    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransportRoutingModule { }
