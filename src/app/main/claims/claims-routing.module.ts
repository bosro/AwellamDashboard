import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClaimFormComponent } from './claim-form/claim-form.component';
import { ClaimDetailsComponent } from './claim-details/claim-details.component';
import { ClaimApprovalComponent } from './claim-approval/claim-approval.component';
import { ClaimsListComponent } from './claim-list/claim-list.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: ClaimsListComponent },
      { path: 'new', component: ClaimFormComponent },
      { path: 'edit/:id', component: ClaimFormComponent },
      { path: 'details/:id', component: ClaimDetailsComponent },
      // { path: 'report/:id', component: ClaimReportComponent },
      { path: 'approval', component: ClaimApprovalComponent }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClaimsRoutingModule { }
