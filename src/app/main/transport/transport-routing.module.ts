import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: TransportDashboardComponent },
      { path: 'trips', component: TransportListComponent },
      { path: 'trips/new', component: TransportFormComponent },
      { path: 'trips/:id', component: TransportDetailsComponent },
      { path: 'trips/:id/edit', component: TransportFormComponent },
      { path: 'trucks', component: TruckManagementComponent },
      { path: 'drivers', component: DriverManagementComponent },
      { path: 'routes', component: RouteManagementComponent },
      { path: 'maintenance', component: MaintenanceScheduleComponent }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransportRoutingModule { }
