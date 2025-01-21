import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TruckOpsListComponent } from './truck-ops-list/truck-ops-list.component';
import { TruckOpsFormComponent } from './truck-ops-form/truck-ops-form.component';


const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: TruckOpsListComponent },
      { path: 'new', component: TruckOpsFormComponent },
      { path: 'edit/:id', component: TruckOpsFormComponent },
    //   { path: 'details/:id', component: TruckOpsDetailsComponent },
    //   { path: 'maintenance-schedule', component: MaintenanceScheduleComponent },
    //   { path: 'performance', component: TruckPerformanceComponent },
    //   { path: 'cost-analysis', component: CostAnalysisComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TruckOpsRoutingModule { }