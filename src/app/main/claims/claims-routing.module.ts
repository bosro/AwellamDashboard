import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { ClaimFormComponent } from './claim-form/claim-form.component';
// import { ClaimDetailsComponent } from './claim-details/claim-details.component';
// import { ClaimApprovalComponent } from './claim-approval/claim-approval.component';
import { ClaimsReportComponent } from './claim-list/claim-list.component';
import { OutsideClaimsReportComponent } from './outsideclaims/outsideclaim-list';
import { SalesReportComponent } from '../reports/report-list/sales-report.component';

const routes: Routes = [
  {
    path: '',
    // component: ClaimsReportComponent,  // Add this
    children: [
      { path: '', redirectTo: 'claims', pathMatch: 'full' },

      
      // Remove claims-list route since parent now handles it

      { path: 'awellam-claims', component: ClaimsReportComponent },
      { path: 'outside-claims', component: OutsideClaimsReportComponent },
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
