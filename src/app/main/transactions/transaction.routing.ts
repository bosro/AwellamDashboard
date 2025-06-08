


import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransactionComponent } from './transaction/transactions.component';
import { BankTransactionsDashboardComponent } from './dashboard/dashboard';



const routes: Routes = [
    {
        path: '',
        children: [
            { path: '', redirectTo: 'main', pathMatch: 'full' },
            { path: 'main', component: BankTransactionsDashboardComponent },
            
            { path: 'list', component: TransactionComponent },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TransactionRoutingModule { }




