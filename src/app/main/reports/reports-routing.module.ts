
// reports-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesReportComponent } from './report-list/sales-report.component';
import { PurchasingReportComponent } from './report-list/purchasing-report.component';
import { SOCReportComponent } from './report-list/soc-report.component';
// import { ReportListComponent } from './report-list/sales-report.component';
// import { ReportGeneratorComponent } from './report-generator/report-generator.component';
// import { ReportViewerComponent } from './report-viewer/report-viewer.component';




const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: SalesReportComponent },
      // { path: 'purchase-list', component: PurchasingReportComponent},
      {path: 'soc-report' , component : SOCReportComponent}

      // { path: 'generator', component: ReportGeneratorComponent },
      // { path: 'viewer/:id', component: ReportViewerComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }