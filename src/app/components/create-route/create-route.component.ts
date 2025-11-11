import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Routes, Router } from '@angular/router';

export interface CreateRoutes {
  id: number;
  locationName: string;
  locationAddress: string;
  driverName: string;
  status: string;
  selected?: boolean;
  shippingDate: string;
  totalStops?: number;
}

@Component({
  selector: 'app-create-route',
  templateUrl: './create-route.component.html',
  styleUrl: './create-route.component.css'
})
export class CreateRouteComponent implements OnInit {
  displayedColumns: string[] = ['locationName', 'locationAddress', 'status'];
  dataSource = new MatTableDataSource<CreateRoutes>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  createRoutes: CreateRoutes[] = [
    { id: 1, shippingDate: '2023-10-01', locationName: 'Location A', locationAddress: '123 Main St, Cityville', driverName: 'John Doe', status: 'Low Inventory' },
    { id: 2, shippingDate: '2023-10-02', locationName: 'Location B', locationAddress: '456 Oak St, Townsville', driverName: 'Jane Smith', status: 'Restock Requested' },
    { id: 3, shippingDate: '2023-10-03', locationName: 'Location C', locationAddress: '789 Pine St, Villageville', driverName: 'Mike Johnson', status: 'Follow Up' },
    { id: 4, shippingDate: '2023-10-04', locationName: 'Location D', locationAddress: '101 Maple St, Hamletville', driverName: 'Emily Davis', status: 'Low Inventory' },
    { id: 5, shippingDate: '2023-10-05', locationName: 'Location E', locationAddress: '202 Birch St, Boroughville', driverName: 'David Wilson', status: 'Restock Requested' },
    { id: 6, shippingDate: '2023-10-06', locationName: 'Location F', locationAddress: '303 Cedar St, Metropolis', driverName: 'Sarah Brown', status: 'Restock Requested' },
    { id: 7, shippingDate: '2023-10-07', locationName: 'Location G', locationAddress: '404 Spruce St, Capital City', driverName: 'Chris Lee', status: 'Low Inventory' },
    { id: 8, shippingDate: '2023-10-08', locationName: 'Location H', locationAddress: '505 Elm St, Smalltown', driverName: 'Anna White', status: 'Low Inventory' },
    { id: 9, shippingDate: '2023-10-09', locationName: 'Location I', locationAddress: '606 Willow St, Bigcity', driverName: 'Tom Harris', status: 'Restock  Requested' },
    { id: 10, shippingDate: '2023-10-10', locationName: 'Location J', locationAddress: '707 Ash St, Uptown', driverName: 'Laura Martin', status: 'Low Inventory' },
    { id: 11, shippingDate: '2023-10-11', locationName: 'Location K', locationAddress: '808 Chestnut St, Downtown', driverName: 'James Clark', status: 'Follow Up' },
    { id: 12, shippingDate: '2023-10-12', locationName: 'Location L', locationAddress: '909 Walnut St, Riverside', driverName: 'Olivia Lewis', status: 'Follow Up' },
  ];
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

  // Driver data array
  driverOptions = [
    { value: 'John Doe', name: 'John Doe' },
    { value: 'Jane Smith', name: 'Jane Smith' },
    { value: 'Mike Johnson', name: 'Mike Johnson' },
    { value: 'Emily Davis', name: 'Emily Davis' },
    { value: 'David Wilson', name: 'David Wilson' }
  ];

  // Unique warehouse names for filter
  warehouseNames: string[] = ['Warehouse A', 'Warehouse B', 'Warehouse C', 'Warehouse D'];

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Initialize single table with all data
    this.dataSource.data = [...this.createRoutes];
    this.selectedDriverName = this.driverOptions?.[0].value;
    this.applyFilter();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
    if (this.selectedWarehouseName || this.searchTerm) {
      const warehouseLower = this.selectedWarehouseName?.toLowerCase() || '';
      const searchLower = this.searchTerm?.toLowerCase() || '';

      const filterFunction = (route: CreateRoutes) => {
        const matchesWarehouse = !this.selectedWarehouseName ||
          route.locationName.toLowerCase().includes(warehouseLower);
        const matchesSearch = !this.searchTerm ||
          route.locationName.toLowerCase().includes(searchLower) ||
          route.locationAddress.toLowerCase().includes(searchLower) ||
          route.driverName.toLowerCase().includes(searchLower) ||
          route.status.toLowerCase().includes(searchLower);

        return matchesWarehouse && matchesSearch;
      };

      filteredData = filteredData.filter(filterFunction);
    }

    this.dataSource.data = filteredData;
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

}