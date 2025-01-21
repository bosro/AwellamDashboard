import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TruckOpsService, TruckOperation } from '../../../services/truck-ops.service';
import { OperationFormData, Truck } from '../../../shared/types/truck-operation.types';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-truck-ops-form',
  templateUrl: './truck-ops-form.component.html'
})
export class TruckOpsFormComponent implements OnInit {
  taskControls= []
removeExistingAttachment(_t195: number) {
throw new Error('Method not implemented.');
}
removeAttachment(_t126: any) {
throw new Error('Method not implemented.');
}
onFileSelect($event: Event) {
throw new Error('Method not implemented.');
}
  operationForm!: FormGroup;
  isEditMode = false;
  loading = false;
  operationId!: number;
  attachments: File[] = [];
  existingAttachments: string[] = [];

  operationTypes = [
    { id: 'maintenance', name: 'Maintenance' },
    { id: 'inspection', name: 'Inspection' },
    { id: 'repair', name: 'Repair' },
    { id: 'fuel', name: 'Fuel' },
    { id: 'service', name: 'Service' }
  ] as const;

  priorities = [
    { id: 'low', name: 'Low' },
    { id: 'medium', name: 'Medium' },
    { id: 'high', name: 'High' }
  ] as const;

  trucks: Truck[] = [];
  locations: string[]  = [];

  
  constructor(
    private fb: FormBuilder,
    private truckOpsService: TruckOpsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.operationId = this.route.snapshot.params['id'];
    if (this.operationId) {
      this.isEditMode = true;
      this.loadOperation();
    }
    this.loadTrucks();
    this.loadLocations();
  }

  private createForm(): void {
    this.operationForm = this.fb.group({
      truckId: ['', Validators.required],
      operationType: ['', Validators.required],
      status: ['scheduled'],
      priority: ['medium', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      description: ['', Validators.required],
      cost: [0, [Validators.required, Validators.min(0)]],
      technicianName: [''],
      notes: [''],
      mileage: [0, [Validators.required, Validators.min(0)]],
      location: ['', Validators.required],
      tasks: this.fb.array([])
    });
  }

  addTask(): void {
    const task = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      estimatedTime: [''],
      completed: [false],
      notes: ['']
    });
    this.tasksFormArray.push(task);
  }

  removeTask(index: number): void {
    this.tasksFormArray.removeAt(index);
  }

  private loadOperation(): void {
    this.loading = true;
    this.truckOpsService.getOperationById(this.operationId).subscribe({
      next: (operation: TruckOperation) => {
        // Reset tasks form array
        while (this.tasksFormArray.length) {
          this.tasksFormArray.removeAt(0);
        }

        // Patch main form values
        this.operationForm.patchValue({
          truckId: operation.truckId,
          operationType: operation.operationType,
          status: operation.status,
          priority: operation.priority,
          startDate: operation.startDate,
          endDate: operation.endDate,
          description: operation.description,
          cost: operation.cost || 0,
          technicianName: operation.technicianName || '',
          notes: operation.notes || '',
          mileage: operation.mileage,
          location: operation.location
        });

        // Set attachments
        this.existingAttachments = operation.attachments || [];
        
        // Load tasks if they exist
        operation.checklist?.forEach((task:any) => {
          const taskGroup = this.fb.group({
            name: [task.name, Validators.required],
            description: [task.description || ''],
            estimatedTime: [task.estimatedTime || ''],
            completed: [task.completed],
            notes: [task.notes || '']
          });
          this.tasksFormArray.push(taskGroup);
        });
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading operation:', error);
        this.loading = false;
      }
    });
  }


  private loadTrucks(): void {
    this.loading = true;
    this.truckOpsService.getTrucks().pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (trucks: Truck[]) => {
        this.trucks = trucks;
      },
      error: (error) => {
        console.error('Error loading trucks:', error);
      }
    });
  }
  private loadLocations(): void {
    this.truckOpsService.getLocations().pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (locations) => {
        this.locations = locations;
      },
      error: (error) => {
        console.error('Error loading locations:', error);
      }
    });
  }


  async onSubmit(): Promise<void> {
    if (this.operationForm.invalid) {
      Object.keys(this.operationForm.controls).forEach(key => {
        const control = this.operationForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.loading = true;
    try {
      const formData: OperationFormData = {
        ...this.operationForm.value,
        tasks: this.tasksFormArray.value
      };

      const operation = this.isEditMode
        ? await this.truckOpsService.updateOperation(this.operationId, formData).toPromise()
        : await this.truckOpsService.createOperation(formData).toPromise();

      if (this.attachments.length > 0 && operation) {
        await this.truckOpsService.uploadAttachments(operation.id, this.attachments).toPromise();
      }

      this.router.navigate(['/truck-ops']);
    } catch (error) {
      console.error('Error saving operation:', error);
    } finally {
      this.loading = false;
    }
  }

  // Getter for tasks FormArray
  get tasksFormArray(): FormArray {
    return this.operationForm.get('tasks') as FormArray;
  }
  calculateDuration(): number {
    const startDate = this.operationForm.get('startDate')!.value;
    const endDate = this.operationForm.get('endDate')!.value;
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  validateDates(): boolean {
    const startDate = new Date(this.operationForm.get('startDate')!.value);
    const endDate = new Date(this.operationForm.get('endDate')!.value);
    return startDate < endDate;
  }
}