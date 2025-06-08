// components/bank-uploads/bank-uploads.component.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BankService, Bank } from '../../../services/bank.service';
import { BankStatementService, BankUpload } from '../../../services/bank-statement.service';

@Component({
  selector: 'app-bank-uploads',
  templateUrl: './bank-upload.html',
  // styleUrls: ['./bank-uploads.component.scss']
})
export class BankUploadsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  bankId: string = '';
  bank?: Bank;
  uploads: BankUpload[] = [];
  loading = false;
  uploadingFile = false;
  error = '';
  selectedFile?: File;
  isDragging = false;
  
  // Toast notification
  showSuccessToast = false;
  successMessage = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  
  // Filter properties
  filters = {
    startDate: '',
    endDate: '',
    reference: '',
    amount: null as number | null
  };

  constructor(
    private route: ActivatedRoute,
    private bankService: BankService,
    private bankStatementService: BankStatementService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.bankId = params['id'];
      this.loadBank();
      this.loadUploads();
    });
  }

  loadBank(): void {
    this.bankService.getBankById(this.bankId).subscribe({
      next: (data) => {
        this.bank = data;
      },
      error: (err) => {
        this.error = 'Failed to load bank details: ' + err.message;
      }
    });
  }

  loadUploads(): void {
    this.loading = true;
    this.bankStatementService.getUploadsByBank(this.bankId).subscribe({
      next: (response) => {
        this.uploads = response.uploads;
        this.totalItems = this.uploads.length;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load uploads: ' + err.message;
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files.length > 0) {
      this.selectedFile = files[0];
      if (this.selectedFile) {
        this.validateFile(this.selectedFile);
      }
    }
  }

  // Drag and drop methods
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
      this.validateFile(this.selectedFile);
    }
  }

  validateFile(file: File): void {
    // Reset previous error
    this.error = '';
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      this.error = 'File size exceeds maximum limit of 10MB';
      this.selectedFile = undefined;
      return;
    }
    
    // Check file type (you can add more allowed types)
    const allowedTypes = ['application/pdf', 'text/csv', 'application/vnd.ms-excel', 
                          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(file.type)) {
      this.error = 'Invalid file type. Please upload a PDF, CSV, or Excel file';
      this.selectedFile = undefined;
      return;
    }
  }

  removeSelectedFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = undefined;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.error = 'Please select a file to upload';
      return;
    }

    this.uploadingFile = true;
    this.error = '';
    
    this.bankStatementService.uploadBankStatement(this.bankId, this.selectedFile).subscribe({
      next: () => {
        this.uploadingFile = false;
        this.selectedFile = undefined;
        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }
        this.loadUploads(); // Refresh the list after upload
        this.showSuccess('Statement uploaded successfully!');
      },
      error: (err) => {
        this.uploadingFile = false;
        this.error = 'Failed to upload file: ' + err.message;
      }
    });
  }

  deleteUpload(uploadId: string): void {
    if (confirm('Are you sure you want to delete this upload?')) {
      this.bankStatementService.deleteUploadById(uploadId).subscribe({
        next: () => {
          this.uploads = this.uploads.filter(upload => upload._id !== uploadId);
          this.totalItems = this.uploads.length;
          this.showSuccess('Statement deleted successfully!');
        },
        error: (err) => {
          this.error = 'Failed to delete upload: ' + err.message;
        }
      });
    }
  }

  // Filter methods
  applyFilters(): void {
    this.loading = true;
    this.error = '';
    
    // Build query params object
    const queryParams: any = {};
    
    if (this.filters.startDate) {
      queryParams.startDate = this.filters.startDate;
    }
    
    if (this.filters.endDate) {
      queryParams.endDate = this.filters.endDate;
    }
    
    if (this.filters.reference) {
      queryParams.reference = this.filters.reference;
    }
    
    if (this.filters.amount !== null) {
      queryParams.amount = this.filters.amount;
    }
    
    this.bankStatementService.filterUploads(queryParams).subscribe({
      next: (response) => {
        this.uploads = response.data;
        this.totalItems = this.uploads.length;
        this.loading = false;
        this.currentPage = 1;
      },
      error: (err) => {
        this.error = 'Failed to filter uploads: ' + err.message;
        this.loading = false;
      }
    });
  }

  resetFilters(): void {
    this.filters = {
      startDate: '',
      endDate: '',
      reference: '',
      amount: null
    };
    this.loadUploads(); // Load all uploads without filters
  }

  // Additional functionality
  scrollToUploadSection(): void {
    // Scroll to upload section
    document.querySelector('.upload-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  viewUpload(uploadId: string): void {
    // Implementation for viewing an upload
    console.log('Viewing upload:', uploadId);
    // This would typically open a modal or navigate to a details page
  }

  downloadUpload(uploadId: string): void {
    // Implementation for downloading an upload
    console.log('Downloading upload:', uploadId);
    // This would typically call a service method to download the file
  }

  calculateTotalSize(): string {
    // This is a placeholder - real implementation would depend on having file size data
    // For now, we'll just estimate based on number of uploads
    if (this.uploads.length === 0) return '0 KB';
    
    // Assume average file size of 250KB per upload
    const totalKB = this.uploads.length * 250;
    
    if (totalKB < 1000) {
      return `${totalKB} KB`;
    } else {
      return `${(totalKB / 1024).toFixed(1)} MB`;
    }
  }

  // Toast notification methods
  showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessToast = true;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideSuccessToast();
    }, 5000);
  }

  hideSuccessToast(): void {
    this.showSuccessToast = false;
  }
}