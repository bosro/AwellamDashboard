import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderListComponent } from './order-list/order-list.component';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { OrderProcessingComponent } from './order-processing/order-processing.component';
import { OrderAnalyticsComponent } from './order-analytics/order-analytics.component';
import { OrderEditComponent } from './order-edit/order-edit';
import { SalesOrderListComponent } from './sales-list.component/sales-list.compoent';
import { OutSideOrdersTableComponent } from './outsideLoad/outsideLoadOrder';
import { SelfListComponent } from './selfListOrders/self-list.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: OrderListComponent },
      {path:'saleslist', component: SalesOrderListComponent},
      {path:'outsideload', component: OutSideOrdersTableComponent},
      { path: 'details/:id', component: OrderDetailsComponent },
      { path: 'selflist', component: SelfListComponent },
      { path: 'processing', component: OrderProcessingComponent },
      { path: 'analytics', component: OrderAnalyticsComponent },
      {path:'edit/:id' , component:OrderEditComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }