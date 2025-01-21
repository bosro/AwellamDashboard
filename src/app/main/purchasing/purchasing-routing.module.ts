import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PurchaseListComponent } from './purchasing-list/purchasing-list.component';
import { PurchaseFormComponent } from './purchasing-form/purchasing-form.component';
import { PurchaseDetailComponent } from './purchasing-detail/purchasing-detail.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {path: '', redirectTo: 'list', pathMatch: 'full'},
      { path: 'list', component: PurchaseListComponent },
      { path: 'new', component: PurchaseFormComponent },
      { path: 'edit/:id', component: PurchaseFormComponent },
      { path: 'details/:id', component: PurchaseDetailComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchasingRoutingModule { }
