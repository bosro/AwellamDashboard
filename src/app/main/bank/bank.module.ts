// bank.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BanksComponent } from './bank-list/bank-list.component';
import { BankUploadsComponent } from './bank-upload/bank-upload';
import { TransactionsComponent } from './transaction/transaction.component';
import { ReconcileModalComponent } from './reconcile-model/reconcile-model';
import { AddBankModalComponent } from './add-bank/add-bank-model';
import { BankRoutingModule } from './bank.module-routing';




@NgModule({
  declarations: [
    BanksComponent,
    BankUploadsComponent,
    TransactionsComponent,
    ReconcileModalComponent,
    AddBankModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReactiveFormsModule,
    FormsModule,
    BankRoutingModule

  ],
})
export class BankModule { }