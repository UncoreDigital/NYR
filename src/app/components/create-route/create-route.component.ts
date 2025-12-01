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

  createRoutes: CreateRoutes[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedDriver: string = '';
  showCreateModal: boolean = false;
  
  // Confirmation modal properties
  showConfirmModal: boolean = false;
  confirmDriverName: string = '';
  confirmDate: string = '';

  // Driver dropdown properties
  driverSearchTerm: string = '';
  showDriverDropdown: boolean = false;
  selectedDriverObj: any = null;
  selectedDriverName: any = "";
  selectedWarehouseName: string = '';
  searchTerm: string = '';

  // Driver data array (populated from API)
  driverOptions: Array<{ id?: number; value: string; name: string }> = [];

  // Unique warehouse names for filter
  warehouseNames: string[] = [];

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
        this.createRoutes = response.filter(x => ['restock requested', 'followup requested'].includes(x.status?.toLowerCase())).map(loc => ({
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
          requestId: loc.id
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
        this.driverOptions = users.map(u => ({ id: u.id, value: u.name, name: u.name }));
        // auto-select first driver
        this.selectedDriverName = this.driverOptions?.[0].value;
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
      this.searchTerm = filterValue;
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
    if (this.selectedDriverName || this.searchTerm) {
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
    // Check if any data is available before proceeding
    if (this.selectedDriverName == '' || this.dataSource.data.length === 0) {
      alert('Select at least one driver to create a route.');
      return;
    }
    
    // Open confirmation modal with current driver and date pre-selected
    this.confirmDriverName = this.selectedDriverName;
    this.confirmDate = this.selectedDate;
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
  }

  confirmAndSaveRoute() {
    // Update the selected driver name and date with confirmed values
    this.selectedDriverName = this.confirmDriverName;
    this.selectedDate = this.confirmDate;
    
    // Close modal and proceed with route creation
    this.closeConfirmModal();
    this.saveRoute();
  }

  viewMap(route: CreateRoutes) {
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

  getAvailableCount(): number {
    return this.dataSource.data.length;
  }

  saveRoute() {
    // Navigate to route-detail with all available locations data
    this.router.navigate(['/route-detail'], {
      state: {
        selectedLocations: this.dataSource.data,
        routeData: {
          selectedDate: this.selectedDate,
          selectedDriver: this.selectedDriverName,
          totalLocations: this.dataSource.data.length,
          selectedDriverId: this.driverOptions.find(d => d.value === this.selectedDriverName)?.id
        }
      }
    });
  }

  closeModal() {
    this.showCreateModal = false;
  }

  // Driver dropdown methods
  getFilteredDrivers() {
    if (!this.driverSearchTerm.trim()) {
      return this.driverOptions;
    }
    return this.driverOptions.filter(driver =>
      driver.name.toLowerCase().includes(this.driverSearchTerm.toLowerCase())
    );
  }

  filterDrivers() {
    // Automatically show dropdown when user starts typing
    if (!this.showDriverDropdown) {
      this.showDriverDropdown = true;
    }
  }

  selectDriver(driver: any) {
    this.selectedDriverObj = driver;
    this.selectedDriver = driver.id;
    this.driverSearchTerm = driver.name;
    this.showDriverDropdown = false;
  }

  hideDriverDropdown() {
    setTimeout(() => {
      this.showDriverDropdown = false;
    }, 150);
  }

  clearDriver() {
    this.selectedDriver = '';
    this.selectedDriverObj = null;
    this.driverSearchTerm = '';
    this.showDriverDropdown = false;
  }

  resetFilters() {
    this.selectedWarehouseName = '';
    this.searchTerm = '';
    this.selectedDriverName = '';
    this.selectedDate = '';
    // Reset data to original state
    this.dataSource.data = [...this.createRoutes];
    this.updatePagination();
    this.dataSource.filter = '';
  }

  getUniqueWarehouseNames(): string[] {
    return this.warehouseNames;
  }

  onWarehouseNameFilterChange() {
    this.selectedWarehouseName = this.selectedDriverName;
    this.applyFilter();
  }

  onDateFilterChange() {
    this.applyFilter();
  }

  updatePagination() {
    const computedOptions = computePageSizeOptions(this.dataSource.data.length);
    this.pageSizeOptions = computedOptions.length ? computedOptions : [25];
  }
}