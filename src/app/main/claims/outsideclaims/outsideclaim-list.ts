import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportsService } from '../../../services/reports.service';
import { Destination, DestinationService } from '../../../services/destination.service';
import { PlantService, Plant } from '../../../services/plant.service';
import * as XLSX from 'xlsx';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-claims-report',
  templateUrl: './outsideclaim-list.html',
})
export class OutsideClaimsReportComponent implements OnInit {
  filterForm: FormGroup;
  loading = false;
  claimsData: any[] = [];
  plants: Plant[] = [];
  selectedPlant: Plant | null = null;
  destinations: Destination[] = [];
  filteredDestinations: Destination[] = [];
  currentPage = 1;
  pageSize = 15;
  totalItems = 0;
  Math = Math;

  constructor(
    private fb: FormBuilder,
    private reportsService: ReportsService,
    private destinationService: DestinationService,
    private plantService: PlantService
  ) {
    this.filterForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      // destinationId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const todayString = today.toISOString().split('T')[0];
    const tomorrowString = tomorrow.toISOString().split('T')[0];
    
    this.filterForm.patchValue({
      startDate: todayString,
      endDate: tomorrowString
    });
    this.loadPlants();
    this.getOutSideLOadDetails();
  }

  getOutSideLOadDetails(): void {
    const { startDate, endDate } = this.filterForm.value;
    this.loading = true;
    this.reportsService.getOutsideLoadclaimDetails(startDate, endDate).subscribe({
      next: (data: any) => {
        this.claimsData = data.orders.map((order: any) => ({
          date: order.date,
          customerName: order.customerName,
          truckNumber: order.truckNumber,
          product: order.product,
          driver: order.driver,
          loadedBags: order.loadedBags,
          outsideSoc: order.outsideSoc,
          plant: order.plant,
          amount: order.amount,
          destination: order.destination
        }));

        console.log(data)
        this.totalItems = this.claimsData.length;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching claims report details:', error);
        this.loading = false;
      }
    });
  }

  generateOutsideReport(): void {
    const { startDate, endDate } = this.filterForm.value;
    this.loading = true;
    this.reportsService.getOutsideLoadclaimReport(startDate, endDate).subscribe({
      next: (blob: Blob) => {
        // Download the Excel file
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `outsideload-claims-report-${startDate}-to-${endDate}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.loading = false;
      },
      error: (error) => {
        console.error('Error generating claims report:', error);
        this.loading = false;
      },
    });
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
          if (destinations.length === 0) {
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
    this.loadDestinations();
  }

  generateClaimsReport(): void {
    if (this.filterForm.invalid) return;

    this.loading = true;
    const { startDate, endDate, destinationId } = this.filterForm.value;

    const destination = this.destinations.find(dest => dest._id === destinationId);
    const location = destination ? destination.destination : '';
    const plant = this.selectedPlant ? this.selectedPlant.name : '';

    const page = 1;

    this.reportsService.getClaimsReport(page, location, plant, startDate, endDate).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `claims-report-${startDate}-to-${endDate}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);

          this.claimsData = json.map((claim: any) => ({
            DATE: new Date(claim.date).toLocaleDateString(),
            DRIVER: claim.driver,
            CATEGORY: claim.category,
            DESTINATION: claim.destination,
            SOC: claim.soc,
            QTY: claim.quantity,
            RATE: claim.rate,
            'AMOUNT (100%)': claim.amount100,
            'AMOUNT (95%)': claim.amount95,
          }));
        };
        reader.readAsArrayBuffer(blob);

        this.loading = false;
      },
      error: (error) => {
        console.error('Error generating claims report:', error);
        this.loading = false;
      },
    });
  }

  get paginatedClaimsData(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.claimsData.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }
}