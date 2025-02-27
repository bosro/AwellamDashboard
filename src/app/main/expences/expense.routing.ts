import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpenseListComponent } from './expenses/expense-list';
import { ExpenseTypeComponent } from './expenseType/expenseType';
import { ExpenseDashboardComponent } from './expenseDashboard/expenseDashboard';

const routes: Routes = [
    {
        path: '',
        // component: ExpenseDashboardComponent,


        // path: 'dashboard',
        // component: ExpenseDashboardComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: ExpenseDashboardComponent },
            {
                path: 'expense-types',
                component: ExpenseTypeComponent
            },
            {
                path: 'transport',
                component: ExpenseListComponent
            },
         
            {
                path: 'general',
                component:ExpenseListComponent
           
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ExpenseRoutingModule { }