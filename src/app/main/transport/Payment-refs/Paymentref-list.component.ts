// src/app/components/payment-ref-list/payment-ref-list.component.ts
import { Component, OnInit } from '@angular/core';
// import { ApiService } from '../../services/api.service';
import { ApiService } from '../../../services/payment.service';
import { PaymentRef, Plant } from '../../../services/payment.service';
import { Router } from '@angular/router';

// @Component({
//   selector: 'app-payment-ref-list',
//   template: `
//     <div class="container mx-auto p-4">
//       <div class="flex justify-between items-center mb-6">
//         <h1 class="text-2xl font-bold">Payment References</h1>
//         <button 
//           (click)="openNewPaymentRefModal()"
//           class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//         >
//           Add Payment Reference
//         </button>
//       </div>

//       <!-- New Payment Ref Modal -->
//       <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//         <div class="bg-white p-6 rounded-lg w-96">
//           <h2 class="text-xl font-bold mb-4">Create New Payment Reference</h2>
//           <!-- <select 
//             [(ngModel)]="selectedPlantId"
//             class="w-full p-2 border rounded mb-4"
//           > -->
//             <!-- <option value="">Select Plant</option>
//             <option *ngFor="let plant of plants" [value]="plant.id">
//               {{plant.name}}
//             </option>
//           </select> -->
//           <div class="flex justify-end gap-2">
//             <button 
//               (click)="closeModal()"
//               class="px-4 py-2 border rounded"
//             >
//               Cancel
//             </button>
//             <button 
//               (click)="createPaymentRef()"
//               [disabled]="!selectedPlantId"
//               class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//             >
//               Create
//             </button>
//           </div>
//         </div>
//       </div>

//       <!-- Payment Refs List -->
//       <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         <div 
//           *ngFor="let paymentRef of paymentRefs"
//           class="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
         
//         >
//         <!-- routerLink]="['/payment-ref', paymentRef.id]" -->
//           <h2 class="text-xl font-semibold mb-2">Ref: {{paymentRef.id}}</h2>
//           <p class="text-gray-600">Plant: {{paymentRef.plant.name}}</p>
//           <!-- <p class="text-gray-600">Created: {{paymentRef.createdAt | date}}</p> -->
//           <p class="text-gray-600">SOCs: {{paymentRef.socs?.length || 0}}</p>
//         </div>
//       </div>
//     </div>
//   `
// })
// export class PaymentRefListComponent implements OnInit {
//   paymentRefs: PaymentRef[] = [];
//   plants: Plant[] = [];
//   showModal = false;
//   selectedPlantId: number | null = null;

//   constructor(private apiService: ApiService) {}

//   ngOnInit() {
//     this.loadPaymentRefs();
//     this.loadPlants();
//   }

//   loadPaymentRefs() {
//     this.apiService.getPaymentRefs().subscribe(refs => {
//       this.paymentRefs = refs;
//     });
//   }

//   loadPlants() {
//     this.apiService.getPlants().subscribe(plants => {
//       this.plants = plants;
//     });
//   }

//   openNewPaymentRefModal() {
//     this.showModal = true;
//   }

//   closeModal() {
//     this.showModal = false;
//     this.selectedPlantId = null;
//   }

//   createPaymentRef() {
//     if (this.selectedPlantId) {
//       this.apiService.createPaymentRef(this.selectedPlantId).subscribe(newRef => {
//         this.paymentRefs = [...this.paymentRefs, newRef];
//         this.closeModal();
//       });
//     }
//   }
// }

// Update the PaymentRef interface in models.ts
// export interface PaymentRef {
//     id?: string;
//     paymentField: string;  // Added this field
//     plantId: number;
//     plant?: Plant;
//     createdAt?: Date;
//     socs?: SOC[];
//   }
  
//   // Update the payment-ref-list.component.ts
//   import { Component, OnInit } from '@angular/core';
//   import { PaymentRef, Plant } from '../../../services/payment.service';
  
  @Component({
    selector: 'app-payment-ref-list',
    template: `
      <div class="container mx-auto p-4">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold">Payment References</h1>
          <button 
            (click)="openNewPaymentRefModal()"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Payment Reference
          </button>
        </div>
  
        <!-- New Payment Ref Modal -->
        <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div class="bg-white p-6 rounded-lg w-96">
            <h2 class="text-xl font-bold mb-4">Create New Payment Reference</h2>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Payment Field</label>
              <input 
                [(ngModel)]="newPaymentRef.paymentField"
                type="text"
                class="w-full p-2 border rounded"
                placeholder="Enter payment field"
              />
            </div>
  
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Select Plant</label>
              <select 
                [(ngModel)]="newPaymentRef.plantId"
                class="w-full p-2 border rounded"
              >
                <option value="">Select Plant</option>
                <option *ngFor="let plant of plants" [value]="plant.id">
                  {{plant.name}}
                </option>
              </select>
            </div>
  
            <div class="flex justify-end gap-2">
              <button 
                (click)="closeModal()"
                class="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button 
                (click)="createPaymentRef()"
                [disabled]="!newPaymentRef.plantId || !newPaymentRef.paymentField"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
  
        <!-- Payment Refs List -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div 
            *ngFor="let paymentRef of paymentRefs"
            class="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
          (click)="PaymentDetails(paymentRef)"
          >
            <h2 class="text-xl font-semibold mb-2">{{paymentRef.paymentField}}</h2>
            <p class="text-gray-600">Ref ID: {{paymentRef.id}}</p>
            <p class="text-gray-600">Plant: {{paymentRef.plant.name}}</p>
            <p class="text-gray-600">Created: {{paymentRef.createdAt | date}}</p>
            <p class="text-gray-600">SOCs: {{paymentRef.socs?.length || 0}}</p>
          </div>
        </div>
      </div>
    `
  })
  export class PaymentRefListComponent implements OnInit {
    paymentRefs: PaymentRef[] = [];
    plants: Plant[] = [];
    showModal = false;
    newPaymentRef: Partial<PaymentRef> = {};
  
    constructor( private router:Router) {}
  
    ngOnInit() {
      this.loadPaymentRefs();
      this.loadPlants();
    }


    PaymentDetails(paymentRef: PaymentRef){
        this.router.navigate(['main/transport/payment-ref', paymentRef.id])
    }
  
    loadPaymentRefs() {
      // Dummy data for demonstration
      this.paymentRefs = [
        {
          id: '1',
          paymentField: 'Payment Field 1',
          plantId: 1,
          plant: { id: 1, name: 'Plant A' },
          createdAt: new Date(),
          socs: [
            { id: 1, soNumber: 'SO123', plantId: 1, plantName: 'Plant A', categoryId: 1, categoryName: 'Category A', productId: 1, productName: 'Product A', quantity: 100, orderType: 'Type A', driverId: 1 },
            { id: 2, soNumber: 'SO124', plantId: 1, plantName: 'Plant A', categoryId: 2, categoryName: 'Category B', productId: 2, productName: 'Product B', quantity: 200, orderType: 'Type B', driverId: 1 }
          ]
        },
        {
          id: '2',
          paymentField: 'Payment Field 2',
          plantId: 2,
          plant: { id: 2, name: 'Plant B' },
          createdAt: new Date(),
          socs: [
            { id: 3, soNumber: 'SO125', plantId: 2, plantName: 'Plant B', categoryId: 3, categoryName: 'Category C', productId: 3, productName: 'Product C', quantity: 300, orderType: 'Type C', driverId: 2 }
          ]
        }
      ];
    }
  
    loadPlants() {
      // Dummy data for demonstration
      this.plants = [
        { id: 1, name: 'Plant A' },
        { id: 2, name: 'Plant B' }
      ];
    }
  
    openNewPaymentRefModal() {
      this.showModal = true;
      this.newPaymentRef = {};
    }
  
    closeModal() {
      this.showModal = false;
      this.newPaymentRef = {};
    }
  
    createPaymentRef() {
      if (this.newPaymentRef.plantId && this.newPaymentRef.paymentField) {
        const newRef: PaymentRef = {
          id: (this.paymentRefs.length + 1).toString(),
          paymentField: this.newPaymentRef.paymentField,
          plantId: this.newPaymentRef.plantId,
          plant: this.plants.find(plant => plant.id === this.newPaymentRef.plantId) || { id: 0, name: 'Unknown Plant' },
          createdAt: new Date(),
          socs: []
        };
        this.paymentRefs = [...this.paymentRefs, newRef];
        this.closeModal();
      }
    }
  }
  
//   // Create new payment-ref-detail.component.ts
//   @Component({
//     selector: 'app-payment-ref-detail',
//     template: `
//       <div class="container mx-auto p-4" *ngIf="paymentRef">
//         <div class="mb-6">
//           <div class="flex justify-between items-center">
//             <h1 class="text-2xl font-bold">Payment Reference Details</h1>
//             <button 
//               class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//               (click)="openNewSOCModal()"
//             >
//               Add SOC
//             </button>
//           </div>
//           <div class="mt-2">
//             <p class="text-lg">Payment Field: {{paymentRef.paymentField}}</p>
//             <p class="text-gray-600">Ref ID: {{paymentRef.id}}</p>
//             <p class="text-gray-600">Plant: {{paymentRef.plant?.name}}</p>
//           </div>
//         </div>
  
//         <!-- SOCs List -->
//         <div class="overflow-x-auto">
//           <table class="min-w-full bg-white border rounded-lg">
//             <thead>
//               <tr>
//                 <th class="px-6 py-3 border-b text-left">SO Number</th>
//                 <th class="px-6 py-3 border-b text-left">Plant</th>
//                 <th class="px-6 py-3 border-b text-left">Category</th>
//                 <th class="px-6 py-3 border-b text-left">Product</th>
//                 <th class="px-6 py-3 border-b text-left">Quantity</th>
//                 <th class="px-6 py-3 border-b text-left">Order Type</th>
//                 <th class="px-6 py-3 border-b text-left">Driver</th>
//                 <th class="px-6 py-3 border-b text-left">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr *ngFor="let soc of paymentRef.socs" class="hover:bg-gray-50">
//                 <td class="px-6 py-4 border-b">{{soc.soNumber}}</td>
//                 <td class="px-6 py-4 border-b">{{getPlantName(soc.plantId)}}</td>
//                 <td class="px-6 py-4 border-b">{{getCategoryName(soc.categoryId)}}</td>
//                 <td class="px-6 py-4 border-b">{{getProductName(soc.productId)}}</td>
//                 <td class="px-6 py-4 border-b">{{soc.quantity}}</td>
//                 <td class="px-6 py-4 border-b">{{soc.orderType}}</td>
//                 <td class="px-6 py-4 border-b">
//                   {{soc.driverId ? getDriverName(soc.driverId) : 'Not assigned'}}
//                 </td>
//                 <td class="px-6 py-4 border-b">
//                   <button 
//                     *ngIf="!soc.driverId"
//                     (click)="openAssignDriverModal(soc)"
//                     class="text-blue-500 hover:text-blue-700"
//                   >
//                     Assign Driver
//                   </button>
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
  
//         <!-- Assign Driver Modal -->
//         <div *ngIf="showDriverModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div class="bg-white p-6 rounded-lg w-96">
//             <h2 class="text-xl font-bold mb-4">Assign Driver</h2>
//             <select 
//               [(ngModel)]="selectedDriverId"
//               class="w-full p-2 border rounded mb-4"
//             >
//               <option value="">Select Driver</option>
//               <option *ngFor="let driver of drivers" [value]="driver.id">
//                 {{driver.name}}
//               </option>
//             </select>
//             <div class="flex justify-end gap-2">
//               <button 
//                 (click)="closeDriverModal()"
//                 class="px-4 py-2 border rounded"
//               >
//                 Cancel
//               </button>
//               <button 
//                 (click)="assignDriver()"
//                 [disabled]="!selectedDriverId"
//                 class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//               >
//                 Assign
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     `
//   })
//   export class PaymentRefDetailComponent implements OnInit {
//     paymentRef: PaymentRef | null = null;
//     drivers: Driver[] = [];
//     showDriverModal = false;
//     selectedDriverId: number | null = null;
//     selectedSOC: SOC | null = null;
  
//     constructor(
//       private route: ActivatedRoute,
//       private apiService: ApiService
//     ) {}
  
//     ngOnInit() {
//       this.route.params.subscribe(params => {
//         this.loadPaymentRef(params['id']);
//       });
//       this.loadDrivers();
//     }
  
//     loadPaymentRef