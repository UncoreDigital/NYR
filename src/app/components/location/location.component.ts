import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';

export interface Location {
  locationName: string;
  customerName: string;
  contactPerson: string;
  phoneNumber: string;
  locationAddress: string;
}
@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrl: './location.component.css'
})

export class LocationComponent implements OnInit{
  displayedColumns: string[] = ['locationName', 'customerName', 'contactPerson', 'phoneNumber', 'locationAddress'];
  dataSource = new MatTableDataSource<Location>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  locations: Location[] = [
    { locationName: 'New York', customerName: 'Greenway Medical', contactPerson: 'John Deo', phoneNumber: '123456789', locationAddress: "230 Hilltop Blvd, New York" },
    { locationName: 'New York', customerName: 'Greenway Medical', contactPerson: 'John Deo', phoneNumber: '123456789', locationAddress: "230 Hilltop Blvd, New York" },
    { locationName: 'New York', customerName: 'Greenway Medical', contactPerson: 'John Deo', phoneNumber: '123456789', locationAddress: "230 Hilltop Blvd, New York" },
    { locationName: 'New York', customerName: 'Greenway Medical', contactPerson: 'John Deo', phoneNumber: '123456789', locationAddress: "230 Hilltop Blvd, New York" },
    { locationName: 'New York', customerName: 'Greenway Medical', contactPerson: 'John Deo', phoneNumber: '123456789', locationAddress: "230 Hilltop Blvd, New York" },
    { locationName: 'New York', customerName: 'Greenway Medical', contactPerson: 'John Deo', phoneNumber: '123456789', locationAddress: "230 Hilltop Blvd, New York" },
    { locationName: 'New York', customerName: 'Greenway Medical', contactPerson: 'John Deo', phoneNumber: '123456789', locationAddress: "230 Hilltop Blvd, New York" },
    { locationName: 'New York', customerName: 'Greenway Medical', contactPerson: 'John Deo', phoneNumber: '123456789', locationAddress: "230 Hilltop Blvd, New York" },
    { locationName: 'New York', customerName: 'Greenway Medical', contactPerson: 'John Deo', phoneNumber: '123456789', locationAddress: "230 Hilltop Blvd, New York" },
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.dataSource.data = this.locations;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addLocation() {
    console.log('Add Location clicked');
    this.router.navigate(['/location/add']);
  }

  viewLocation(location: Location) {
    console.log('View Location:', location);
  }

  editLocation(location: Location) {
    console.log('Edit Location:', location);
  }

  deleteLocation(location: Location) {
    console.log('Delete Location:', location);
  }
}
