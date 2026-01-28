import { Component, OnInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { RestockRequestService } from '../../services/restock-request.service';
import { ToastService } from '../../services/toast.service';
import { computePageSizeOptions } from 'src/app/utils/paginator-utils';
import { InventoryLocationService } from 'src/app/services/inventoryLocation.service';

export interface inventoryLocation {
  locationId: number;
  location: string;
  customer: string;
  contactPerson: string;
  locationNumber: string;
}

@Component({
  selector: 'app-inventory-location',
  templateUrl: './inventory-location.component.html',
  styleUrl: './inventory-location.component.css'
})
export class InventoryLocationComponent implements OnInit {
  displayedColumns: string[] = ['location', 'customer', 'contactPerson', 'locationNumber', 'actions'];
  locations: inventoryLocation[] = [];

  inventoryLocation: inventoryLocation[] = [];
  selectedCustomerName = '';
  selectedLocation = '';
  searchTerm = '';
  isLoading = false;

  // Pagination state
  pageSizeOptions: number[] = [25, 50, 75, 100];
  pageIndex: number = 0;
  pageSize: number = 25;
  totalCount: number = 0;
  sortBy: string = 'location';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Debounce subject for search
  private searchSubject = new Subject<string>();

  constructor(
    private router: Router,
    private restockRequestService: RestockRequestService,
    private inventoryLocationService: InventoryLocationService,
    private toastService: ToastService
  ) {
    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.pageIndex = 0;
      this.loadLocations();
    });
  }

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.isLoading = true;
    const searchParts: string[] = [];
    if (this.selectedCustomerName) {
      searchParts.push(this.selectedCustomerName);
    }
    if (this.selectedLocation) {
      searchParts.push(this.selectedLocation);
    }
    if (this.searchTerm) {
      searchParts.push(this.searchTerm);
    }
    const search = searchParts.join(' ');

    const params = {
      pageNumber: this.pageIndex + 1, // Backend uses 1-based indexing
      pageSize: this.pageSize,
      sortBy: this.mapColumnToSortField(this.sortBy),
      sortOrder: this.sortOrder,
      search: search || undefined
    };

    this.inventoryLocationService.getAllgroupedByLocationPaged(params).subscribe({
      next: (result) => {
        this.inventoryLocation = result.data?.map((loc: any) => ({
          locationId: loc.locationId,
          location: loc.locationName || '-',
          customer: loc.customerName || '-',
          contactPerson: loc.contactPerson || '-',
          locationNumber: loc.locationNumber || '-'
        })) ?? [];
        this.locations = [...this.inventoryLocation];
        this.totalCount = result.totalCount;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading restock request locations:', error);
        this.toastService.error('Error', 'Failed to load locations. Please try again.');
        this.isLoading = false;
      }
    });
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value.trim());
  }

  applyFilters() {
    this.pageIndex = 0;
    this.loadLocations();
  }

  onCustomerNameFilterChange() {
    this.applyFilters();
  }

  onLocationFilterChange() {
    this.applyFilters();
  }

  getUniqueCustomerNames(): string[] {
    return [...new Set(this.inventoryLocation.map(location => location.customer))].sort();
  }

  getUniqueLocations(): string[] {
    return [...new Set(this.inventoryLocation.map(location => location.location))].sort();
  }

  resetFilters() {
    this.selectedCustomerName = '';
    this.selectedLocation = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  transferToVan() {
    console.log('Transfer To Van clicked');
    this.router.navigate(['/tolocation']);
  }

  viewLocation(location: inventoryLocation): void {
    this.router.navigate(['/inventory-detail'], {
      queryParams: {
        context: 'location',
        title: location.location || 'Location Details',
        id: location.locationId
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadLocations();
  }

  onSortChange(column: string) {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.pageIndex = 0;
    this.loadLocations();
  }

  private mapColumnToSortField(column: string): string {
    const columnMap: { [key: string]: string } = {
      location: 'locationName',
      customer: 'customerName',
      contactPerson: 'contactPerson',
      locationNumber: 'locationNumber'
    };
    return columnMap[column] || 'locationName';
  }
}

