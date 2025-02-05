import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Customer } from '../shared/types/customer.interface';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CustomersStore {
  // BehaviorSubject to hold the state of customers
  private _customers$ = new BehaviorSubject<Customer[]>([]);

  // Expose the customers as an observable
  get customers$(): Observable<Customer[]> {
    return this._customers$.asObservable();
  }

  // Method to update the customers
  setCustomers(customers: Customer[]): void {
    this._customers$.next(customers);
  }

  // Method to add a single customer
  addCustomer(customer: Customer): void {
    const currentCustomers = this._customers$.getValue();
    this._customers$.next([...currentCustomers, customer]);
  }

  // Method to update a customer
  updateCustomer(updatedCustomer: Customer): void {
    const currentCustomers = this._customers$.getValue();
    const updatedCustomers = currentCustomers.map((customer) =>
      customer._id === updatedCustomer._id ? updatedCustomer : customer
    );
    this._customers$.next(updatedCustomers);
  }

  // Method to delete a customer
  deleteCustomer(id: string): void {
    const currentCustomers = this._customers$.getValue();
    const updatedCustomers = currentCustomers.filter((customer) => customer._id !== id);
    this._customers$.next(updatedCustomers);
  }

  // Method to search customers by name
  searchCustomersByName(name: string): Observable<Customer[]> {
    return this.customers$.pipe(
      map((customers: Customer[]) =>
        customers.filter((customer) =>
          customer.fullName.toLowerCase().includes(name.toLowerCase())
        )
      )
    );
  }
}