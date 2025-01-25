import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaimsService, Claim } from '../../../services/claim.service'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-claim-form',
  templateUrl: './claim-form.component.html',
  styleUrls: ['./claim-form.component.scss']
})
export class ClaimFormComponent implements OnInit {
  // claimForm!: FormGroup;
  // isEditMode = false;
  // loading = false;
  // claimId!: number;
  // attachments: File[] = [];
  // existingAttachments: string[] = [];
  
  // productTypes = ['42.5R', '32.5N']; 

  @Input() isOpen = false;
  @Input() claimId?: number;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  claimForm!: FormGroup;
  isEditMode = false;
  loading = false;
  attachments: File[] = [];
  existingAttachments: string[] = [];
  productTypes = ['42.5R', '32.5N'];

  constructor(
    private fb: FormBuilder,
    private claimsService: ClaimsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.createForm();


  }

  ngOnInit(): void {
    if (this.claimId) {
      this.isEditMode = true;
      this.loadClaim();
    }
    this.setupAmountSubscription();
  }

  close(): void {
    this.closeModal.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.claimForm.reset();
    this.attachments = [];
    this.existingAttachments = [];
    this.isEditMode = false;
  }

  private createForm(): void {
    this.claimForm = this.fb.group({
      customerName: ['', [Validators.required]],
      salesOrderNumber: ['', [Validators.required]],
      invoiceNumber: ['', [Validators.required]],
      productType: ['', [Validators.required]],
      quantity: [0, [Validators.required, Validators.min(1)]],
      amount: [0, [Validators.required, Validators.min(0)]],
      vatAmount: [{ value: 0, disabled: true }],
      totalAmount: [{ value: 0, disabled: true }],
      description: ['', [Validators.required]],
      notes: ['']
    });
  }

  private setupAmountSubscription(): void {
    this.claimForm.get('amount')!.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(amount => {
        if (amount > 0) {
          this.calculateVAT(amount);
        }
      });
  }

  private calculateVAT(amount: number): void {
    this.claimsService.calculateVAT(amount).subscribe({
      next: (result) => {
        this.claimForm.patchValue({
          vatAmount: result.vatAmount,
          totalAmount: result.totalAmount
        }, { emitEvent: false });
      }
    });
  }

  private loadClaim(): void {
    this.loading = true;
    this.claimsService.getClaimById(this?.claimId).subscribe({
      next: (claim) => {
        this.claimForm.patchValue(claim);
        this.existingAttachments = claim.attachments || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading claim:', error);
        this.loading = false;
      }
    });
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
    if (this.claimForm.valid) {
      this.loading = true;
      try {
        const formValue = this.claimForm.getRawValue();
        
        const claim = this.isEditMode
          ? await this.claimsService.updateClaim(this.claimId!, formValue).toPromise()
          : await this.claimsService.createClaim(formValue).toPromise();

        if (this.attachments.length > 0) {
          await this.claimsService.uploadAttachments(claim!.id, this.attachments).toPromise();
        }

        this.saved.emit();
        this.close();
      } catch (error) {
        console.error('Error saving claim:', error);
        this.loading = false;
      }
    } else {
      Object.keys(this.claimForm.controls).forEach(key => {
        const control = this.claimForm.get(key);
        if (control!.invalid) {
          control!.markAsTouched();
        }
      });
    }
  }
}