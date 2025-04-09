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
  plants: Plant[] = [];
  selectedPlant: Plant | null = null;
  destinations: Destination[] = [];
  filteredDestinations: Destination[] = [];

  constructor(
    private fb: FormBuilder,
    private reportsService: ReportsService,
    private destinationService: DestinationService,
    private plantService: PlantService
  ) {
    this.filterForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      destinationId: ['', Validators.required],
      plantId: ['', Validators.required]
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
          console.log('Destinations fetched:', destinations);  // Debugging
          if (destinations.length === 0) {
            console.log('No destinations found for this plant');
            this.destinations = [];  // Clear previous destinations
          } else {
            this.destinations = destinations;  // Assign directly
          }
        },
        error: (error) => {
          console.error('Error loading destinations:', error);
          this.destinations = [];  // Clear previous destinations on error
        }
      });
  }

  onPlantSelect(event: any): void {
    const plantId = event.target.value;
    this.selectedPlant = this.plants.find(plant => plant._id === plantId) || null;
    this.filterForm.patchValue({ plantId }); // Update plantId in the form
    this.loadDestinations();
  }

  getClaimsDetails(): void {
    const { startDate, endDate, destinationId, plantId } = this.filterForm.value;
    this.loading = true;
    this.reportsService.getClaimsReportDetails(startDate, endDate, destinationId, plantId).subscribe({
      next: (response: any) => {
        console.log(response);
        this.claimsData = response.data.map((claim: any) => ({
          'DATE OF DISPATCH': new Date(claim.date).toLocaleDateString(),
          DESTINATION: claim.destination,
          DRIVER: claim.driver || 'N/A', // Assuming driver data might be missing
          'INVOICE/WAYBILL NO.': claim.socNumber,
          QTY: claim.quantity,
          'RATE (100%)': claim.rate100,
          'RATE (95%)': claim.rate95,
          AMOUNT: claim.amount,
        }));
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching claims report details:', error);
        this.loading = false;
      }
    });
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
}