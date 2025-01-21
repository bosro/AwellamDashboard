import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { UserManagementModule } from './user-management/user-management.module';
import { TruckOpsModule } from './truck-ops/truck-ops.module';
import { TransportModule } from './transport/transport.module';
import { PurchasingModule } from './purchasing/purchasing.module';
import { InventoryModule } from './inventory/inventory.module';
import { DistributionModule } from './distribution/distribution.module';
import { ClaimsModule } from './claims/claims.module';



@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    UserManagementModule,
    TruckOpsModule,
    TransportModule,
    PurchasingModule,
    InventoryModule,
    DistributionModule,
    ClaimsModule
  ]
})
export class MainModule { }
