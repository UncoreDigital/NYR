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

  selectedVan: string = '';
  searchValue: string = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.dataSource.data = this.inventoryLocation;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.searchValue = filterValue;
  }

  onVanFilterChange(value: string) {
    this.selectedVan = value;
    if (value === '') {
      this.dataSource.filter = '';
    } else {
      this.dataSource.filter = value.trim().toLowerCase();
    }
  }

  resetFilters() {
    this.selectedVan = '';
    this.searchValue = '';
    this.dataSource.filter = '';
  }

  transferToVan() {
    console.log('Transfer To Van clicked');
    this.router.navigate(['/tolocation']);
  }

  viewVan(inventoryLocation: inventoryLocation) {
    console.log('View Van:', inventoryLocation);
    // Add navigation logic here
  }
}

