import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TruckOpsService, TruckOperation } from '../../services/truck-ops.service';

@Component({
  selector: 'app-truck-ops-form',
  templateUrl: './truck-ops-form.component.html'
})
export class TruckOpsFormComponent implements OnInit {
  operationForm: FormGroup;
  isEditMode = false;
  loading = false;
  operationId: number;
  attachments: File[] = [];
  existingAttachments: string[] = [];

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

  trucks = []; // Will be populated from service
  locations = []; // Will be populated from service

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
    (this.operationForm.get('tasks') as FormArray).push(task);
  }

  removeTask(index: number): void {
    (this.operationForm.get('tasks') as FormArray).removeAt(index);
  }

  private loadOperation(): void {
    this.loading = true;
    this.truckOpsService.getOperationById(this.operationId).subscribe({
      next: (operation) => {
        this.operationForm.patchValue(operation);
        this.existingAttachments = operation.attachments || [];
        
        // Load tasks
        operation.checklist?.forEach(task => {
          const taskGroup = this.fb.group({
            name: [task.name, Validators.required],
            description: [task.description],
            estimatedTime: [task.estimatedTime],
            completed: [task.completed],
            notes: [task.notes]
          });
          (this.operationForm.get('tasks') as FormArray).push(taskGroup);
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
    // Load trucks from service
  }

  private loadLocations(): void {
    // Load locations from service
  }

  onFileSelect(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      this.attachments = Array.from(files);
    }
  }

  removeAttachment(index: number): void {
    this.attachments.splice(index, 1);
  }

  removeExistingAttachment(index: number): void {
    this.existingAttachments.splice(index, 1);
  }

  async onSubmit(): Promise<void> {
    if (this.operationForm.invalid) {
      return;
    }

    this.loading = true;
    try {
      const formData = this.operationForm.value;

      const operation = this.isEditMode
        ? await this.truckOpsService.updateOperation(this.operationId, formData).toPromise()
        : await this.truckOpsService.createOperation(formData).toPromise();

      if (this.attachments.length > 0) {
        await this.truckOpsService.uploadAttachments(operation.id, this.attachments).toPromise();
      }

      this.router.navigate(['/truck-ops']);
    } catch (error) {
      console.error('Error saving operation:', error);
      this.loading = false;
    }
  }

  get taskControls() {
    return (this.operationForm.get('tasks') as FormArray).controls;
  }

  calculateDuration(): number {
    const startDate = this.operationForm.get('startDate').value;
    const endDate = this.operationForm.get('endDate').value;
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  validateDates(): boolean {
    const startDate = new Date(this.operationForm.get('startDate').value);
    const endDate = new Date(this.operationForm.get('endDate').value);
    return startDate < endDate;
  }
}