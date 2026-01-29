import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { UserResponse } from 'src/app/models/user.model';
import { computePageSizeOptions } from 'src/app/utils/paginator-utils';
import { LocationService } from 'src/app/services/location.service';
import { TransferResponse, TransferService } from 'src/app/services/transfer.service';
import { formatDate } from '@angular/common';
import { formatToMMDDYYYY } from 'src/app/utils/date-utils';

export interface CreateRoutes {
  id: number;
  locationName: string;
  locationAddress?: string;
  driverName: string;
  status: string;
  selected?: boolean;
  shippingDate: string;
  totalStops?: number;
  userId?: number;
  userName?: string;
}

@Component({
  selector: 'app-create-route',
  templateUrl: './create-route.component.html',
  styleUrls: ['./create-route.component.css']
})
export class CreateRouteComponent implements OnInit {
  displayedColumns: string[] = ['locationName', 'locationAddress', 'shippingDate', 'status'];
  dataSource = new MatTableDataSource<CreateRoutes>();

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

  // Expose shared formatter to template
  formatToMMDDYYYY = formatToMMDDYYYY;

  createRoutes: CreateRoutes[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];
  showCreateModal: boolean = false;
  
  // Confirmation modal properties
  showConfirmModal: boolean = false;
  confirmDriverName: string = '';
  confirmDate: string = '';
  selectedDriverName: any = "";
  confirmErrorMessage: string = '';

  // Driver data array (populated from API)
  driverOptions: Array<{ id?: number; value: string; name: string; warehouseName?: string; warehouseId?: number }> = [];

  constructor(private router: Router, private userService: UserService, private locationService: LocationService,
    private transferService: TransferService
  ) { }

  ngOnInit(): void {
    // Load locations and drivers from API
    this.loadDrivers();
    this.loadLocations();
  }

  loadLocations(): void {
    this.transferService.getTransfersByType('RestockRequest').subscribe({
      next: (response: TransferResponse[]) => {
        // Map LocationResponse to CreateRoutes model
        this.createRoutes = response.filter(x => ['restock requested', 'followup requested', 'followup'].includes(x.status?.toLowerCase())).map(loc => ({
          id: loc.locationId || 0,
          shippingDate: loc.requestDate || '',
          locationName: loc.locationName,
          locationAddress:  loc.locationAddress,
          driverName: loc.driverName ?? '',
          status: loc.status,
          totalStops: 1,
          userId: loc.driverId,
          userName: loc.driverName ?? '',
          driverId: loc.driverId,
          shippingInventory: loc.shippingInventory,
          type: loc.type,
          requestId: loc.id,
          locationInventory: loc.locationInventory,
        }));
        this.dataSource.data = [...this.createRoutes];
        this.updatePagination();
        this.applyFilter();
      },
      error: (error) => {
        console.error('Error loading locations:', error);
        // keep existing data (empty) and pagination
        this.updatePagination();
      }
    });
  }

  loadDrivers(): void {
    this.userService.getDrivers().subscribe({
      next: (users: UserResponse[]) => {
        this.driverOptions = users.map((u: any) => ({ id: u.id, value: u.name, name: u.name, warehouseName: u.warehouseName, warehouseId: u.warehouseId }));
        // auto-select first driver
        this.selectedDriverName = this.driverOptions?.[0]?.value ?? '';
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error loading drivers:', err);
      }
    });
  }

  applyFilter(event?: Event) {
    let filterValue = '';
    if (event) {
      filterValue = (event.target as HTMLInputElement).value;
    } else {
      filterValue = this.selectedDriverName || '';
    }
    const filter = filterValue.trim().toLowerCase();
    this.dataSource.filter = filter;
    this.applyWarehouseFilter();
  }

  applyWarehouseFilter() {
    let filteredData = [...this.createRoutes];

    // Apply warehouse name filter and search term filter
    if (this.selectedDriverName) {
      // Filter by selected driver name (if any) and by the search term across multiple fields
      filteredData = filteredData.filter(x => x.driverName == this.selectedDriverName);
      if (this.selectedDate != "") {
        filteredData = filteredData.filter(x => x.shippingDate.split('T')[0] == this.selectedDate);
      }
    }

    this.dataSource.data = filteredData;
    this.updatePagination();
  }

  createRoute() {
    // Open confirmation modal with current driver and date pre-selected
    // Set confirmDate to tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.confirmDate = tomorrow.toISOString().split('T')[0];
    
    // Reset error message
    this.confirmErrorMessage = '';
    
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
    this.confirmErrorMessage = '';
  }

  confirmAndSaveRoute() {
    // Reset error message
    this.confirmErrorMessage = '';
    
    // Update the selected driver name and date with confirmed values
    this.selectedDriverName = this.confirmDriverName;
    this.selectedDate = this.confirmDate;
    
    if (this.selectedDriverName == '' || this.selectedDriverName == 'Select Driver') {
      this.confirmErrorMessage = 'Select at least one driver to create a route.';
      return;
    }
    if (this.selectedDate == '' ) {
      this.confirmErrorMessage = 'Select a shipping date to create a route.';
      return;
    }
    // Close modal and proceed with route creation
    this.closeConfirmModal();
    this.saveRoute();
  }

  // Status methods
  getStatusDisplayText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'delivered': 'Delivered',
      'in-transit': 'In transit',
      'Ready to Ship': 'Ready to Ship',
      'follow-up': 'Follow up',
      'follow-up-completed': 'Follow up completed',
      'driver-assigned': 'Driver Assigned'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'Restock Requested': 'status-delivered',
      'Low Inventory': 'status-in-transit',
      'Follow Up': 'status-follow-up',
      'pending': 'status-follow-up',
      'follow-up-completed': 'status-follow-up-completed',
      'driver-assigned': 'status-driver-assigned',
      'Ready to Ship': 'status-in-transit',
    };
    return classMap[status] || 'status-default';
  }

  saveRoute() {
    // Navigate to route-detail with all available locations data
    this.dataSource.data = this.dataSource.data.map((loc: any) => ({
      ...loc,
      locationId: loc.id,
      restockRequestId: loc.requestId
    }));
    let selectedLocations: any = this.dataSource.data;
    selectedLocations.map((x: any) => x.id = undefined);
    const formattedSelectedDate = formatDate(
      this.selectedDate ? new Date(this.selectedDate) : new Date(),
      'dd-MM-yyyy',
      'en-IN'
    );
    this.router.navigate(['/route-detail'], {
      state: {
        selectedLocations: selectedLocations,
        routeData: {
          selectedDate: formattedSelectedDate,
          selectedDriver: this.selectedDriverName,
          totalLocations: selectedLocations.length,
          selectedDriverId: this.driverOptions.find(d => d.value === this.selectedDriverName)?.id,
          startPoint: this.driverOptions.find(d => d.value === this.selectedDriverName)?.warehouseName || '',
          warehouseId: this.driverOptions.find(d => d.value === this.selectedDriverName)?.warehouseId || '',
        }
      }
    });
  }

  closeModal() {
    this.showCreateModal = false;
  }

  resetFilters() {
    this.selectedDriverName = '';
    this.selectedDate = '';
    // Reset data to original state
    this.dataSource.data = [...this.createRoutes];
    this.updatePagination();
    this.dataSource.filter = '';
  }

  onFilterChange() {
    this.applyFilter();
  }

  updatePagination() {
    const computedOptions = computePageSizeOptions(this.dataSource.data.length);
    this.pageSizeOptions = computedOptions.length ? computedOptions : [25];
  }

  onConfirmDriverChange() {
    // Clear error message when driver is selected
    this.confirmErrorMessage = '';
  }


}