import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PurchasingRoutingModule } from './purchasing-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

import { RouterModule } from '@angular/router';
import { PurchaseFormComponent } from './purchasing-form/purchasing-form.component';
import { PurchaseListComponent } from './purchasing-list/purchasing-list.component';
import { PurchaseDetailComponent } from './purchasing-detail/purchasing-detail.component';


@NgModule({
  declarations: [
    // PurchasingComponent,
    // PurchasingFormComponent,
    // PurchasingListComponent,
    // PurchasingDetailComponent
    PurchaseFormComponent,
    PurchaseListComponent,
    // PurchaseFormComponent,
    PurchaseDetailComponent
  ],
  imports: [
    CommonModule,
    PurchasingRoutingModule,
    ReactiveFormsModule,
    PurchasingRoutingModule,
    SharedModule,
    RouterModule,
    FormsModule,

  ]
})
export class PurchasingModule { }
