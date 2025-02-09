import { Component, OnInit } from '@angular/core';
import { DestinationService, Destination } from '../../../services/destination.service';
import { PlantService, Plant } from '../../../services/plant.service';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-destination-list',
  templateUrl: './destination.list.html',
//   styleUrls: ['./destination-list.component.css']
})
export class DestinationListComponent implements OnInit {
  plants: Plant[] = [];
  selectedPlant: string = '';
  destinations: Destination[] = [];
  filteredDestinations: Destination[] = [];
  loading: boolean = false;

  constructor(private destinationService: DestinationService, private plantService: PlantService, private router:Router) {}

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
    if (!this.selectedPlant) return;
  
    this.loading = true;
    this.destinationService.getDestinations(this.selectedPlant)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (destinations) => {
        //   console.log('Destinations fetched:', destinations);  // Debugging
          if (destinations.length === 0) {
            // console.log('No destinations found for this plant');
            this.destinations = [];  // Clear previous destinations
          } else {
            this.destinations = destinations;  // Assign directly
          }
          this.filterData();  // Filter the data if needed
        },
        error: (error) => {
          console.error('Error loading destinations:', error);
          this.destinations = [];  // Clear previous destinations on error
        }
      });
  }

  editDestination(destinationId: string): void {
    this.router.navigate([`/main/products/destination/edit/${destinationId}`]);
  }


  deleteDestination(destinationId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.destinationService.deleteDestination(destinationId).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'The destination has been deleted.', 'success');
            this.loadDestinations();
          },
          error: (error) => {
            console.error('Error deleting destination:', error);
            Swal.fire('Error!', 'Failed to delete the destination.', 'error');
          }
        });
      }
    });
  }
  

  filterData(): void {
    if (this.destinations.length === 0) {
      this.filteredDestinations = [];
      console.log('No destinations found.'); // Debugging
      // Optionally, you can update the UI to show a message indicating no destinations were found
    } else {
      this.filteredDestinations = this.destinations;
      console.log('Filtered Destinations:', this.filteredDestinations); // Debugging
    }
  }
  
}
