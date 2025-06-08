import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ObjectUrlPipe } from '../../shared/pipe/object-url.pipe';
import { SharedModule } from '../../shared/shared.module';
import { TransactionDetailModalComponent } from './transaction/transaction-details';
import { TransactionComponent } from './transaction/transactions.component';
import { TransactionRoutingModule } from './transaction.routing';
import { BankTransactionsDashboardComponent } from './dashboard/dashboard';



@NgModule({
    declarations: [
        TransactionDetailModalComponent,
        TransactionComponent,
        BankTransactionsDashboardComponent
        
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        TransactionRoutingModule
    ]
})
export class TransactionModule { }