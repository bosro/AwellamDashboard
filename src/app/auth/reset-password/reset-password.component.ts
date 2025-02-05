import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'; // Ensure this path is correct
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  isLoading: boolean = false;
  message: string = '';

  constructor(private http: HttpClient , private router: Router) {}

  onSubmit(form: NgForm) {
    if (form.invalid) return; // Prevent submission if form is invalid

    const { email, password, confirmPassword } = form.value;

    if (password !== confirmPassword) {
      this.message = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.message = '';

    const apiUrl = `${environment.apiUrl}/admin/reset-password`;

    this.http.put(apiUrl, { email, newPassword: password })
      .subscribe({
        next: (response: any) => {
          this.message = response.message || 'Password reset successful!';
          this.isLoading = false;
          this.router.navigate(['auth/login'])
        },
        error: (error) => {
          this.message = error.error?.message || 'An error occurred!';
          this.isLoading = false;
        }
      });
  }
}
