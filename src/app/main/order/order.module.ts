import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule } from '@angular/forms';

import { OrderListComponent } from './order-list/order-list.component';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { OrderAnalyticsComponent } from './order-analytics/order-analytics.component';
import { OrderProcessingComponent } from './order-processing/order-processing.component';
import { ReactiveFormsModule } from '@angular/forms';
import { OrdersRoutingModule } from './order-routing.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { OrderEditComponent } from './order-edit/order-edit';
import { SalesOrderListComponent } from './sales-list.component/sales-list.compoent';
import { OutSideOrdersTableComponent } from './outsideLoad/outsideLoadOrder';



@NgModule({
  declarations: [
    OrderListComponent,
    OrderDetailsComponent,
    OrderAnalyticsComponent,
    OrderProcessingComponent,
    OrderEditComponent,
    SalesOrderListComponent,
    OutSideOrdersTableComponent
  ],
  imports: [
    CommonModule,
    OrdersRoutingModule,
    ReactiveFormsModule,
    NgxChartsModule,
    FormsModule,
  ]
})
export class OrderModule { }
