import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DistributionListComponent } from './distribution-list/distribution-list.component';
import { DistributionFormComponent } from './distribution-form/distribution-form.component';
import { DistributionDetailsComponent } from './distribution-details/distribution-details.component';
import { DriverAssignmentComponent } from './driver-assignment/driver-assignment.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {path: '', redirectTo: 'distribution-list', pathMatch: 'full'},
      { path: 'distribution-list', component: DistributionListComponent },
      { path: 'new', component: DistributionFormComponent },
      { path: 'edit/:id', component: DistributionFormComponent },
      { path: 'details/:id', component: DistributionDetailsComponent },
      { path: 'assign-driver', component: DriverAssignmentComponent },
      // { path: 'optimize-route', component: RouteOptimizationComponent },
      // { path: 'tracking', component: DeliveryTrackingComponent }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DistributionRoutingModule { }
