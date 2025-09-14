import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

export interface Van {
  vanName: string;
  vanNumber: string;
  driverName: string;
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
    { vanName: 'Van 1', vanNumber: 'FN-CL-256', driverName: 'John Deo' },
    { vanName: 'Van 2', vanNumber: 'CK-CL-1111', driverName: 'Mark Wains' },
    { vanName: 'Van 3', vanNumber: 'AB-CL-789', driverName: 'Sarah Smith' },
    { vanName: 'Van 4', vanNumber: 'XY-CL-456', driverName: 'Mike Johnson' },
    { vanName: 'Van 5', vanNumber: 'CD-CL-321', driverName: 'Lisa Brown' },
  ];

  selectedVan: string = '';
  searchValue: string = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.dataSource.data = this.vans;
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
    // Add navigation or modal logic here
  }

  viewVan(van: Van) {
    console.log('View Van:', van);
    // Add navigation logic here
  }
}
