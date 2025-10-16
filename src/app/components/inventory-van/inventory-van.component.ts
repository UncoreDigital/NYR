import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

export interface Van {
  vanName: string;
  vanNumber: string;
  driverName: string;
  id: number;
}

@Component({
  selector: 'app-inventory-van',
  templateUrl: './inventory-van.component.html',
  styleUrl: './inventory-van.component.css'
})
export class InventoryVanComponent implements OnInit {
  displayedColumns: string[] = ['vanName', 'vanNumber', 'driverName', 'actions'];
  dataSource = new MatTableDataSource<Van>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  vans: Van[] = [
    { vanName: 'Van 1', vanNumber: 'FN-CL-256', driverName: 'John Deo', id: 1 },
    { vanName: 'Van 2', vanNumber: 'CK-CL-1111', driverName: 'Mark Wains', id: 2 },
    { vanName: 'Van 3', vanNumber: 'AB-CL-789', driverName: 'Sarah Smith', id: 3 },
    { vanName: 'Van 4', vanNumber: 'XY-CL-456', driverName: 'Mike Johnson', id: 4 },
    { vanName: 'Van 5', vanNumber: 'CD-CL-321', driverName: 'Lisa Brown', id: 5 },
  ];

  filteredVans: Van[] = [];
  selectedVanName = '';
  searchTerm = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.filteredVans = [...this.vans];
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
    let filtered = [...this.vans];

    // Apply van name filter
    if (this.selectedVanName) {
      filtered = filtered.filter(van => 
        van.vanName === this.selectedVanName
      );
    }

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(van =>
        van.vanName.toLowerCase().includes(searchLower) ||
        van.vanNumber.toLowerCase().includes(searchLower) ||
        van.driverName.toLowerCase().includes(searchLower)
      );
    }

    this.filteredVans = filtered;
    this.dataSource.data = this.filteredVans;
  }

  onVanNameFilterChange() {
    this.applyFilters();
  }

  getUniqueVanNames(): string[] {
    return [...new Set(this.vans.map(van => van.vanName))].sort();
  }

  resetFilters() {
    this.selectedVanName = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  transferToVan() {
    console.log('Transfer To Van clicked');
    this.router.navigate(['/tovan']);
  }

  viewVan(van: Van) {
    console.log('View Van:', van);
    // Add navigation logic here
     this.router.navigate(['/inventory-detail'], {
      queryParams: {
        context: 'van',
        title: van.vanName || 'Van Details',
        id: van.id
      }
    });
  }
}
