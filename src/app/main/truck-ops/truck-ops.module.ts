import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruckOpsListComponent } from './truck-ops-list/truck-ops-list.component';
import { TruckOpsFormComponent } from './truck-ops-form/truck-ops-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    TruckOpsListComponent,
    TruckOpsFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class TruckOpsModule { }
