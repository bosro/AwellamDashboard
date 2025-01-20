import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DistributionRoutingModule } from './distribution-routing.module';
import { DistributionListComponent } from './distribution-list/distribution-list.component';
import { DistributionFormComponent } from './distribution-form/distribution-form.component';
import { DistributionDetailsComponent } from './distribution-details/distribution-details.component';
import { DriverAssignmentComponent } from './driver-assignment/driver-assignment.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    DistributionListComponent,
    DistributionFormComponent,
    DistributionDetailsComponent,
    DriverAssignmentComponent
  ],
  imports: [
    CommonModule,
    DistributionRoutingModule,
    ReactiveFormsModule
  ]
})
export class DistributionModule { }
