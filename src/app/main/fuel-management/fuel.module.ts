// Module: src/app/expense/expense.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FuelRoutingModule } from './fuel.routing.module';
import { FuelCardPageComponent } from './pages/fuel-card-page/fuel-card-page';
import { FuelPurchasePageComponent } from './pages/fuel-purchase-page/fuel-puchase-page';
import { FuelDashboardComponent } from './pages/fuel-dashboard/fuel-dashborad.component';
import { FuelCardFormComponent } from './components/fuel-card-form/fuel-card-form';
import { FuelPurchaseListComponent } from './components/fuel-purchase-list/fuel-purchase-list';
import { FuelPurchaseFormComponent } from './components/fuel-purchase-form/fuel-purchase-form';
import { FuelCardListComponent } from './components/fuel-card-list/fuel-card-list';




@NgModule({
  declarations: [
    FuelCardPageComponent,
    FuelPurchasePageComponent,
    FuelDashboardComponent,
    FuelCardFormComponent,
    FuelPurchaseListComponent,
    FuelPurchaseFormComponent,
    FuelCardListComponent
   
  ],
  imports: [
    CommonModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReactiveFormsModule,
    // HttpClientModule,
    // FuelRoutingModule,
    FuelRoutingModule

  ],
})
export class FuelModule { }