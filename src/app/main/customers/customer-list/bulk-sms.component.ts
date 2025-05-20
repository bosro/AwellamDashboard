import { Component } from '@angular/core';
import { CustomersService } from '../../../services/customer.service';

@Component({
  selector: 'app-bulk-sms',
  templateUrl: './bulk-sms.component.html',
})
export class BulkSmsComponent {
  message: string = '';
  loading: boolean = false;
  error: string = '';
  success: string = '';

  constructor(private customerService: CustomersService) {}

  sendSms(): void {
    if (!this.message.trim()) {
      this.error = 'Message cannot be empty.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.customerService.sendBulkSms(this.message).subscribe({
      next: (response) => {
        this.success = 'Bulk SMS sent successfully!';
        this.message = '';
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to send SMS. Please try again later.';
        console.error('Error sending SMS:', err);
        this.loading = false;
      },
    });
  }
}