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
  displayedColumns: string[] = ['locationName', 'locationAddress', 'status', 'actions'];
  leftDataSource = new MatTableDataSource<CreateRoutes>();
  rightDataSource = new MatTableDataSource<CreateRoutes>();
  selectedItems: CreateRoutes[] = [];
  isAllSelected = false;

  @ViewChild('leftPaginator') leftPaginator!: MatPaginator;
  @ViewChild('rightPaginator') rightPaginator!: MatPaginator;
  @ViewChild('leftSort') leftSort!: MatSort;
  @ViewChild('rightSort') rightSort!: MatSort;

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
    // Initialize left grid with all data (available locations), right grid empty (selected locations)
    this.leftDataSource.data = [...this.createRoutes];
    this.rightDataSource.data = [];
    this.selectedDriverName = this.driverOptions?.[0].value;
    this.applyFilter();
  }

  ngAfterViewInit() {
    this.leftDataSource.paginator = this.leftPaginator;
    this.leftDataSource.sort = this.leftSort;
    this.rightDataSource.paginator = this.rightPaginator;
    this.rightDataSource.sort = this.rightSort;
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
    this.leftDataSource.filter = filter;
    this.rightDataSource.filter = filter;
    this.applyWarehouseFilter();
  }

  applyWarehouseFilter() {
    let leftFilteredData = [...this.leftDataSource.data];
    let rightFilteredData = [...this.rightDataSource.data];
    
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
      
      leftFilteredData = leftFilteredData.filter(filterFunction);
      rightFilteredData = rightFilteredData.filter(filterFunction);
    }
    
    // Note: For now, we're not updating the data sources here as filtering will be handled by the mat-table filter
  }

  createRoute() {
    // Check if right data source has data before proceeding
    if (this.rightDataSource.data.length === 0) {
      alert('Please select at least one location to create a route.');
      return;
    }
    
    // Proceed with route creation if data is available
    console.log('Creating route with selected locations:', this.rightDataSource.data);
    
    // Navigate directly to route-detail with selected data
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

  // Checkbox methods
  isAllSelectedCheckbox(): boolean {
    const numSelected = this.selectedItems.length;
    const numRows = this.leftDataSource.data.length + this.rightDataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected = this.isAllSelectedCheckbox();

    if (this.isAllSelected) {
      this.selectedItems = [];
    } else {
      this.selectedItems = [...this.leftDataSource.data, ...this.rightDataSource.data];
    }
  }

  isRowSelected(row: CreateRoutes): boolean {
    return this.selectedItems.some(item => item.id === row.id);
  }

  toggleRowSelection(row: CreateRoutes) {
    const index = this.selectedItems.findIndex(item => item.id === row.id);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(row);
    }
    this.isAllSelected = this.isAllSelectedCheckbox();
  }

  getSelectedCount(): number {
    return this.selectedItems.length;
  }

  saveRoute() {
    // Navigate to route-detail with selected locations data
    this.router.navigate(['/route-detail'], {
      state: {
        selectedLocations: this.rightDataSource.data,
        routeData: {
          selectedDate: this.selectedDate,
          selectedDriver: this.selectedDriverName,
          totalLocations: this.rightDataSource.data.length
        }
      }
    });
  }

  closeModal() {
    this.selectedItems = [];
    this.isAllSelected = false;
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
    // Reset to original data distribution - all data on left, none on right
    this.leftDataSource.data = [...this.createRoutes];
    this.rightDataSource.data = [];
    this.leftDataSource.filter = '';
    this.rightDataSource.filter = '';
  }

  getUniqueWarehouseNames(): string[] {
    return this.warehouseNames;
  }

  onWarehouseNameFilterChange() {
    this.selectedWarehouseName = this.selectedDriverName;
    this.applyWarehouseFilter();
  }

  // Grid movement methods
  moveToRight(item: CreateRoutes) {
    // Remove from left grid
    const leftData = this.leftDataSource.data.filter(route => route.id !== item.id);
    this.leftDataSource.data = leftData;
    
    // Add to right grid
    const rightData = [...this.rightDataSource.data, item];
    this.rightDataSource.data = rightData;
  }

  moveToLeft(item: CreateRoutes) {
    // Remove from right grid
    const rightData = this.rightDataSource.data.filter(route => route.id !== item.id);
    this.rightDataSource.data = rightData;
    
    // Add to left grid
    const leftData = [...this.leftDataSource.data, item];
    this.leftDataSource.data = leftData;
  }

}