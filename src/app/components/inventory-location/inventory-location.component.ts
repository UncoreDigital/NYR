import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

export interface inventoryLocation {
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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  inventoryLocation: inventoryLocation[] = [
    {
      location: 'New York Warehouse',
      customer: 'ABC Supplies Ltd.',
      contactPerson: 'John Doe',
      locationNumber: 'LOC-1001'
    },
    {
      location: 'Los Angeles Depot',
      customer: 'XYZ Traders Inc.',
      contactPerson: 'Jane Smith',
      locationNumber: 'LOC-2002'
    },
    {
      location: 'Chicago Distribution Center',
      customer: 'FreshMart',
      contactPerson: 'Michael Johnson',
      locationNumber: 'LOC-3003'
    }
  ];

  filteredLocations: inventoryLocation[] = [];
  selectedCustomerName = '';
  selectedLocation = '';
  searchTerm = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.filteredLocations = [...this.inventoryLocation];
    this.applyFilters();
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

  viewLocation(location: any): void {
    this.router.navigate(['/inventory-detail'], {
      queryParams: {
        context: 'location',
        title: location.location || 'Location Details',
        id: location.id
      }
    });
  }
}

