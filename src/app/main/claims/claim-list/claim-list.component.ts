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
      destinationId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPlants();
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
    this.loadDestinations();
  }

  generateClaimsReport(): void {
    if (this.filterForm.invalid) return;

    this.loading = true;
    const { startDate, endDate, destinationId } = this.filterForm.value;

    this.reportsService.getClaimsReport(startDate, endDate, destinationId).subscribe({
      next: (blob: Blob) => {
        // Download the Excel file
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `claims-report-${startDate}-to-${endDate}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);

        // Parse the Excel file and display its data
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);

          // Transform data to match the required format
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
}