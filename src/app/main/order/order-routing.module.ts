import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderListComponent } from './order-list/order-list.component';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { OrderProcessingComponent } from './order-processing/order-processing.component';
import { OrderAnalyticsComponent } from './order-analytics/order-analytics.component';


const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: OrderListComponent },
      { path: 'details/:id', component: OrderDetailsComponent },
      { path: 'processing', component: OrderProcessingComponent },
      { path: 'analytics', component: OrderAnalyticsComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }