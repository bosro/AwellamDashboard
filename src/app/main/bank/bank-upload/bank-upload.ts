// components/bank-uploads/bank-uploads.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BankService, Bank } from '../../../services/bank.service';
import { BankStatementService, BankUpload } from '../../../services/bank-statement.service';

@Component({
  selector: 'app-bank-uploads',
  templateUrl: './bank-upload.html',
//   styleUrls: ['./bank-uploads.component.scss']
})
export class BankUploadsComponent implements OnInit {
  bankId: string = '';
  bank?: Bank;
  uploads: BankUpload[] = [];
  loading = false;
  uploadingFile = false;
  error = '';
  selectedFile?: File;

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
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load uploads: ' + err.message;
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.error = 'Please select a file to upload';
      return;
    }

    this.uploadingFile = true;
    this.bankStatementService.uploadBankStatement(this.bankId, this.selectedFile).subscribe({
      next: () => {
        this.uploadingFile = false;
        this.selectedFile = undefined;
        this.loadUploads(); // Refresh the list after upload
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
        },
        error: (err) => {
          this.error = 'Failed to delete upload: ' + err.message;
        }
      });
    }
  }
}