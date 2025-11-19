import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { computePageSizeOptions } from '../../utils/paginator-utils';
import { LocationService } from '../../services/location.service';
import { LocationResponse } from '../../models/location.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

export interface Location {
  id: number;
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
export class LocationComponent implements OnInit {
  displayedColumns: string[] = ['locationName', 'customerName', 'contactPerson', 'phoneNumber', 'locationAddress', 'actions'];
  dataSource = new MatTableDataSource<Location>();
  
  isLoading = false;
  errorMessage = '';
  locations: Location[] = [];

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

  constructor(
    private router: Router,
    private locationService: LocationService,
    private dialog: MatDialog
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
        const computedOptions = computePageSizeOptions(this.dataSource.data.length);
        this.pageSizeOptions = computedOptions.length ? computedOptions : [25];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading locations:', error);
        this.errorMessage = 'Failed to load locations. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private mapApiResponseToLocation(apiLocations: LocationResponse[]): Location[] {
    return apiLocations.map(apiLocation => ({
      id: apiLocation.id,
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
    this.router.navigate(['/location/edit', location.id]);
  }

  deleteLocation(location: Location) {
    console.log('Delete Location:', location);
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Location',
        message: `Are you sure you want to delete the location "${location.locationName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.errorMessage = '';
        
        this.locationService.deleteLocation(location.id).subscribe({
          next: () => {
            console.log('Location deleted successfully');
            this.isLoading = false;
            // Reload the locations list
            this.loadLocations();
          },
          error: (error: any) => {
            console.error('Error deleting location:', error);
            this.errorMessage = 'Failed to delete location. Please try again.';
            this.isLoading = false;
          }
        });
      }
    });
  }
}
