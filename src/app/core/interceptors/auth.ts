import { Injectable } from '@angular/core';
import { 
  HttpEvent, 
  HttpInterceptor, 
  HttpHandler, 
  HttpRequest,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SecureHttpInterceptor implements HttpInterceptor {
  private readonly TOKEN_KEY = 'transport_token';

  constructor(private router: Router) {}
  
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    // Get the access token
    const accessToken = localStorage.getItem(this.TOKEN_KEY);
    
    // Check if the request contains FormData (like file uploads)
    const isFormData = request.body instanceof FormData;
    
    // Create base headers
    let headers = new HttpHeaders();
    
    // Only set Content-Type for non-FormData requests
    // For FormData/file uploads, browser will set the correct Content-Type with boundary
    if (!isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }
    
    // Add token if available
    if (accessToken) {
      headers = headers.set('Authorization', `Bearer ${accessToken}`);
    }
    
    // Clone the request with updated URL and headers
    const modifiedRequest = request.clone({
      url: request.url.includes('http') ? request.url : `${environment.apiUrl}${request.url}`,
      headers: headers
    });

    return next.handle(modifiedRequest).pipe(
      retry(1),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Clear auth data and redirect to login
          localStorage.removeItem(this.TOKEN_KEY);
          localStorage.removeItem('transport_refresh_token');
          localStorage.removeItem('admin');
          localStorage.removeItem('userRole');
          localStorage.removeItem('plantId');
          this.router.navigate(['/auth/login']);
        }
        
        return throwError(() => ({
          status: error.status,
          message: this.getErrorMessage(error)
        }));
      })
    );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'Server is unreachable. Please check your connection.';
      case 401:
        return 'Session expired. Please login again.';
      case 403:
        return 'Access forbidden. You don\'t have permission to access this resource.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'Internal server error. Please try again later.';
      default:
        return error.error?.message || 'An unknown error occurred';
    }
  }
}