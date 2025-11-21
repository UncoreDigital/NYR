import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Routes, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { UserResponse } from 'src/app/models/user.model';
import { computePageSizeOptions } from 'src/app/utils/paginator-utils';
import { LocationService } from 'src/app/services/location.service';
import { LocationResponse } from 'src/app/models/location.model';

export interface CreateRoutes {
  id: number;
  locationName: string;
  locationAddress: string;
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
  displayedColumns: string[] = ['locationName', 'locationAddress', 'status'];
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
  // drivers: string[] = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Emily Davis', 'David Wilson'];
  selectedDriverOption: string = 'preAssigned';
  showCreateModal: boolean = false;

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
  warehouseNames: string[] = ['Warehouse A', 'Warehouse B', 'Warehouse C', 'Warehouse D'];

  constructor(private router: Router, private userService: UserService, private locationService: LocationService) { }

  ngOnInit(): void {
    // Initialize single table with all data
    // Load locations and drivers from API
    this.loadDrivers();
    this.loadLocations();
  }

  loadLocations(): void {
    this.locationService.getLocations().subscribe({
      next: (locations: LocationResponse[]) => {
        // Map LocationResponse to CreateRoutes model
        this.createRoutes = locations.map(loc => ({
          id: loc.id,
          shippingDate: this.selectedDate || '',
          locationName: loc.locationName,
          locationAddress: `${loc.addressLine1}${loc.city ? ', ' + loc.city : ''}`,
          driverName: loc.userName ?? '',
          status: 'Pending',
          totalStops: 1,
          userId: loc.userId,
          userName: loc.userName ?? ''
        }));
        this.dataSource.data = [...this.createRoutes];
        this.updatePagination();
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error loading locations:', err);
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
      const driverLower = this.selectedDriverName?.toLowerCase() || '';
      const searchLower = this.searchTerm?.toLowerCase() || '';

      const filterFunction = (route: CreateRoutes) => {
        const matchesDriver = !this.selectedDriverName ||
          route.driverName.toLowerCase().includes(driverLower);
        const matchesSearch = !this.searchTerm ||
          route.locationName.toLowerCase().includes(searchLower) ||
          route.locationAddress.toLowerCase().includes(searchLower) ||
          route.driverName.toLowerCase().includes(searchLower) ||
          route.status.toLowerCase().includes(searchLower);

        return matchesDriver && matchesSearch;
      };

      filteredData = filteredData.filter(filterFunction);
    }

    this.dataSource.data = filteredData;
    this.updatePagination();
  }

  createRoute() {
    // Check if any data is available before proceeding
    if (this.selectedDriverName == '' ||this.dataSource.data.length === 0) {
      alert('Select Atleast one driver to create a route.');
      return;
    }
    this.saveRoute();
    // Proceed with route creation using all available data
    console.log('Creating route with all locations:', this.dataSource.data);
    // this.showCreateModal = true;
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
          totalLocations: this.dataSource.data.length
        }
      }
    });
  }

  closeModal() {
    this.showCreateModal = false;
  }

  // onDriverOptionChange(event: any) {
  //   this.selectedDriverOption = event.target.value;
  //   this.selectedDriver = '';
  // }

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
    this.applyWarehouseFilter();
  }



  onDateFilterChange() {
    this.applyFilter();
  }

  updatePagination() {
    const computedOptions = computePageSizeOptions(this.dataSource.data.length);
    this.pageSizeOptions = computedOptions.length ? computedOptions : [25];
  }
}