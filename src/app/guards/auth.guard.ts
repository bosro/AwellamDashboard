import { Injectable } from '@angular/core';
import { 
  Router, 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot 
} from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AuthGuard: Checking authentication');
    const isAuthenticated = this.authService.isAuthenticated();
    console.log('Authenticated:', isAuthenticated);
  
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false; // Changed to return false when not authenticated
    }
    
    // Check for required roles if specified in route data
    if (route.data['roles'] && !this.authService.hasRole(route.data['roles'])) {
      console.log('User does not have required role');
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}