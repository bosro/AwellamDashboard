import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

// =====================================================
// ENUMS AND CONSTANTS
// =====================================================

export enum DepositStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum TruckStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  RETIRED = 'retired'
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  GHS = 'GHS'
}

export const FILE_UPLOAD_CONSTANTS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif']
} as const;

// =====================================================
// CORE INTERFACES
// =====================================================

export interface ReceivingIncome {
  _id?: string;
  customer: string;
  admin: string;
  amount: number;
  reference: string;
  truckId?: string;
  amountBefore: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DepositReceipt {
  _id?: string;
  admin: {
    _id: string;
    fullName: string;
    email: string;
  };
  amount: number;
  receiptUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  amountBeforeDeposit: number;
  amountAfterDeposit: number;
  approvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AccumulatedIncome {
  _id?: string;
  admin: string;
  totalAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Truck {
  _id: string;
  truckNumber: string;
  driverName: string;
  plateNumber: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// =====================================================
// API RESPONSE INTERFACES
// =====================================================

export interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IncomeResponse {
  message: string;
  income: ReceivingIncome;
  accumulated: AccumulatedIncome;
}

export interface ReceiptResponse {
  message: string;
  receipt: DepositReceipt;
}

export interface AccumulatedResponse {
  message: string;
  accumulated: AccumulatedIncome;
}

export interface BulkOperationResponse {
  message: string;
  processed: number;
  failed: number;
  errors?: string[];
}

// =====================================================
// STATISTICS INTERFACES
// =====================================================

export interface DepositStatistics {
  totalDeposits: number;
  totalAmount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  pendingAmount: number;
  approvedAmount: number;
  rejectedAmount: number;
}

export interface IncomeStatistics {
  totalIncome: number;
  totalRecords: number;
  averageAmount: number;
  todayIncome: number;
  monthlyIncome: number;
}

export interface AdminStatistics {
  totalIncome: number;
  totalDeposits: number;
  currentBalance: number;
  lastDepositDate: Date;
}

export interface StatsResponse<T> {
  stats: T;
}

// =====================================================
// SEARCH AND FILTER INTERFACES
// =====================================================

export interface DepositSearchCriteria {
  adminId?: string;
  status?: DepositStatus | string;
  amountMin?: number;
  amountMax?: number;
  startDate?: string;
  endDate?: string;
}

export interface IncomeSearchCriteria {
  adminId?: string;
  customer?: string;
  truckId?: string;
  amountMin?: number;
  amountMax?: number;
  startDate?: string;
  endDate?: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

// =====================================================
// FILE HANDLING INTERFACES
// =====================================================

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface UploadProgress {
  percentage: number;
  loaded: number;
  total: number;
}

export interface FileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  validateBeforeUpload?: boolean;
}

// =====================================================
// FORM DATA INTERFACES
// =====================================================

export interface IncomeFormData {
  customer: string;
  amount: number;
  reference: string;
  truckId?: string;
}

export interface DepositFormData {
  amount: number;
  image: string | File;
}

export interface EditReceiptFormData {
  amount?: number;
  status?: DepositStatus | string;
}

export interface EditAccumulatedFormData {
  totalAmount: number;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type SortOrder = 'asc' | 'desc';

export type SortableFields = keyof ReceivingIncome | keyof DepositReceipt | keyof AccumulatedIncome;

export interface SortOptions {
  field: SortableFields;
  order: SortOrder;
}

export interface FilterOptions {
  status?: string[];
  dateRange?: DateRange;
  amountRange?: { min: number; max: number };
}

// =====================================================
// COLLECTION RESPONSE INTERFACES
// =====================================================

export interface ReceiptsCollection {
  receipts: DepositReceipt[];
}

export interface IncomesCollection {
  incomes: ReceivingIncome[];
}

export interface AccumulatedCollection {
  accumulated: AccumulatedIncome[];
}

export interface TrucksCollection {
  trucks: Truck[];
}

// =====================================================
// IMPORT/EXPORT INTERFACES
// =====================================================

export interface CSVImportResult {
  message: string;
  imported: number;
  failed: number;
  errors: string[];
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  filename: string;
  includeHeaders: boolean;
  dateRange?: DateRange;
}

@Injectable({
  providedIn: 'root'
})
export class DepositService {
  private apiUrl = `${environment.apiUrl}/transport-income`;

  constructor(private http: HttpClient) {}

  // =====================================================
  // EXISTING METHODS (UNCHANGED)
  // =====================================================

  // Record income from customer
  recordIncome(incomeData: {
    customer: string;
    amount: number;
    reference: string;
    truckId?: string;
  }): Observable<{
    message: string;
    income: ReceivingIncome;
    accumulated: AccumulatedIncome;
  }> {
    return this.http.post<any>(`${this.apiUrl}/income`, incomeData);
  }

  // Upload deposit receipt
  uploadDepositReceipt(formData: FormData): Observable<{
    message: string;
    receipt: DepositReceipt;
  }> {
    return this.http.post<any>(`${this.apiUrl}/deposit`, formData);
  }

  // Upload deposit receipt with base64 image
  uploadDepositReceiptBase64(receiptData: {
    amount: number;
    image: string;
  }): Observable<{
    message: string;
    receipt: DepositReceipt;
  }> {
    return this.http.post<any>(`${this.apiUrl}/deposit`, receiptData);
  }

  // Approve/reject deposit receipt
  approveDepositReceipt(id: string, status: 'approved' | 'rejected'): Observable<{
    message: string;
    receipt: DepositReceipt;
  }> {
    return this.http.patch<any>(`${this.apiUrl}/deposit/${id}/approve`, { status });
  }

  // Get all deposit receipts (super admin)
  getAllDepositReceipts(): Observable<{
    receipts: DepositReceipt[];
  }> {
    return this.http.get<any>(`${this.apiUrl}/deposit/all`);
  }

  // Get deposit receipts by admin
  getDepositReceiptsByAdmin(adminId: string): Observable<{
    receipts: DepositReceipt[];
  }> {
    return this.http.get<any>(`${this.apiUrl}/deposit/admin/${adminId}`);
  }

  // Helper method to convert file to base64
  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // =====================================================
  // NEW METHODS - DEPOSIT RECEIPT MANAGEMENT
  // =====================================================

  // Edit a deposit receipt
  editDepositReceipt(id: string, receiptData: {
    amount?: number;
    status?: string;
  }): Observable<{
    message: string;
    receipt: DepositReceipt;
  }> {
    return this.http.put<any>(`${this.apiUrl}/deposit/${id}`, receiptData);
  }

  // Delete a deposit receipt
  deleteDepositReceipt(id: string): Observable<{
    message: string;
  }> {
    return this.http.delete<any>(`${this.apiUrl}/deposit/${id}`);
  }

  // Get deposit receipts (by admin from token)
  getDepositReceipts(): Observable<{
    receipts: DepositReceipt[];
  }> {
    return this.http.get<any>(`${this.apiUrl}/deposit/get`);
  }

  // Get single deposit receipt by ID
  getDepositReceiptById(id: string): Observable<{
    receipt: DepositReceipt;
  }> {
    return this.http.get<any>(`${this.apiUrl}/deposit/${id}`);
  }

  // =====================================================
  // NEW METHODS - ACCUMULATED INCOME MANAGEMENT
  // =====================================================

  // Edit accumulated income
  editAccumulatedIncome(id: string, incomeData: {
    totalAmount: number;
  }): Observable<{
    message: string;
    accumulated: AccumulatedIncome;
  }> {
    return this.http.put<any>(`${this.apiUrl}/accumulated/${id}`, incomeData);
  }

  // Delete accumulated income
  deleteAccumulatedIncome(id: string): Observable<{
    message: string;
  }> {
    return this.http.delete<any>(`${this.apiUrl}/accumulated/${id}`);
  }

  // Get accumulated income (by admin from token or all)
  getAccumulatedIncome(): Observable<{
    accumulated: AccumulatedIncome[];
  }> {
    return this.http.get<any>(`${this.apiUrl}/accumulated`);
  }

  // Get accumulated income by admin ID
  getAccumulatedIncomeByAdmin(adminId: string): Observable<{
    accumulated: AccumulatedIncome;
  }> {
    return this.http.get<any>(`${this.apiUrl}/accumulated/admin/${adminId}`);
  }

  // Create accumulated income record
  createAccumulatedIncome(incomeData: {
    admin: string;
    totalAmount: number;
  }): Observable<{
    message: string;
    accumulated: AccumulatedIncome;
  }> {
    return this.http.post<any>(`${this.apiUrl}/accumulated`, incomeData);
  }

  // Reset accumulated income for admin
  resetAccumulatedIncome(adminId: string): Observable<{
    message: string;
    accumulated: AccumulatedIncome;
  }> {
    return this.http.patch<any>(`${this.apiUrl}/accumulated/reset/${adminId}`, {});
  }

  // =====================================================
  // NEW METHODS - INCOME RECORDS MANAGEMENT
  // =====================================================

  // Get all receiving income records
  getAllIncomeRecords(): Observable<{
    incomes: ReceivingIncome[];
  }> {
    return this.http.get<any>(`${this.apiUrl}/income/all`);
  }

  // Get income records by admin
  getIncomeByAdmin(adminId: string): Observable<{
    incomes: ReceivingIncome[];
  }> {
    return this.http.get<any>(`${this.apiUrl}/income/admin/${adminId}`);
  }

  // Edit income record
  editIncomeRecord(id: string, incomeData: {
    customer?: string;
    amount?: number;
    reference?: string;
    truckId?: string;
  }): Observable<{
    message: string;
    income: ReceivingIncome;
  }> {
    return this.http.put<any>(`${this.apiUrl}/income/${id}`, incomeData);
  }

  // Delete income record
  deleteIncomeRecord(id: string): Observable<{
    message: string;
  }> {
    return this.http.delete<any>(`${this.apiUrl}/income/${id}`);
  }

  // =====================================================
  // NEW METHODS - STATISTICS AND REPORTS
  // =====================================================

  // Get deposit statistics
  getDepositStats(): Observable<{
    stats: DepositStatistics;
  }> {
    return this.http.get<any>(`${this.apiUrl}/stats/deposits`);
  }

  // Get income statistics
  getIncomeStats(): Observable<{
    stats: IncomeStatistics;
  }> {
    return this.http.get<any>(`${this.apiUrl}/stats/income`);
  }

  // Get admin-specific statistics
  getAdminStats(adminId: string): Observable<{
    stats: AdminStatistics;
  }> {
    return this.http.get<any>(`${this.apiUrl}/stats/admin/${adminId}`);
  }

  // Get deposits by date range
  getDepositsByDateRange(startDate: string, endDate: string): Observable<{
    receipts: DepositReceipt[];
  }> {
    return this.http.get<any>(`${this.apiUrl}/deposit/range`, {
      params: { startDate, endDate }
    });
  }

  // Get income by date range
  getIncomeByDateRange(startDate: string, endDate: string): Observable<{
    incomes: ReceivingIncome[];
  }> {
    return this.http.get<any>(`${this.apiUrl}/income/range`, {
      params: { startDate, endDate }
    });
  }

  // =====================================================
  // NEW METHODS - SEARCH AND FILTER
  // =====================================================

  // Search deposits by multiple criteria
  searchDeposits(criteria: DepositSearchCriteria): Observable<{
    receipts: DepositReceipt[];
  }> {
    return this.http.post<any>(`${this.apiUrl}/deposit/search`, criteria);
  }

  // Search income records by criteria
  searchIncome(criteria: IncomeSearchCriteria): Observable<{
    incomes: ReceivingIncome[];
  }> {
    return this.http.post<any>(`${this.apiUrl}/income/search`, criteria);
  }

  // =====================================================
  // NEW METHODS - BULK OPERATIONS
  // =====================================================

  // Bulk approve/reject receipts
  bulkApproveReceipts(receiptIds: string[], status: 'approved' | 'rejected'): Observable<{
    message: string;
    processed: number;
    failed: number;
  }> {
    return this.http.patch<any>(`${this.apiUrl}/deposit/bulk-approve`, {
      receiptIds,
      status
    });
  }

  // Bulk delete receipts
  bulkDeleteReceipts(receiptIds: string[]): Observable<{
    message: string;
    deleted: number;
    failed: number;
  }> {
    return this.http.delete<any>(`${this.apiUrl}/deposit/bulk-delete`, {
      body: { receiptIds }
    });
  }

  // Import income records from CSV
  importIncomeFromCSV(file: File): Observable<{
    message: string;
    imported: number;
    failed: number;
    errors: string[];
  }> {
    const formData = new FormData();
    formData.append('csvFile', file);
    return this.http.post<any>(`${this.apiUrl}/income/import`, formData);
  }

  // =====================================================
  // NEW UTILITY METHODS
  // =====================================================


  // Format currency for display
  formatCurrency(amount: number, currency: Currency | string = Currency.USD): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Calculate percentage change
  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  // Export data to CSV (download direct file, not Blob URL)
  exportToCSV(data: any[], filename: string, options?: ExportOptions): void {
    if (!data || !data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      options?.includeHeaders !== false ? headers.join(',') : null,
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].filter(Boolean).join('\n');

    // Create a direct file and trigger download
    const blob = new File([csvContent], `${options?.filename || filename}.${options?.format || 'csv'}`, { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${options?.filename || filename}.${options?.format || 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  // Generate unique reference number
  generateReference(prefix: string = 'REF'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}-${timestamp}-${random}`;
  }

  // Format date for API
  formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Parse API date
  parseAPIDate(dateString: string): Date {
    return new Date(dateString);
  }

  // Check if receipt is editable
  isReceiptEditable(receipt: DepositReceipt): boolean {
    return receipt.status === 'pending';
  }

  // Calculate total amount from receipts
  calculateTotalAmount(receipts: DepositReceipt[]): number {
    return receipts.reduce((total, receipt) => total + receipt.amount, 0);
  }

  // Get receipts by status
  filterReceiptsByStatus(receipts: DepositReceipt[], status: string): DepositReceipt[] {
    return receipts.filter(receipt => receipt.status === status);
  }

  // Sort receipts by date
  sortReceiptsByDate(receipts: DepositReceipt[], order: SortOrder = 'desc'): DepositReceipt[] {
    return receipts.sort((a, b) => {
      const dateA = new Date(a.createdAt!).getTime();
      const dateB = new Date(b.createdAt!).getTime();
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }
}