import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface Plant {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  costprice: number;
  inStock: boolean;
  totalStock: number;
  plantId: string;
}

interface Destination {
  _id: string;
  destination: string;
  rates: number;
  cost: number;
  plantId: string;
}

interface SOC {
  _id: string;
  socNumber: string;
  quantity: number;
  totalquantity?: number;
  plantId: Plant | null;
  productId: Product | null;
  destinationId?: Destination | null;
  status: string;
  price?: number | null;
  borrowedOrder: boolean;
  createdAt: string;
  updatedAt: string;
  assignedTruck?: any;
}

interface ApiResponse {
  message: string;
  plants?: Plant[];
  destinations?: Destination[];
  socNumbers?: SOC[];
  [key: string]: any;
}

@Component({
  selector: 'app-soc-table',
  templateUrl: './ActiveSoc.list.html'
})
export class SocTableComponent implements OnInit {
  socList: SOC[] = [];
  filteredSocList: SOC[] = [];
  plants: Plant[] = [];
  products: Product[] = [];
  destinations: Destination[] = [];
  
  selectedPlant: string = '';
  selectedProduct: string = '';
  selectedDestination: string = '';
  searchControl = new FormControl('');
  loading = false;
  error: string | null = null;
  
  // Pagination properties
  pageSize: number = 10;
  currentPage: number = 1;
  totalItems: number = 0;
  totalPages: number = 0;
    Math = Math;
  // Modal properties
  showModal: boolean = false;
  selectedSoc: SOC | null = null;
  
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getPlants();
    this.fetchSOCs();
    
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.currentPage = 1; // Reset to first page on new search
      this.filterSOCs();
    });
  }

  fetchSOCs(): void {
    this.loading = true;
    this.error = null;
    
    this.http.get<ApiResponse>(`${this.apiUrl}/soc/get`).subscribe({
      next: (response) => {
        // Filter only active SOCs
        if (response.socNumbers) {
          this.socList = response.socNumbers.filter(soc => soc.status === 'active');
          this.filteredSocList = [...this.socList];
          this.updatePagination();
          this.extractPlantAndProducts();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load SOC data. Please try again later.';
        console.error('Error fetching SOC data:', err);
        this.loading = false;
      }
    });
  }

  getPlants(): void {
    this.loading = true;
    this.http.get<ApiResponse>(`${this.apiUrl}/plants/get`).subscribe({
      next: (response) => {
        if (response.plants) {
          this.plants = response.plants;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading plants:', error);
        this.loading = false;
        this.error = 'Failed to load plants. Please try again later.';
      },
    });
  }

  getDestinations(plantId: string): void {
    if (!plantId) {
      this.destinations = [];
      return;
    }
    
    this.http.get<ApiResponse>(`${this.apiUrl}/destination/${plantId}/get`).subscribe({
      next: (response) => {
        if (response.destinations) {
          this.destinations = response.destinations;
        } else {
          this.destinations = [];
        }
        this.selectedDestination = ''; // Reset destination selection when plant changes
      },
      error: (error) => {
        console.error('Error loading destinations:', error);
        this.error = 'Failed to load destinations. Please try again later.';
      },
    });
  }

  getProducts(plantId: string): void {
    if (!plantId) {
      // Get all products or filter from existing socList
      this.extractPlantAndProducts();
      return;
    }
    
    // Filter products by plant ID from existing SOC list
    const plantProducts = this.socList
      .filter(soc => soc.plantId && soc.plantId._id === plantId && soc.productId)
      .map(soc => soc.productId as Product);
    
    // Create unique products Map
    const uniqueProducts = new Map<string, Product>();
    plantProducts.forEach(product => {
      if (product && !uniqueProducts.has(product._id)) {
        uniqueProducts.set(product._id, product);
      }
    });
    
    this.products = Array.from(uniqueProducts.values());
    this.selectedProduct = ''; // Reset product selection when plant changes
  }

  extractPlantAndProducts(): void {
    // Extract unique plants
    const uniquePlants = new Map<string, Plant>();
    
    // Extract unique products
    const uniqueProducts = new Map<string, Product>();
    
    this.socList.forEach(soc => {
      if (soc.plantId && !uniquePlants.has(soc.plantId._id)) {
        uniquePlants.set(soc.plantId._id, soc.plantId);
      }
      
      if (soc.productId && !uniqueProducts.has(soc.productId._id)) {
        uniqueProducts.set(soc.productId._id, soc.productId);
      }
    });
    
    // Only update plants if not already loaded from API
    if (this.plants.length === 0) {
      this.plants = Array.from(uniquePlants.values());
    }
    
    this.products = Array.from(uniqueProducts.values());
  }
  
  filterSOCs(): void {
    let filtered = this.socList;
    
    // Filter by plant if selected
    if (this.selectedPlant) {
      filtered = filtered.filter(soc => soc.plantId && soc.plantId._id === this.selectedPlant);
    }
    
    // Filter by product if selected
    if (this.selectedProduct) {
      filtered = filtered.filter(soc => soc.productId && soc.productId._id === this.selectedProduct);
    }
    
    // Filter by destination if selected
    if (this.selectedDestination) {
      filtered = filtered.filter(soc => 
        soc.destinationId && soc.destinationId._id === this.selectedDestination
      );
    }
    
    // Filter by search term (SOC number)
    const searchTerm = this.searchControl.value?.toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(soc => 
        soc.socNumber.toLowerCase().includes(searchTerm)
      );
    }
    
    this.filteredSocList = filtered;
    this.updatePagination();
  }
  
  updatePagination(): void {
    this.totalItems = this.filteredSocList.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    
    // Ensure current page is valid
    if (this.currentPage < 1) {
      this.currentPage = 1;
    } else if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }
  
  getCurrentPageItems(): SOC[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalItems);
    return this.filteredSocList.slice(startIndex, endIndex);
  }
  
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
  onPlantChange(): void {
    this.getDestinations(this.selectedPlant);
    this.getProducts(this.selectedPlant);
    this.currentPage = 1; // Reset to first page
    this.filterSOCs();
  }
  
  onProductChange(): void {
    this.currentPage = 1; // Reset to first page
    this.filterSOCs();
  }
  
  onDestinationChange(): void {
    this.currentPage = 1; // Reset to first page
    this.filterSOCs();
  }
  
  clearFilters(): void {
    this.selectedPlant = '';
    this.selectedProduct = '';
    this.selectedDestination = '';
    this.searchControl.setValue('');
    this.destinations = [];
    this.filteredSocList = [...this.socList];
    this.currentPage = 1; // Reset to first page
    this.updatePagination();
  }
  
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
  
  // Modal methods
  openModal(soc: SOC): void {
    this.selectedSoc = soc;
    this.showModal = true;
  }
  
  closeModal(): void {
    this.showModal = false;
    this.selectedSoc = null;
  }
  
  // Get page numbers for pagination display
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      // Show all pages if there are few
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show limited pages with current page in the middle if possible
      let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;
      
      if (endPage > this.totalPages) {
        endPage = this.totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
}