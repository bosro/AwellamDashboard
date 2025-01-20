import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TruckOpsListComponent } from './components/truck-ops-list/truck-ops-list.component';
import { TruckOpsFormComponent } from './components/truck-ops-form/truck-ops-form.component';
import { TruckOpsDetailsComponent } from './components/truck-ops-details/truck-ops-details.component';
import { MaintenanceScheduleComponent } from './components/maintenance-schedule/maintenance-schedule.component';
import { TruckPerformanceComponent } from './components/truck-performance/truck-performance.component';
import { CostAnalysisComponent } from './components/cost-analysis/cost-analysis.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: TruckOpsListComponent },
      { path: 'new', component: TruckOpsFormComponent },
      { path: 'edit/:id', component: TruckOpsFormComponent },
      { path: 'details/:id', component: TruckOpsDetailsComponent },
      { path: 'maintenance-schedule', component: MaintenanceScheduleComponent },
      { path: 'performance', component: TruckPerformanceComponent },
      { path: 'cost-analysis', component: CostAnalysisComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TruckOpsRoutingModule { }