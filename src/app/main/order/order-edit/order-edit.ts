import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdersService } from '../../../services/order.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-order-edit',
  templateUrl: './order-edit.component.html'
})
export class OrderEditComponent implements OnInit {
  orderForm: FormGroup;
  loading = false;
  saving = false;
  orderId: string = '';
  trucks: any[] = [];
  order: any;
  categoryId: string= '';
  private apiUrl = `${environment.apiUrl}`;
// drivers: any;

  constructor(
    private fb: FormBuilder,
    private ordersService: OrdersService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.orderForm = this.fb.group({
      price: ['', Validators.required],
      assignedTruck: ['']
    });
  }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    this.loadOrder();
    // this.loadTrucks(this.order.productId?._id);
    this.getTrucks()
  }

  loadOrder(): void {
    if (!this.orderId) return;
    
    this.loading = true;
    this.ordersService.getOrderById(this.orderId).subscribe({
      next: (response) => {
        this.order = response.order;
        this.categoryId=this.order.categoryId

      
        this.orderForm.patchValue({
          price: this.order.price,
          assignedTruck: this.order.truckId?._id
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.loading = false;
      }
    });
  } 
  
  // loadTrucks(): void {

  // // loadTrucks(productId: string): void {
  //   this.http.get<any>(`${environment.apiUrl}/trucks/get`).subscribe({
  //     next: (response) => {
  //       this.trucks = response.trucks.filter((truck: any) => truck.status === 'active');
  //     },
  //     error: (error) => console.error('Error loading trucks:', error)
  //   });
  // }

  private getTrucks(): void {
    const categoryId= this.categoryId

    console.log(categoryId)
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/trucks/get/${categoryId}`).subscribe({
      next: (response) => {
        this.trucks = response.trucks.filter((truck: any) => truck.status === 'active');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading trucks:', error);
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.orderForm.valid) {
      this.saving = true;
      const orderData = this.orderForm.value;

      // Update the order price
      this.ordersService.editOrder(this.orderId, { price: orderData.price }).subscribe({
        next: () => {
          // Assign the truck to the order if a truck is selected
          if (orderData.assignedTruck) {
            this.http.put(`${environment.apiUrl}/orders/${this.orderId}/assign-truck`, {
              truckId: orderData.assignedTruck
            }).subscribe({
              next: () => {
                this.router.navigate(['/main/orders/details', this.orderId]);
              },
              error: (error) => {
                console.error('Error assigning truck:', error);
                this.saving = false;
              }
            });
          } else {
            this.router.navigate(['/main/orders/details', this.orderId]);
          }
        },
        error: (error) => {
          console.error('Error updating order:', error);
          this.saving = false;
        }
      });
    }
  }
}