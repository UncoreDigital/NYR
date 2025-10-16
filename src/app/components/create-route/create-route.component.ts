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
}

@Component({
  selector: 'app-create-route',
  templateUrl: './create-route.component.html',
  styleUrl: './create-route.component.css'
})
export class CreateRouteComponent implements OnInit {
  displayedColumns: string[] = ['select', 'locationName', 'locationAddress', 'driverName', 'status'];
  dataSource = new MatTableDataSource<CreateRoutes>();
  selectedItems: CreateRoutes[] = [];
  isAllSelected = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  createRoutes: CreateRoutes[] = [
    { id: 1, locationName: 'Location A', locationAddress: '123 Main St, Cityville', driverName: 'John Doe', status: 'Ready to Ship' },
    { id: 2, locationName: 'Location B', locationAddress: '456 Oak St, Townsville', driverName: 'Jane Smith', status: 'Ready to Ship' },
    { id: 3, locationName: 'Location C', locationAddress: '789 Pine St, Villageville', driverName: 'Mike Johnson', status: 'Ready to Ship' },
    { id: 4, locationName: 'Location D', locationAddress: '101 Maple St, Hamletville', driverName: 'Emily Davis', status: 'Ready to Ship' },
    { id: 5, locationName: 'Location E', locationAddress: '202 Birch St, Boroughville', driverName: 'David Wilson', status: 'Ready to Ship' },
    { id: 6, locationName: 'Location F', locationAddress: '303 Cedar St, Metropolis', driverName: 'Sarah Brown', status: 'Ready to Ship' },
    { id: 7, locationName: 'Location G', locationAddress: '404 Spruce St, Capital City', driverName: 'Chris Lee', status: 'Ready to Ship' },
    { id: 8, locationName: 'Location H', locationAddress: '505 Elm St, Smalltown', driverName: 'Anna White', status: 'Ready to Ship' },
    { id: 9, locationName: 'Location I', locationAddress: '606 Willow St, Bigcity', driverName: 'Tom Harris', status: 'Ready to Ship' },
    { id: 10, locationName: 'Location J', locationAddress: '707 Ash St, Uptown', driverName: 'Laura Martin', status: 'Ready to Ship' },
    { id: 11, locationName: 'Location K', locationAddress: '808 Chestnut St, Downtown', driverName: 'James Clark', status: 'follow-up' },
    { id: 12, locationName: 'Location L', locationAddress: '909 Walnut St, Riverside', driverName: 'Olivia Lewis', status: 'follow-up' },
  ];
  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedDriver: string = '';
  drivers: string[] = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Emily Davis', 'David Wilson'];
  selectedDriverOption: string = 'preAssigned';
  showCreateModal: boolean = false;

  // Driver dropdown properties
  driverSearchTerm: string = '';
  showDriverDropdown: boolean = false;
  selectedDriverObj: any = null;
  
  // Driver data array
  driverOptions = [
    { value: 'driver1', name: 'Driver 1' },
    { value: 'driver2', name: 'Driver 2' },
    { value: 'driver3', name: 'Driver 3' },
    { value: 'driver4', name: 'Driver 4' },
    { value: 'driver5', name: 'Driver 5' }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.dataSource.data = this.createRoutes;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  createRoute() {
    this.showCreateModal = true;
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
      'delivered': 'status-delivered',
      'in-transit': 'status-in-transit',
      'follow-up': 'status-follow-up',
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
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected = this.isAllSelectedCheckbox();
    
    if (this.isAllSelected) {
      this.selectedItems = [];
    } else {
      this.selectedItems = [...this.dataSource.data];
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
    this.router.navigate(['/route-detail']);
  }

  closeModal() {
    this.selectedItems = [];
    this.isAllSelected = false;
  }

  onDriverOptionChange(event: any) {
    this.selectedDriverOption = event.target.value;
    this.selectedDriver = '';
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
}