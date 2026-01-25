import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
  locations: Location[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  isLoading = false;
  errorMessage = '';
  pageSizeOptions: number[] = [25, 50, 75, 100];

  // Pagination state
  pageIndex: number = 0;
  pageSize: number = 25;
  totalCount: number = 0;
  sortBy: string = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';
  searchTerm: string = '';

  // Debounce subject for search
  private searchSubject = new Subject<string>();

  constructor(
    private router: Router,
    private locationService: LocationService,
    private dialog: MatDialog
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
    this.errorMessage = '';
    
    const params = {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      sortBy: this.mapColumnToSortField(this.sortBy),
      sortOrder: this.sortOrder,
      search: this.searchTerm || undefined
    };

    this.locationService.getLocationsPaged(params).subscribe({
      next: (result) => {
        this.locations = this.mapApiResponseToLocation(result.data);
        this.totalCount = result.totalCount;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading locations:', error);
        this.errorMessage = 'Failed to load locations. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private mapColumnToSortField(column: string): string {
    const columnMap: { [key: string]: string } = {
      'locationName': 'name',
      'customerName': 'customerName',
      'contactPerson': 'contactPerson',
      'phoneNumber': 'phoneNumber',
      'locationAddress': 'address'
    };
    return columnMap[column] || 'name';
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue.trim());
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
