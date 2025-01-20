import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TransportService } from '../../services/transport.service';

interface MaintenanceRecord {
  id: number;
  truckId: number;
  date: string;
  type: string;
  description: string;
  cost: number;
  technicianName: string;
  status: 'completed' | 'scheduled' | 'in-progress';
  parts: MaintenancePart[];
  laborHours: number;
  nextServiceDate: string;
  mileage: number;
  notes?: string;
}

interface MaintenancePart {
  name: string;
  quantity: number;
  cost: number;
  status: 'available' | 'ordered' | 'installed';
}

@Component({
  selector: 'app-maintenance-history',
  templateUrl: './maintenance-history.component.html'
})
export class MaintenanceHistoryComponent implements OnInit {
  maintenanceRecords: MaintenanceRecord[] = [];
  loading = false;
  selectedRecord: MaintenanceRecord = null;
  showMaintenanceForm = false;
  maintenanceForm: FormGroup;

  maintenanceTypes = [
    'Routine Service',
    'Oil Change',
    'Tire Replacement',
    'Brake Service',
    'Engine Repair',
    'Transmission Service',
    'Electrical System',
    'Body Repair'
  ];

  maintenanceMetrics = {
    totalCost: 0,
    averageRepairTime: 0,
    commonRepairs: [],
    upcomingServices: []
  };

  constructor(
    private transportService: TransportService,
    private fb: FormBuilder
  ) {
    this.createMaintenanceForm();
  }

  ngOnInit(): void {
    this.loadMaintenanceHistory();
    this.calculateMaintenanceMetrics();
  }

  private createMaintenanceForm(): void {
    this.maintenanceForm = this.fb.group({
      type: ['', Validators.required],
      date: ['', Validators.required],
      description: ['', Validators.required],
      technicianName: ['', Validators.required],
      cost: [0, [Validators.required, Validators.min(0)]],
      laborHours: [0, [Validators.required, Validators.min(0)]],
      mileage: [0, [Validators.required, Validators.min(0)]],
      nextServiceDate: ['', Validators.required],
      notes: [''],
      parts: this.fb.array([])
    });
  }

  addPartToForm(): void {
    const partGroup = this.fb.group({
      name: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      cost: [0, [Validators.required, Validators.min(0)]],
      status: ['available']
    });
    this.maintenanceForm.get('parts').push(partGroup);
  }

  private loadMaintenanceHistory(): void {
    this.loading = true;
    this.transportService.getMaintenanceHistory().subscribe({
      next: (records) => {
        this.maintenanceRecords = records;
        this.loading = false;
        this.calculateMaintenanceMetrics();
      },
      error: (error) => {
        console.error('Error loading maintenance history:', error);
        this.loading = false;
      }
    });
  }

  private calculateMaintenanceMetrics(): void {
    // Calculate total cost
    this.maintenanceMetrics.totalCost = this.maintenanceRecords.reduce(
      (sum, record) => sum + record.cost,
      0
    );

    // Calculate average repair time
    const totalHours = this.maintenanceRecords.reduce(
      (sum, record) => sum + record.laborHours,
      0
    );
    this.maintenanceMetrics.averageRepairTime = 
      totalHours / this.maintenanceRecords.length;

    // Find common repairs
    const repairCounts = {};
    this.maintenanceRecords.forEach(record => {
      repairCounts[record.type] = (repairCounts[record.type] || 0) + 1;
    });
    this.maintenanceMetrics.commonRepairs = Object.entries(repairCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Get upcoming services
    this.maintenanceMetrics.upcomingServices = this.maintenanceRecords
      .filter(record => new Date(record.nextServiceDate) > new Date())
      .sort((a, b) => 
        new Date(a.nextServiceDate).getTime() - new Date(b.nextServiceDate).getTime()
      )
      .slice(0, 5);
  }

  submitMaintenanceRecord(): void {
    if (this.maintenanceForm.valid) {
      this.loading = true;
      const formData = this.maintenanceForm.value;

      this.transportService.createMaintenanceRecord(formData).subscribe({
        next: () => {
          this.loadMaintenanceHistory();
          this.showMaintenanceForm = false;
          this.maintenanceForm.reset();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating maintenance record:', error);
          this.loading = false;
        }
      });
    }
  }

  exportMaintenanceHistory(format: 'excel' | 'pdf'): void {
    this.transportService.exportMaintenanceHistory(format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `maintenance-history.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  getStatusClass(status: string): string {
    const classes = {
      'completed': 'bg-green-100 text-green-800',
      'scheduled': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800'
    };
    return classes[status] || '';
  }

  calculateNextServiceDate(record: MaintenanceRecord): Date {
    const maintenanceDate = new Date(record.date);
    // Add standard service interval (e.g., 3 months)
    return new Date(maintenanceDate.setMonth(maintenanceDate.getMonth() + 3));
  }

  getDaysUntilNextService(date: string): number {
    const nextDate = new Date(date);
    const today = new Date();
    return Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  getMaintenancePriority(record: MaintenanceRecord): 'high' | 'medium' | 'low' {
    const daysUntil = this.getDaysUntilNextService(record.nextServiceDate);
    if (daysUntil <= 7) return 'high';
    if (daysUntil <= 30) return 'medium';
    return 'low';
  }
}