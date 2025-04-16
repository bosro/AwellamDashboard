import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportsService } from '../../../services/reports.service';
import { Destination, DestinationService } from '../../../services/destination.service';
import { PlantService, Plant } from '../../../services/plant.service';
import * as XLSX from 'xlsx';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-claims-report',
  templateUrl: './claims-report.component.html',
})
export class ClaimsReportComponent implements OnInit {
  filterForm: FormGroup;
  loading = false;
  claimsData: any[] = [];
  filteredClaimsData: any[] = [];
  plants: Plant[] = [];
  selectedPlant: Plant | null = null;
  destinations: Destination[] = [];
  
  // Pagination properties
  currentPage = 1;
  pageSize = 25; // Set to 25 items per page
  totalItems = 0;
  totalPages = 1;

  // Summary data
  totalQuantity = 0;
  totalAmount = 0;
  getflNhil = 0;
  vat = 0;
  grandTotal = 0;

  constructor(
    private fb: FormBuilder,
    private reportsService: ReportsService,
    private destinationService: DestinationService,
    private plantService: PlantService
  ) {
    this.filterForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      destinationId: [''],
      plantId: ['', Validators.required],
      destinationName: [''],
      plantName: ['']
    });
  }

  ngOnInit(): void {
    this.loadPlants();

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const todayString = today.toISOString().split('T')[0];
    const tomorrowString = tomorrow.toISOString().split('T')[0];
    
    this.filterForm.patchValue({
      startDate: todayString,
      endDate: tomorrowString
    });

    // Listen to form value changes to trigger filtering
    this.filterForm.get('destinationName')?.valueChanges.subscribe(value => {
      this.applyFilters();
    });

    this.filterForm.get('plantName')?.valueChanges.subscribe(value => {
      this.applyFilters();
    });

    // Call getClaimsDetails after setting default values
    this.getClaimsDetails();
  }

  loadPlants(): void {
    this.loading = true;
    this.plantService.getPlants()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          this.plants = response.plants;
        },
        error: (error) => console.error('Error loading plants:', error)
      });
  }

  loadDestinations(): void {
    if (!this.selectedPlant || !this.selectedPlant._id) return;

    this.loading = true;
    this.destinationService.getDestinations(this.selectedPlant._id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (destinations) => {
          console.log('Destinations fetched:', destinations);
          if (destinations.length === 0) {
            console.log('No destinations found for this plant');
            this.destinations = [];
          } else {
            this.destinations = destinations;
          }
        },
        error: (error) => {
          console.error('Error loading destinations:', error);
          this.destinations = [];
        }
      });
  }

  onPlantSelect(event: any): void {
    const plantId = event.target.value;
    this.selectedPlant = this.plants.find(plant => plant._id === plantId) || null;
    
    // Update plantId and plantName in the form
    if (this.selectedPlant) {
      this.filterForm.patchValue({ 
        plantId: plantId,
        plantName: this.selectedPlant.name
      });
    }
    
    this.loadDestinations();
    this.applyFilters();
  }

  onDestinationSelect(event: any): void {
    const destinationId = event.target.value;
    const selectedDestination = this.destinations.find(dest => dest._id === destinationId);
    
    // Update destinationId and destinationName in the form
    if (selectedDestination) {
      this.filterForm.patchValue({ 
        destinationId: destinationId,
        destinationName: selectedDestination.destination
      });
    }
    
    this.applyFilters();
  }

  getClaimsDetails(): void {
    const { startDate, endDate, destinationId, plantId } = this.filterForm.value;
    this.loading = true;
    this.reportsService.getClaimsReportDetails(startDate, endDate, destinationId, plantId).subscribe({
      next: (response: any) => {
        console.log(response);
        this.claimsData = response.data.map((claim: any) => ({
          'DATE OF DISPATCH': this.formatDate(new Date(claim.date)),
          'DESTINATION': claim.destination,
          'DRIVER': claim.driver || 'N/A',
          'INVOICES/WAYBILL NO.': claim.socNumber,
          'QTY': claim.quantity,
          'RATE(100%)': claim.rate100,
          'RATE(95%)': claim.rate95,
          'AMOUNT': claim.amount,
        }));
        
        // Calculate summary data
        if (response.summary) {
          this.totalQuantity = response.summary.totalQuantity;
          this.totalAmount = response.summary.totalAmount;
          this.getflNhil = response.summary.getflNhil;
          this.vat = response.summary.vat;
          this.grandTotal = response.summary.grandTotal;
        } else {
          // Calculate summary manually if not provided by API
          this.calculateSummary(this.claimsData);
        }
        
        this.totalItems = this.claimsData.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        
        // Initialize filtered data with all data
        this.filteredClaimsData = [...this.claimsData];
        
        // Apply any existing filters
        this.applyFilters();
        
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching claims report details:', error);
        this.loading = false;
      }
    });
  }

  formatDate(date: Date): string {
    // Format date as DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  calculateSummary(data: any[]): void {
    this.totalQuantity = data.reduce((sum, item) => sum + item.QTY, 0);
    this.totalAmount = data.reduce((sum, item) => sum + item.AMOUNT, 0);
    this.getflNhil = this.totalAmount * 0.06; // 6% GETFL/NHIL
    this.vat = (this.totalAmount + this.getflNhil) * 0.15; // 15% VAT
    this.grandTotal = this.totalAmount + this.getflNhil + this.vat;
  }

  applyFilters(): void {
    const { destinationName, plantName } = this.filterForm.value;
    
    let filtered = [...this.claimsData];
    
    // Filter by destination if a value is provided
    if (destinationName && destinationName.trim() !== '') {
      filtered = filtered.filter(item => 
        item.DESTINATION.toLowerCase().includes(destinationName.toLowerCase())
      );
    }
    
    // Update the filtered data
    this.filteredClaimsData = filtered;
    
    // Recalculate summary for filtered data
    this.calculateSummary(this.filteredClaimsData);
    
    // Reset pagination
    this.currentPage = 1;
    this.totalItems = this.filteredClaimsData.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
  }

  generateClaimsReport(): void {
    if (this.filterForm.invalid) return;
  
    const { startDate, endDate, destinationId, plantId } = this.filterForm.value;
  
    // Add pagination (default page = 1)
    const page = 1;
  
    // Call the service with all required parameters
    this.reportsService.getClaimsReport(page, destinationId, plantId, startDate, endDate).subscribe({
      next: (blob: Blob) => {
        // Download the Excel file
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `claims-report-${startDate}-to-${endDate}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error generating claims report:', error);
      },
    });
  }

  exportFilteredData(): void {
    // Export currently filtered data to Excel with exact format
    if (this.filteredClaimsData.length === 0) {
      console.log('No data to export');
      return;
    }
    
    // Create a workbook with the filtered data in the specific format
    import('xlsx').then(XLSX => {
      // First create the data array with headers
      const headers = [
        ['DATE OF DISPATCH', 'DESTINATION', 'DRIVER', 'INVOICES/WAYBILL NO.', 'QTY', 'RATE(100%)', 'RATE(95%)', 'AMOUNT']
      ];
      
      // Add all the data rows
      const dataRows = this.filteredClaimsData.map(item => [
        item['DATE OF DISPATCH'],
        item.DESTINATION,
        item.DRIVER,
        item['INVOICES/WAYBILL NO.'],
        item.QTY,
        item['RATE(100%)'],
        item['RATE(95%)'],
        item.AMOUNT
      ]);
      
      // Add empty row before summary
      const emptyRow = ['', '', '', '', '', '', '', ''];
      
      // Add totals row
      const totalsRow = ['', '', '', '', this.totalQuantity, '', '', this.totalAmount];
      
      // Add summary rows
      const getflNhilRow = ['', '', 'GETFL/NHIL(6%)', '', '', '', '', this.getflNhil.toFixed(2)];
      const subtotalRow = ['', '', '', '', '', '', '', (this.totalAmount + this.getflNhil).toFixed(2)];
      const vatRow = ['', 'VAT(15%)', '', '', '', '', '', this.vat.toFixed(2)];
      const totalRow = ['', '', 'TOTAL', '', '', '', '', this.grandTotal.toFixed(2)];
      
      // Combine all rows
      const allData = [
        // Add company name as header
        ['AWELLAM COMPANY LIMITED'],
        [''],  // Empty row for spacing
        ...headers,
        ...dataRows,
        emptyRow,
        totalsRow,
        emptyRow,
        getflNhilRow,
        subtotalRow,
        vatRow,
        totalRow
      ];
      
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(allData);
      
      // Set column widths
      const wscols = [
        { wch: 15 },  // Date width
        { wch: 15 },  // Destination width
        { wch: 15 },  // Driver width
        { wch: 20 },  // Invoice/Waybill width
        { wch: 10 },  // Qty width
        { wch: 12 },  // Rate(100%) width
        { wch: 12 },  // Rate(95%) width
        { wch: 15 }   // Amount width
      ];
      ws['!cols'] = wscols;
      
      // Style the company name as a title (merge cells)
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }  // Merge first row across all columns
      ];
      
      // Create workbook and add worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Claims Report');
      
      // Generate Excel file
      const formattedDate = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `claims-report-${formattedDate}.xlsx`);
    }).catch(error => {
      console.error('Error importing XLSX library:', error);
    });
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  get paginatedData(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredClaimsData.slice(startIndex, endIndex);
  }
}