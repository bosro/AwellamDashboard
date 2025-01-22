import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerFormComponent } from './customer-form/customer-form.component';
import { CustomerDetailsComponent } from './customer-detail/customer-detail.component';


const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: CustomerListComponent },
      { path: 'new', component: CustomerFormComponent },
      { path: 'edit/:id', component: CustomerFormComponent },
      { path: 'details/:id', component: CustomerDetailsComponent },
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