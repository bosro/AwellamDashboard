import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportListComponent } from './report-list/report-list.component';
import { ReportViewerComponent } from './report-viewer/report-viewer.component';
import { ReportGeneratorComponent } from './report-generator/report-generator.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ReportListComponent,
    ReportViewerComponent,
    ReportGeneratorComponent,
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ReportsModule { }
