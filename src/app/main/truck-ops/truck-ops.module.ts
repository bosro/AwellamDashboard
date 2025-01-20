import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruckOpsComponent } from './truck-ops/truck-ops.component';
import { TruckOpsListComponent } from './truck-ops-list/truck-ops-list.component';
import { TruckOpsFormComponent } from './truck-ops-form/truck-ops-form.component';



@NgModule({
  declarations: [
    TruckOpsComponent,
    TruckOpsListComponent,
    TruckOpsFormComponent
  ],
  imports: [
    CommonModule
  ]
})
export class TruckOpsModule { }
