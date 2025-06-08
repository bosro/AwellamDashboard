import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { SalesReportComponent} from './report-list/sales-report.component';
// import { ReportViewerComponent } from './report-viewer/report-viewer.component';
// import { ReportGeneratorComponent } from './report-generator/report-generator.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PurchasingReportComponent } from './report-list/purchasing-report.component';
import { SOCReportComponent } from './report-list/soc-report.component';
import {  PaymentReferenceSocsComponent } from './report-list/BorrowedSoc';
import { CustomerSummaryComponent } from './report-list/customer.report.component';
import { SocTableComponent } from './report-list/ActiveSoc.list';
import { BorrowedPaymentReferencesComponent } from './report-list/BorrowedPaymentRef';


@NgModule({
  declarations: [
    SalesReportComponent,
    PurchasingReportComponent,
    SOCReportComponent,
    // BorrowedSocComponent,
    CustomerSummaryComponent,
    SocTableComponent,
    BorrowedPaymentReferencesComponent,
    PaymentReferenceSocsComponent
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
