// Module: src/app/expense/expense.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';



// import { ExpenseService } from './services/expense.service';
// import { ExpenseTypeService } from './services/expense-type.service';
import { ExpenseTypeComponent } from './expenseType/expenseType';
import { ExpenseListComponent } from './expenses/expense-list';
import { ExpenseModalComponent } from './expenses/expense-modal';
// import { ExpenseTypeModalComponent } from './expenseType/expenseType-modal';
import { ExpenseRoutingModule } from './expense.routing';
import { ExpenseDashboardComponent } from './expenseDashboard/expenseDashboard';

// Imprest Components
import { ImprestListComponent } from './imprest/imprest-list/imprest-list.component';
import { ImprestFormComponent } from './imprest/imprest-form/imprest-form.component';
import { ImprestDetailComponent } from './imprest/imprest-details/imprest-details.component';
// import { ImprestService } from './imprest/services/imprest.service';

// const routes: Routes = [
//   { path: 'expense-types', component: ExpenseTypeComponent },
//   { path: 'expenses', component: ExpenseListComponent },
//   { path: '', redirectTo: 'expenses', pathMatch: 'full' }
// ];

@NgModule({
  declarations: [
    ExpenseTypeComponent,
    ExpenseListComponent,
    ExpenseModalComponent,
    ExpenseTypeComponent,
    // ExpenseTypeModalComponent,
    ExpenseDashboardComponent,
    // Imprest Components
    ImprestListComponent,
    ImprestFormComponent,
    ImprestDetailComponent
  ],
  imports: [
    CommonModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReactiveFormsModule,
    // HttpClientModule,
    ExpenseRoutingModule
  ],
  providers: [
    // Add Imprest Service
    // ImprestService
  ]
})
export class ExpenseModule { }