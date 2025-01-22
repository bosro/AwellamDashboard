import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CustomerResponse, BackendCustomer, CustomerFormData } from '../../../types';
// import url from '../../constant/api.contants';
import Swal from 'sweetalert2'
import { environment ,url } from '../../environments/environment';


@Component({
  selector: 'app-customer',

  templateUrl: './customer.component.html',
//   styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customers: BackendCustomer[] = [];
  showingCustomerForm = false;
  editingCustomer: BackendCustomer | null = null;
  selectedCustomer: BackendCustomer | null = null;
  searchTerm = '';

  customerForm: CustomerFormData = this.getEmptyCustomerForm();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getAllCustomers();
  }

  private getEmptyCustomerForm(): CustomerFormData {
    return {
      fullName: '',
      email: '',
      phone: '',
      secondaryPhone: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      password: 'password123'
    };
  }

  get filteredCustomers() {
    return this.customers.filter(customer => {
      const searchLower = this.searchTerm.toLowerCase();
      return customer.fullName.toLowerCase().includes(searchLower) ||
             customer.email.toLowerCase().includes(searchLower) ||
             customer.city.toLowerCase().includes(searchLower);
    });
  }

  getAllCustomers() {
  this.http.get<{ status: string, data: { customers: BackendCustomer[] } }>(`${url}/customer`).subscribe(
    (response) => {
      this.customers = response.data.customers;
    },
    (error) => {
      console.error('Error fetching customers', error);
    }
  );
}

  deleteCustomer(id: string) {
    if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      this.http.delete(`${url}/customer/delete/${id}`).subscribe(
        () => {
          this.customers = this.customers.filter(c => c._id !== id);
                                                 Swal.fire({
  title: "Success",
  text: "Customer Deleted successfully!",
  icon: "success"
});
        },
        (error) => {
          console.error('Error deleting customer', error);
                             Swal.fire({
  title: "Oops!",
  text: error.message,
  icon: "error"
});
        }
      );
    }
  }

  showCustomerDetails(customer: BackendCustomer) {
    this.selectedCustomer = customer;
  }

  showCustomerForm(customer?: BackendCustomer) {
    this.showingCustomerForm = true;
    if (customer) {
      this.editingCustomer = customer;
      this.customerForm = {
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        secondaryPhone: customer.secondaryPhone,
        street: customer.street,
        city: customer.city,
        state: customer.state,
        postalCode: customer.postalCode,
        country: customer.country
      };
    } else {
      this.customerForm = this.getEmptyCustomerForm();
    }
  }

  closeCustomerForm() {
    this.showingCustomerForm = false;
    this.editingCustomer = null;
    this.customerForm = this.getEmptyCustomerForm();
  }



   saveCustomer() {
    if (this.editingCustomer) {
      // Update existing customer
      this.http.put(`${url}/customer/update/${this.editingCustomer._id}`, this.customerForm).subscribe(
        () => {
          this.getAllCustomers();
                                                           Swal.fire({
  title: "Success",
  text: "Customer Edited successfully!",
  icon: "success"
});
          // this.message.success('Customer updated successfully');
          this.closeCustomerForm();
        },
        (error) => {
          console.error('Error updating customer', error);
                                                 Swal.fire({
  title: "Oops!",
  text: error.message|| 'Error updating customer',
  icon: "error"
});
          // this.message.error('Failed to update customer');
        }
      );
    } else {
      // Create new customer
      this.http.post(`${url}/customer/addcustomer`, this.customerForm).subscribe(
        () => {
          this.getAllCustomers();
          // this.message.success('Customer created successfully');
                                                 Swal.fire({
  title: "Success",
  text: "Customer Created successfully!",
  icon: "success"
});
          this.closeCustomerForm();
        },
        (error) => {
          console.error('Error creating customer', error);
                                       Swal.fire({
  title: "Oops!",
  text: error.message|| 'Error creating customer',
  icon: "error"
});
   
          // this.message.error('Failed to create customer');
        }
      );
    }
  }
  // saveCustomer() {
  //   // if (!this.isValidCustomerForm()) {
  //   //   alert('Please fill in all required fields');
  //   //   return;
  //   // }

  //   const customerData = {
  //     ...this.customerForm,
  //     password: this.customerForm.password || 'defaultPassword123' // Add default password if not provided
  //   };

  //   if (this.editingCustomer) {
  //     this.http.put<BackendCustomer>(
  //       `${url}/customer/update/${this.editingCustomer._id}`, 
  //       customerData
  //     ).subscribe(
  //       (updatedCustomer) => {
  //         const index = this.customers.findIndex(c => c._id === this.editingCustomer!._id);
  //         this.customers[index] = updatedCustomer;
  //         this.closeCustomerForm();
  //       },
  //       (error) => {
  //         console.error('Error updating customer', error);
  //       }
  //     );
  //   } else {
  //     this.http.post<BackendCustomer>(`${url}/customer/addcustomer`, customerData).subscribe(
  //       (newCustomer) => {
  //         this.customers.push(newCustomer);
  //         this.closeCustomerForm();
  //       },
  //       (error) => {
  //         console.error('Error adding customer', error);
  //       }
  //     );
  //   }
  // }

  // private isValidCustomerForm(): boolean {
  //   return !!(
  //     this.customerForm.fullName &&
  //     this.customerForm.email &&
  //     this.customerForm.phone &&
  //     this.customerForm.street &&
  //     this.customerForm.city &&
  //     this.customerForm.state &&
  //     this.customerForm.postalCode &&
  //     this.customerForm.country
  //   );
  // }
}