
// reports-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportListComponent } from './report-list/report-list.component';
import { ReportGeneratorComponent } from './report-generator/report-generator.component';
import { ReportViewerComponent } from './report-viewer/report-viewer.component';
import { ScheduledReportsComponent } from './scheduled-reports/scheduled-reports.component';
import { ReportTemplatesComponent } from './report-templates/report-templates.component';


const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: ReportListComponent },
      { path: 'generator', component: ReportGeneratorComponent },
      { path: 'viewer/:id', component: ReportViewerComponent },
      { path: 'scheduled', component: ScheduledReportsComponent },
      { path: 'templates', component: ReportTemplatesComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }