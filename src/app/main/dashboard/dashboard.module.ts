import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { MetricsCardComponent } from './metrics-card/metrics-card.component';
import { RevenueChartComponent } from './revenue-chart/revenue-chart.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    DashboardComponent,
    MetricsCardComponent,
    RevenueChartComponent,
    
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    NgxChartsModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class DashboardModule { }
