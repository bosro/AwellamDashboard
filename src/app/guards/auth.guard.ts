import { Injectable } from '@angular/core';
import { 
  Router, 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot 
} from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { Observable, of } from 'rxjs';
import { take, tap, map } from 'rxjs/operators';

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
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
    return true;
  
  
  
  

    // If not authenticated synchronously, check asynchronously
    // return this.authService.isAuthenticated$().pipe(
    //   take(1),
    //   map((isAuth) => {
    //     if (!isAuth) {
    //       console.log('User is not authenticated, redirecting to login');
    //       this.router.navigate(['/auth/login'], {
    //         queryParams: { returnUrl: state.url },
    //       });
    //       return false;
    //     }
    //     return true;
    //   })
    // );
  }
}
