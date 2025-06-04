import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FuelCardPageComponent } from './pages/fuel-card-page/fuel-card-page';
import { FuelPurchasePageComponent } from './pages/fuel-purchase-page/fuel-puchase-page';
import { FuelDashboardComponent } from './pages/fuel-dashboard/fuel-dashborad.component';


const routes: Routes = [
    {
        path: '',


        // path: 'dashboard',
        // component: ExpenseDashboardComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: FuelDashboardComponent },
            {
                path: 'purchase',
                component: FuelPurchasePageComponent
            },
            {
                path: 'card',
                component: FuelCardPageComponent
            },
         

        ]
    }
];







@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FuelRoutingModule { }