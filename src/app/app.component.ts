import { Component } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Awellam Management System';
  ngOnInit(): void {
    initFlowbite();

    // const user = this.AuthService.getUserFromToken();
    // if (user) {
    //   this.AuthService .currentUserSubject.next(user);
    // }
  }

 
}
