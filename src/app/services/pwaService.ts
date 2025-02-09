// Create a service to handle updates (src/app/services/pwa.service.ts)
import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  constructor(private swUpdate: SwUpdate) {
    this.swUpdate.available.subscribe(() => {
      if (confirm('New version available. Update?')) {
        window.location.reload();
      }
    });
  }
}