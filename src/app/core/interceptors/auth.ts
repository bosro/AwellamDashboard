import { Injectable } from '@angular/core';
import { 
  HttpEvent, 
  HttpInterceptor, 
  HttpHandler, 
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
     providedIn: 'root'
  })
export class SecureHttpInterceptor implements HttpInterceptor {
  
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    // Use the API URL from environment
    const apiUrl = environment.apiUrl;
    
    // Clone the request and update the URL
    const modifiedRequest = request.clone({
      url: request.url.includes('http') ? request.url : `${apiUrl}${request.url}`,
      headers: request.headers.set('Content-Type', 'application/json')
    });

    // Add authentication token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      modifiedRequest.headers.set('Authorization', `Bearer ${token}`);
    }

    // Handle the request with retry logic and error handling
    return next.handle(modifiedRequest).pipe(
      retry(1), // Retry failed requests once
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          if (error.status === 0) {
            errorMessage = 'Server is unreachable. Please check if the server is running and properly configured for HTTPS.';
          } else {
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          }
        }
        
        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}