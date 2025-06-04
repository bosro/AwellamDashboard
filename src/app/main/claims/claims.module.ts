import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClaimsRoutingModule } from './claims-routing.module';
// import { ClaimFormComponent } from './claim-form/claim-form.component';
// import { ClaimDetailsComponent } from './claim-details/claim-details.component';
// import { ClaimApprovalComponent } from './claim-approval/claim-approval.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {  ClaimsReportComponent } from './claim-list/claim-list.component';
import { OutsideClaimsReportComponent } from './outsideclaims/outsideclaim-list';


@NgModule({
  declarations: [
ClaimsReportComponent,
OutsideClaimsReportComponent
    // ClaimFormComponent,
    // ClaimDetailsComponent,
    // ClaimApprovalComponent,
    // ClaimsListComponent
  ],
  imports: [
    CommonModule,
    ClaimsRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class ClaimsModule { }
