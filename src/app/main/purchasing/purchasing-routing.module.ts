import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PurchaseListComponent } from './purchasing-list/purchasing-list.component';
import { PurchaseFormComponent } from './purchasing-form/purchasing-form.component';


const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: PurchaseListComponent },
      { path: 'new', component: PurchaseFormComponent },
      { path: 'edit/:id', component: PurchaseFormComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchasingRoutingModule { }
