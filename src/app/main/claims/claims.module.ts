import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClaimsRoutingModule } from './claims-routing.module';
import { ClaimFormComponent } from './claim-form/claim-form.component';
import { ClaimDetailsComponent } from './claim-details/claim-details.component';
import { ClaimApprovalComponent } from './claim-approval/claim-approval.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClaimsListComponent } from './claim-list/claim-list.component';


@NgModule({
  declarations: [
    ClaimFormComponent,
    ClaimDetailsComponent,
    ClaimApprovalComponent,
    ClaimsListComponent
  ],
  imports: [
    CommonModule,
    ClaimsRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class ClaimsModule { }
