import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { SalesReportComponent} from './report-list/sales-report.component';
// import { ReportViewerComponent } from './report-viewer/report-viewer.component';
// import { ReportGeneratorComponent } from './report-generator/report-generator.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PurchasingReportComponent } from './report-list/purchasing-report.component';
import { SOCReportComponent } from './report-list/soc-report.component';


@NgModule({
  declarations: [
    SalesReportComponent,
    PurchasingReportComponent,
    SOCReportComponent
    // ReportListComponent,
    // ReportViewerComponent,
    // ReportGeneratorComponent,
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ReportsModule { }
