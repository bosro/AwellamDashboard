import { ActivatedRoute } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { PaymentRef, Driver } from "../../../services/payment.service";

@Component({
  selector: 'app-payment-ref-detail',
  template: `
    <div class="container mx-auto p-4" *ngIf="paymentRef">
      <div class="mb-6">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold">Payment Reference Details</h1>
          <button 
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            (click)="openNewSOCModal()"
          >
            Add SOC
          </button>
        </div>
        <div class="mt-2">
          <p class="text-lg">Payment Field: {{paymentRef.paymentField}}</p>
          <p class="text-gray-600">Ref ID: {{paymentRef.id}}</p>
          <p class="text-gray-600">Plant: {{paymentRef.plant.name}}</p>
        </div>
      </div>

      <!-- SOCs List -->
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border rounded-lg">
          <thead>
            <tr>
              <th class="px-6 py-3 border-b text-left">SO Number</th>
              <th class="px-6 py-3 border-b text-left">Plant</th>
              <th class="px-6 py-3 border-b text-left">Category</th>
              <th class="px-6 py-3 border-b text-left">Product</th>
              <th class="px-6 py-3 border-b text-left">Quantity</th>
              <th class="px-6 py-3 border-b text-left">Order Type</th>
              <th class="px-6 py-3 border-b text-left">Driver</th>
              <th class="px-6 py-3 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let soc of paymentRef.socs" class="hover:bg-gray-50">
              <td class="px-6 py-4 border-b">{{soc.soNumber}}</td>
              <td class="px-6 py-4 border-b">{{soc.plantName}}</td>
              <td class="px-6 py-4 border-b">{{soc.categoryName}}</td>
              <td class="px-6 py-4 border-b">{{soc.productName}}</td>
              <td class="px-6 py-4 border-b">{{soc.quantity}}</td>
              <td class="px-6 py-4 border-b">{{soc.orderType}}</td>
              <td class="px-6 py-4 border-b">
                {{soc.driverId ? getDriverName(soc.driverId) : 'Not assigned'}}
              </td>
              <td class="px-6 py-4 border-b">
                <button 
                  *ngIf="!soc.driverId"
                  (click)="openAssignDriverModal(soc)"
                  class="text-blue-500 hover:text-blue-700"
                >
                  Assign Driver
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Assign Driver Modal -->
      <div *ngIf="showDriverModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded-lg w-96">
          <h2 class="text-xl font-bold mb-4">Assign Driver</h2>
          <select 
            [(ngModel)]="selectedDriverId"
            class="w-full p-2 border rounded mb-4"
          >
            <option value="">Select Driver</option>
            <option *ngFor="let driver of drivers" [value]="driver.id">
              {{driver.name}}
            </option>
          </select>
          <div class="flex justify-end gap-2">
            <button 
              (click)="closeDriverModal()"
              class="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button 
              (click)="assignDriver()"
              [disabled]="!selectedDriverId"
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentRefDetailComponent implements OnInit {
  paymentRef: PaymentRef | null = null;
  drivers: Driver[] = [];
  showDriverModal = false;
  selectedDriverId: number | null = null;
  selectedSOC: any | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.loadPaymentRef(params['id']);
    });
    this.loadDrivers();
  }

  loadPaymentRef(id: string) {
    // Dummy data for demonstration
    this.paymentRef = {
      id: id,
      paymentField: 'Payment Field Example',
      plantId: 1,
      plant: { id: 1, name: 'Plant A' },
      createdAt: new Date(),
      socs: [
        {
          id: 1,
          soNumber: 'SO123',
          plantId: 1,
          plantName: 'Plant A',
          categoryId: 1,
          categoryName: 'Category A',
          productId: 1,
          productName: 'Product A',
          quantity: 100,
          orderType: 'Type A',
        //   driverId: null
        },
        {
          id: 2,
          soNumber: 'SO124',
          plantId: 1,
          plantName: 'Plant A',
          categoryId: 2,
          categoryName: 'Category B',
          productId: 2,
          productName: 'Product B',
          quantity: 200,
          orderType: 'Type B',
          driverId: 1
        }
      ]
    };
  }

  loadDrivers() {
    // Dummy data for demonstration
    this.drivers = [
      { id: 1, name: 'Driver A' },
      { id: 2, name: 'Driver B' }
    ];
  }

  openNewSOCModal() {
    // Implement this method to open a modal for adding a new SOC
  }

  openAssignDriverModal(soc: any) {
    this.selectedSOC = soc;
    this.showDriverModal = true;
  }

  closeDriverModal() {
    this.showDriverModal = false;
    this.selectedDriverId = null;
    this.selectedSOC = null;
  }

  assignDriver() {
    if (this.selectedSOC && this.selectedDriverId) {
      // Update the SOC with the selected driver
      this.selectedSOC.driverId = this.selectedDriverId;
      this.closeDriverModal();
    }
  }

  getDriverName(id: number): string {
    return this.drivers.find(d => d.id === id)?.name || '';
  }
}