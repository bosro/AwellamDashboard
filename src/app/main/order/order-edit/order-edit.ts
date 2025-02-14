import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdersService } from '../../../services/order.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

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
  productId: string = '';
  private apiUrl = `${environment.apiUrl}`;

  constructor(
    private fb: FormBuilder,
    private ordersService: OrdersService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.orderForm = this.fb.group({
      price: ['', Validators.required],
      quantity: ['', Validators.required],
      assignedTruck: ['']
    });
  }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    this.loadOrder();
    this.getTrucks()
  }

  loadOrder(): void {
    if (!this.orderId) return;
    
    this.loading = true;
    this.ordersService.getOrderById(this.orderId).subscribe({
      next: (response) => {
        this.order = response.order;
        this.productId = this.order?.orderItems[0].product?._id;

        this.orderForm.patchValue({
          price: this.order.price,
          assignedTruck: this.order.truckId?._id
        });
        this.loading = false;
        this.getTrucks();
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.loading = false;
      }
    });
  }

  private getTrucks(): void {
    if (!this.productId) return;

    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/trucks/get/trucks/${this.productId}`).subscribe({
      next: (response) => {
        this.trucks = response.trucks.filter((truck: any) => truck.status === 'active');
        this.loading = false;

        console.log(this.productId)
        Swal.fire({
          title: "Driver Fetched Successfully!",
          icon: "success",
          draggable: true
        });
      },
      error: (error) => {
        console.error('Error loading trucks:', error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "No trucks found holding products!",
        });
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.orderForm.valid) {
      this.saving = true;
      const orderData = this.orderForm.value;

      // Update the order price
      this.ordersService.editOrder(this.orderId, { price: orderData.price, quantity: orderData.quantity }).subscribe({
        next: () => {
          // Assign the truck to the order if a truck is selected
          if (orderData.assignedTruck) {
            this.http.put(`${environment.apiUrl}/orders/${this.orderId}/assign-truck`, {
              truckId: orderData.assignedTruck,
              price: orderData.price,
              quantity: orderData.quantity
            }).subscribe({
              next: () => {
                Swal.fire({
                  title: "Driver assigned Successfully!",
                  icon: "success",
                  draggable: true
                });
                this.router.navigate(['/main/orders/details', this.orderId]);
              },
              error: (error) => {
                console.error('Error assigning truck:', error);
                this.saving = false;
                Swal.fire({
                  icon: "error",
                  title: `${error.error?.message}`,
                });
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