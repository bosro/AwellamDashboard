// login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { first } from 'rxjs/operators';

type LoginFormControls = {
  email: AbstractControl<string>;
  password: AbstractControl<string>;
  rememberMe: AbstractControl<boolean>;
};

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  returnUrl!: string;
  error = '';
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    // redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['dashboard']);
    }
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });

    // get return url from route parameters or default to '/'
    // this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get formControls(): LoginFormControls {
    return this.loginForm.controls as LoginFormControls;
  }

  // onSubmit(): void {
  //   this.submitted = true;

  //   if (this.loginForm.invalid) {
  //     return;
  //   }

  //   this.loading = true;
  //   this.authService.login({
  //     email: this.formControls.email.value,
  //     password: this.formControls.password.value
  //   })
  //   .subscribe({
  //     next: () => {
  //       this.router.navigate(['/main/dashboard']);
  //     },
  //     error: (error: unknown) => {
  //       this.error = error instanceof Error 
  //         ? error.message 
  //         : typeof error === 'object' && error && 'error' in error 
  //           ? (error.error as any)?.message 
  //           : 'An error occurred during login';
  //       this.loading = false;
  //     }
  //   });
  // }

  onSubmits() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          // Redirect to the return URL or dashboard
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/main/dashboard';
          this.router.navigate([returnUrl]);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Login failed. Please try again.';
          console.error('Login error:', err);
        },
      });
    } else {
      Object.keys(this.loginForm.controls).forEach((key) => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
        this.loading = false;
      });
    }
  }
  
  

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  navigate(){
    this.router.navigate(['/dashboard'])
    console.log('----> giiiiii <------')
  }
}