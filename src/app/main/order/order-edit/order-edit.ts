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
  drivers: any[] = [];
  order: any;

  constructor(
    private fb: FormBuilder,
    private ordersService: OrdersService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.orderForm = this.fb.group({
      assignedTruck: ['', Validators.required],
      // status: ['', Validators.required],
      price: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    this.loadOrder();
    this.loadDrivers();
  }

  loadOrder(): void {
    if (!this.orderId) return;
    
    this.loading = true;
    this.ordersService.getOrderById(this.orderId).subscribe({
      next: (response) => {
        this.order = response.order;
        this.orderForm.patchValue({
          // status: this.order.status,
          price: this.order.price,
          assignedTruck: this.order.driverId?._id
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.loading = false;
      }
    });
  }

  loadDrivers(): void {
    this.http.get<any>(`${environment.apiUrl}/driver/get`).subscribe({
      next: (response) => {
        this.drivers = response.drivers.filter((driver: any) => driver.status === 'active');
      },
      error: (error) => console.error('Error loading drivers:', error)
    });
  }

  onSubmit(): void {
    if (this.orderForm.valid) {
      this.saving = true;
      const orderData = this.orderForm.value;

      this.ordersService.editOrder(this.orderId, orderData).subscribe({
        next: () => {
          this.router.navigate(['/main/orders/details', this.orderId]);
        },
        error: (error) => {
          console.error('Error updating order:', error);
          this.saving = false;
        }
      });
    }
  }
}