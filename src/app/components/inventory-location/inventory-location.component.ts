import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
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
  dataSource = new MatTableDataSource<inventoryLocation>();

  private _paginator!: MatPaginator;
  private _sort!: MatSort;

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator) {
      this._paginator = paginator;
      this.dataSource.paginator = this._paginator;
    }
  }

  @ViewChild(MatSort) set sort(sort: MatSort) {
    if (sort) {
      this._sort = sort;
      this.dataSource.sort = this._sort;
    }
  }
  pageSizeOptions: number[] = [25, 50, 75, 100];

  inventoryLocation: inventoryLocation[] = [];
  filteredLocations: inventoryLocation[] = [];
  selectedCustomerName = '';
  selectedLocation = '';
  searchTerm = '';
  isLoading = false;

  constructor(
    private router: Router,
    private restockRequestService: RestockRequestService,
    private inventoryLocationService: InventoryLocationService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.isLoading = true;
    this.inventoryLocationService.getAllInventoryLocation().subscribe({
    next: (summary) => {
        this.inventoryLocation = summary?.map(loc => ({
          locationId: loc.locationId,
          location: loc.locationName || '-',
          customer: loc.customerName || '-',
          contactPerson: loc.contactPerson || '-',
          locationNumber: loc.locationNumber || '-'
        }));
        this.filteredLocations = [...this.inventoryLocation];
        this.dataSource.data = this.filteredLocations;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading restock request locations:', error);
        this.toastService.error('Error', 'Failed to load locations. Please try again.');
        this.isLoading = false;
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.inventoryLocation];

    // Apply customer name filter
    if (this.selectedCustomerName) {
      filtered = filtered.filter(location => 
        location.customer === this.selectedCustomerName
      );
    }

    // Apply location filter
    if (this.selectedLocation) {
      filtered = filtered.filter(location => 
        location.location === this.selectedLocation
      );
    }

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(location =>
        location.location.toLowerCase().includes(searchLower) ||
        location.customer.toLowerCase().includes(searchLower) ||
        location.contactPerson.toLowerCase().includes(searchLower) ||
        location.locationNumber.toLowerCase().includes(searchLower)
      );
    }

    this.filteredLocations = filtered;
    this.dataSource.data = this.filteredLocations;
    this.updatePagination();
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

  updatePagination() {
    const computedOptions = computePageSizeOptions(this.dataSource.data.length);
    this.pageSizeOptions = computedOptions.length ? computedOptions : [25];
  }
}

