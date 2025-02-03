import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { ClaimFormComponent } from './claim-form/claim-form.component';
// import { ClaimDetailsComponent } from './claim-details/claim-details.component';
// import { ClaimApprovalComponent } from './claim-approval/claim-approval.component';
import { ClaimsReportComponent } from './claim-list/claim-list.component';

const routes: Routes = [
  {
    path: '',
    component: ClaimsReportComponent,  // Add this
    children: [
      { path: '', redirectTo: 'claims-list', pathMatch: 'full' },
      // Remove claims-list route since parent now handles it
      // { path: 'new', component: ClaimFormComponent },
      // { path: 'edit/:id', component: ClaimFormComponent },
      // { path: 'details/:id', component: ClaimDetailsComponent },
      // { path: 'approval', component: ClaimApprovalComponent }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClaimsRoutingModule { }
