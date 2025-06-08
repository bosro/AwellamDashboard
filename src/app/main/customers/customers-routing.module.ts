import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerFormComponent } from './customer-form/customer-form.component';
import { CustomerDetailsComponent } from './customer-detail/customer-detail.component';
import { DebtorsComponent } from './customer-list/debtors-list.component';
import { BulkSmsComponent } from './customer-list/bulk-sms.component';
import { CustomerReceiptsComponent } from './customer-receipts/customer-receipts.component';
import { CustomerReceipts } from './customer-list/customer-receipts.component';



const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: CustomerListComponent },
      { path: 'new', component: CustomerFormComponent },
      { path: 'edit/:id', component: CustomerFormComponent },
      { path: 'details/:id', component: CustomerDetailsComponent },
      { path: 'debtors', component: DebtorsComponent },
      { path: 'bulk-sms', component: BulkSmsComponent },
      { path: 'receipts/:id', component: CustomerReceipts },
        { path: 'receipts', component: CustomerReceiptsComponent },
        
   
      
      // { path: 'analytics', component: CustomerAnalyticsComponent },
      // { path: 'segments', component: CustomerSegmentsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomersRoutingModule { }