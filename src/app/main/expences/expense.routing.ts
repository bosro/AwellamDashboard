import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpenseListComponent } from './expenses/expense-list';
import { ExpenseTypeComponent } from './expenseType/expenseType';
import { ExpenseDashboardComponent } from './expenseDashboard/expenseDashboard';
import { ImprestListComponent } from './imprest/imprest-list/imprest-list.component';
import { ImprestFormComponent } from './imprest/imprest-form/imprest-form.component';
import { ImprestDetailComponent } from './imprest/imprest-details/imprest-details.component';

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
                component: ExpenseListComponent
            },
            // Nested Imprest routes
            {
                path: 'imprest',
                children: [
                    { path: '', component: ImprestListComponent },
                    { path: 'create', component: ImprestFormComponent },
                    { path: 'edit/:id', component: ImprestFormComponent },
                    { path: ':id', component: ImprestDetailComponent }
                ]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ExpenseRoutingModule { }