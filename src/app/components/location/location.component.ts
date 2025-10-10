import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { LocationResponse } from '../../models/location.model';

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
  displayedColumns: string[] = ['locationName', 'customerName', 'contactPerson', 'phoneNumber', 'locationAddress', 'actions'];
  dataSource = new MatTableDataSource<Location>();
  
  isLoading = false;
  errorMessage = '';
  locations: Location[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private router: Router,
    private locationService: LocationService
  ) { }

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.locationService.getLocations().subscribe({
      next: (apiLocations: LocationResponse[]) => {
        this.locations = this.mapApiResponseToLocation(apiLocations);
        this.dataSource.data = this.locations;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading locations:', error);
        this.errorMessage = 'Failed to load locations. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private mapApiResponseToLocation(apiLocations: LocationResponse[]): Location[] {
    return apiLocations.map(apiLocation => ({
      locationName: apiLocation.locationName,
      customerName: apiLocation.customerName,
      contactPerson: apiLocation.contactPerson,
      phoneNumber: apiLocation.locationPhone,
      locationAddress: `${apiLocation.addressLine1}${apiLocation.addressLine2 ? ', ' + apiLocation.addressLine2 : ''}, ${apiLocation.city}, ${apiLocation.state} ${apiLocation.zipCode}`
    }));
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
