import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TruckOpsService, TruckOperation } from '../../../services/truck-ops.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { OperationMetrics, OperationPriority, OperationStatus, PriorityClasses, StatusClasses } from '../../../shared/types/truck-operation.types';

@Component({
  selector: 'app-truck-ops-list',
  templateUrl: './truck-ops-list.component.html'
})
export class TruckOpsListComponent implements OnInit {
  operations: TruckOperation[] = [];
  selectedOperations: Set<number> = new Set();
  loading = false;
  filterForm!: FormGroup;
  currentPage = 1;
  pageSize = 10;
  total = 0;

  operationTypes = [
    { id: 'maintenance', name: 'Maintenance' },
    { id: 'inspection', name: 'Inspection' },
    { id: 'repair', name: 'Repair' },
    { id: 'fuel', name: 'Fuel' },
    { id: 'service', name: 'Service' }
  ];

  priorities = [
    { id: 'low', name: 'Low' },
    { id: 'medium', name: 'Medium' },
    { id: 'high', name: 'High' }
  ];

  metrics: OperationMetrics = {
    totalOperations: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    maintenanceCost: 0
  };

  private readonly statusClasses: StatusClasses = {
    'scheduled': 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  };

  private readonly priorityClasses: PriorityClasses = {
    'low': 'bg-gray-100 text-gray-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-red-100 text-red-800'
  };


  constructor(
    private truckOpsService: TruckOpsService,
    private fb: FormBuilder
  ) {
    this.createFilterForm();
  }

  ngOnInit(): void {
    this.loadOperations();
    this.setupFilterSubscription();
    this.loadMetrics();
  }


  private createFilterForm(): void {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      operationType: [''],
      status: [''],
      priority: [''],
      dateRange: this.fb.group({
        start: [''],
        end: ['']
      }),
      truckId: ['']
    });
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadOperations();
      });
  }

  private loadOperations(): void {
    this.loading = true;
    const params = {
      page: this.currentPage,
      pageSize: this.pageSize,
      ...this.filterForm.value
    };

    this.truckOpsService.getOperations(params).subscribe({
      next: (response) => {
        this.operations = response.data;
        this.total = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading operations:', error);
        this.loading = false;
      }
    });
  }

  private loadMetrics(): void {
    // Load summary metrics
    this.truckOpsService.getMaintenanceCosts().subscribe({
      next: (data) => {
        this.metrics = {
          ...this.metrics,
          maintenanceCost: data.totalCost
        };
      }
    });

    // Get upcoming maintenance count
    this.truckOpsService.getUpcomingMaintenance().subscribe({
      next: (data) => {
        this.metrics.overdue = data.length;
      }
    });
  }

  toggleSelection(operationId: number): void {
    if (this.selectedOperations.has(operationId)) {
      this.selectedOperations.delete(operationId);
    } else {
      this.selectedOperations.add(operationId);
    }
  }

  toggleAllSelection(): void {
    if (this.selectedOperations.size === this.operations.length) {
      this.selectedOperations.clear();
    } else {
      this.operations.forEach(op => {
        this.selectedOperations.add(op.id);
      });
    }
  }

  exportOperations(format: 'excel' | 'pdf'): void {
    const filters = {
      ids: Array.from(this.selectedOperations).join(','),
      ...this.filterForm.value
    };

    this.truckOpsService.exportOperations(format, filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `truck-operations.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }


  deleteOperation(id: number): void {
    if (!id) return;
    
    if (confirm('Are you sure you want to delete this operation?')) {
      this.truckOpsService.deleteOperation(id).subscribe({
        next: () => {
          this.loadOperations();
        }
      });
    }
  }

  bulkDelete(): void {
    if (this.selectedOperations.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${this.selectedOperations.size} operations?`)) {
      const deletions = Array.from(this.selectedOperations).map(id =>
        this.truckOpsService.deleteOperation(id)
      );

      Promise.all(deletions).then(() => {
        this.selectedOperations.clear();
        this.loadOperations();
      });
    }
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOperations();
  }

  getStatusClass(status: OperationStatus): string {
    return this.statusClasses[status] || '';
  }


  getPriorityClass(priority: OperationPriority): string {
    return this.priorityClasses[priority] || '';
  }


  getDueDate(operation: TruckOperation): string {
    if (!operation.endDate) return 'No due date';
    
    const endDate = new Date(operation.endDate);
    if (isNaN(endDate.getTime())) return 'Invalid date';

    const today = new Date();
    const diff = endDate.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
  }



  















}