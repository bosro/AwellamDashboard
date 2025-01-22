import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderListComponent } from './order-list/order-list.component';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { OrderAnalyticsComponent } from './order-analytics/order-analytics.component';
import { OrderProcessingComponent } from './order-processing/order-processing.component';
import { ReactiveFormsModule } from '@angular/forms';
import { OrdersRoutingModule } from './order-routing.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';


@NgModule({
  declarations: [
    OrderListComponent,
    OrderDetailsComponent,
    OrderAnalyticsComponent,
    OrderProcessingComponent
  ],
  imports: [
    CommonModule,
    OrdersRoutingModule,
    ReactiveFormsModule,
    NgxChartsModule
  ]
})
export class OrderModule { }
