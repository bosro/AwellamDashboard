import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerComponent } from './customer.component';
import { AuthGuard } from '../../guards/auth.guard';

const routes: Routes = [
  {
     path: '',
     children: [
       { path: '', redirectTo: 'customers-management', pathMatch: 'full' },
       { path: 'customers-management', component: CustomerComponent },
     ]
   }
 ];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerManagementRouting { }