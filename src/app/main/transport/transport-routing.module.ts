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

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: TransportDashboardComponent },
      { path: 'drivers/new', component: DriverFormComponent },
      { path: 'drivers/:id', component: DriverDetailsComponent },
      { path: 'drivers/:id/edit', component: DriverFormComponent },
      {path: 'drivers', component:DriverListComponent},
      { path: 'trucks', component: TruckManagementComponent },
      { path: 'trucks/new', component: TruckFormComponent },
      { path: 'trucks/details/:id', component: TruckDetailComponent },
      {path:'trucks/load' , component: LoadTruckComponent}
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransportRoutingModule { }
