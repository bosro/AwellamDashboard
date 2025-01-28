import { Injectable } from '@angular/core';
import { 
  HttpEvent, 
  HttpInterceptor, 
  HttpHandler, 
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class SecureHttpInterceptor implements HttpInterceptor {
  
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    // Replace HTTP with HTTPS in the API URL
    const secureApiUrl = environment.apiUrl.replace('http://', 'https://');
    
    // Clone the request and replace the URL with the secure version
    const secureRequest = request.clone({
      url: request.url.replace('http://', 'https://'),
      headers: request.headers.set('Content-Type', 'application/json')
    });

    // Add authentication token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      secureRequest.headers.set('Authorization', `Bearer ${token}`);
    }

    // Handle the request and catch any errors
    return next.handle(secureRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          console.error('An error occurred:', error.error);
          // Handle connection errors
          return throwError(() => new Error('Unable to connect to the server. Please check your connection.'));
        }
        return throwError(() => error);
      })
    );
  }
}