import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BanksComponent } from './bank-list/bank-list.component';
import { BankUploadsComponent } from './bank-upload/bank-upload';
import { TransactionsComponent } from './transaction/transaction.component';
import { TransactionComponent } from './all-transaction/all-transaction';



const routes: Routes = [
    { path: '', component: BanksComponent },
    { path: ':id/uploads', component: BankUploadsComponent },
    { path: ':bankId/uploads/:uploadId', component: TransactionsComponent },
    { path: 'transactions/:bankId', component: TransactionComponent }
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BankRoutingModule { }