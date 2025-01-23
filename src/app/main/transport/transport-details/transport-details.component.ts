import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TransportService, Transport } from '../../../services/transport.service';

type TransportStatus = 'scheduled' | 'in-transit' | 'completed' | 'cancelled';
type TimelineStatus = 'completed' | 'current' | 'pending';

interface TimelineEvent {
  title: string;
  description: string;
  timestamp: string;
  status: TimelineStatus;
  icon: string;
}

@Component({
  selector: 'app-transport-details',
  templateUrl: './transport-details.component.html',
  styleUrls: ['./transport-details.component.scss']
})
export class TransportDetailsComponent implements OnInit {
  transport!: Transport;
  loading = false;
  timeline: TimelineEvent[] = [];
  fuelConsumptionData: any[] = [];
  routeProgress = 0;

  constructor(
    private transportService: TransportService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    this.loadTransportDetails(id);
  }

  loadTransportDetails(id: number): void {
    this.loading = true;
    this.transportService.getTransportById(id).subscribe({
      next: (data) => {
        this.transport = data;
        this.generateTimeline();
        this.calculateRouteProgress();
        // this.loadFuelConsumption();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading transport details:', error);
        this.loading = false;
      }
    });
  }

  generateTimeline(): void {
    const now = new Date();
    const startTime = new Date(this.transport.startTime);
    const estimatedEndTime = new Date(this.transport.estimatedEndTime);

    this.timeline = [
      {
        title: 'Transport Scheduled',
        description: 'Transport operation has been scheduled',
        timestamp: this.transport.startTime,
        status: 'completed',
        icon: 'ri-calendar-check-line'
      },
      {
        title: 'Resources Assigned',
        description: `Driver and truck assigned to transport`,
        timestamp: this.transport.startTime,
        status: this.transport.driverId ? 'completed' : 'pending',
        icon: 'ri-team-line'
      },
      {
        title: 'Transport Started',
        description: 'Vehicle departed from starting location',
        timestamp: this.transport.startTime,
        status: this.getTransportStartStatus(),
        icon: 'ri-truck-line'
      },
      {
        title: this.transport.status === 'completed' ? 'Transport Completed' : 'Estimated Arrival',
        description: this.transport.status === 'completed' 
                    ? 'Successfully reached destination'
                    : 'Expected arrival at destination',
        timestamp: this.transport.actualEndTime || this.transport.estimatedEndTime,
        status: this.transport.status === 'completed' ? 'completed' : 'pending',
        icon: 'ri-flag-2-line'
      }
    ];
  }

  private getTransportStartStatus(): TimelineStatus {
    if (this.transport.status === 'in-transit' || this.transport.status === 'completed') {
      return 'completed';
    }
    if (this.transport.status === 'scheduled') {
      return 'pending';
    }
    return 'current';
  }

  calculateRouteProgress(): void {
    if (this.transport.status === 'completed') {
      this.routeProgress = 100;
    } else if (this.transport.status === 'scheduled') {
      this.routeProgress = 0;
    } else {
      const start = new Date(this.transport.startTime).getTime();
      const end = new Date(this.transport.estimatedEndTime).getTime();
      const now = new Date().getTime();
      
      this.routeProgress = Math.min(
        ((now - start) / (end - start)) * 100,
        100
      );
    }
  }

  // loadFuelConsumption(): void {
  //   if (this.transport.truckId && this.transport.id) {
  //     this.transportService.getFuelConsumptionReport(
  //       this.transport.truckId,
  //       { transportId: this.transport.id }
  //     ).subscribe({
  //       next: (data) => {
  //         this.fuelConsumptionData = data;
  //       }
  //     });
  //   }
  // }

  updateStatus(status: TransportStatus): void {
    if (this.transport.id) {
      this.transportService.updateTransport(
        this.transport.id,
        { status }
      ).subscribe({
        next: (updated) => {
          this.transport = updated;
          this.generateTimeline();
          this.calculateRouteProgress();
        }
      });
    }
  }

  getStatusClass(status: TransportStatus): string {
    const statusClasses: Record<TransportStatus, string> = {
      'scheduled': 'bg-yellow-100 text-yellow-800',
      'in-transit': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || '';
  }

  getTimelineStatus(status: TimelineStatus): string {
    const timelineClasses: Record<TimelineStatus, string> = {
      'completed': 'bg-green-500',
      'current': 'bg-blue-500',
      'pending': 'bg-gray-300'
    };
    return timelineClasses[status];
  }
}