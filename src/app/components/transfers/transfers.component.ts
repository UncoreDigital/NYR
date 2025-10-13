import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

export interface Transfers {
  locationName: string;
  customerName: string;
  deliveryDate: string;
  driver: string;
  status: string;
}

@Component({
  selector: 'app-transfers',
  templateUrl: './transfers.component.html',
  styleUrl: './transfers.component.css'
})
export class TransfersComponent implements OnInit {
  displayedColumns: string[] = ['locationName', 'customerName', 'deliveryDate', 'driver', 'status'];
  dataSource = new MatTableDataSource<Transfers>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  transfers: Transfers[] = [
    { locationName: 'Greenway Medical', customerName: 'John deo', deliveryDate: '17 Jun 2025', driver: 'Nick Danil', status: 'delivered' },
    { locationName: 'Greenway Medical', customerName: 'John deo', deliveryDate: '17 Jun 2025', driver: 'Nick Danil', status: 'delivered' },
    { locationName: 'Greenway Medical', customerName: 'John deo', deliveryDate: '17 Jun 2025', driver: 'Nick Danil', status: 'in-transit' },
    { locationName: 'Greenway Medical', customerName: 'John deo', deliveryDate: '-', driver: 'Nick Danil', status: 'follow-up' },
    { locationName: 'Greenway Medical', customerName: 'John deo', deliveryDate: '-', driver: 'Nick Danil', status: 'follow-up-completed' },
    { locationName: 'Greenway Medical', customerName: 'John deo', deliveryDate: '-', driver: 'Nick Danil', status: 'follow-up-completed' },
    { locationName: 'Greenway Medical', customerName: 'John deo', deliveryDate: '-', driver: 'Nick Danil', status: 'driver-assigned' },
    { locationName: 'Greenway Medical', customerName: 'John deo', deliveryDate: '-', driver: 'Nick Danil', status: 'delivered' },
    { locationName: 'Greenway Medical', customerName: 'John deo', deliveryDate: '-', driver: 'Nick Danil', status: 'in-transit' },
  ];
  
  // Filter properties
  filteredTransfers: Transfers[] = [];
  selectedWarehouseName = '';
  selectedStatus = '';
  searchTerm = '';
  
  showFollowUpModal: boolean = false;

  // Location dropdown properties
  locationSearchTerm: string = '';
  showLocationDropdown: boolean = false;
  selectedLocation: any = null;
  
  // Location data array
  locations = [
    { value: 'us-planet-health', name: 'US - Planet Health' },
    { value: 'uk-planet-health', name: 'UK - Planet Health' },
    { value: 'india-avetis', name: 'India - Avetis' },
    { value: 'canada-health-center', name: 'Canada - Health Center' },
    { value: 'australia-medical', name: 'Australia - Medical Center' }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.filteredTransfers = [...this.transfers];
    this.applyFilters();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.transfers];

    // Apply warehouse filter
    if (this.selectedWarehouseName) {
      filtered = filtered.filter(transfer => 
        transfer.locationName === this.selectedWarehouseName
      );
    }

    // Apply status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(transfer => 
        transfer.status === this.selectedStatus
      );
    }

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(transfer =>
        transfer.locationName.toLowerCase().includes(searchLower) ||
        transfer.customerName.toLowerCase().includes(searchLower) ||
        transfer.deliveryDate.toLowerCase().includes(searchLower) ||
        transfer.driver.toLowerCase().includes(searchLower) ||
        transfer.status.toLowerCase().includes(searchLower)
      );
    }

    this.filteredTransfers = filtered;
    this.dataSource.data = this.filteredTransfers;
  }

  onWarehouseNameFilterChange() {
    this.applyFilters();
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  getUniqueWarehouseNames(): string[] {
    return [...new Set(this.transfers.map(transfer => transfer.locationName))].sort();
  }

  getUniqueStatuses(): string[] {
    return [...new Set(this.transfers.map(transfer => transfer.status))].sort();
  }

  resetFilters() {
    this.selectedWarehouseName = '';
    this.selectedStatus = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  addTransfer() {
    console.log('Add Transfers clicked');
    this.router.navigate(['/transfers/add']);
  }

  viewTransfer(transfers: Transfers) {
    console.log('View Transfer:', transfers);
  }

  editTransfer(transfers: Transfers) {
    console.log('Edit Transfer:', transfers);
  }

  deleteTransfer(transfers: Transfers) {
    console.log('Delete Transfer:', transfers);
  }

  // Status methods
  getStatusDisplayText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'delivered': 'Delivered',
      'in-transit': 'In transit',
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
      'follow-up-completed': 'status-follow-up-completed',
      'driver-assigned': 'status-driver-assigned'
    };
    return classMap[status] || 'status-default';
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'delivered': 'visibility',
      'in-transit': 'visibility',
      'follow-up': '',
      'follow-up-completed': 'chat_bubble',
      'driver-assigned': 'visibility'
    };
    return iconMap[status] || '';
  }

  addFollowUp() {
    this.showFollowUpModal = true;
  }

  saveFollowUp() {
    this.showFollowUpModal = false;
    this.router.navigate(['/routes']);
  }

  transferDetail(iconName: string) {
    if (iconName === 'visibility') {
      this.router.navigate(['/transferDetail']);
    }
  }

  transferToVan() {
    this.router.navigate(['/tovan']);
  }

  transferToLocation() {
    this.router.navigate(['/tolocation']);
  }

  getTooltipText(): string {
    return 'Title\n\nSupporting line text lorem ipsum dolor sit amet, consectetur\n\nLabel    Label';
  }

  // Location dropdown methods
  getFilteredLocations() {
    if (!this.locationSearchTerm) {
      return this.locations;
    }
    return this.locations.filter(location => 
      location.name.toLowerCase().includes(this.locationSearchTerm.toLowerCase())
    );
  }
  
  filterLocations() {
    // Trigger filtering when user types
  }
  
  selectLocation(location: any) {
    this.selectedLocation = location;
    this.locationSearchTerm = location.name;
    this.showLocationDropdown = false;
  }
  
  hideLocationDropdown() {
    setTimeout(() => {
      this.showLocationDropdown = false;
    }, 200);
  }
  
  clearLocation() {
    this.selectedLocation = null;
    this.locationSearchTerm = '';
    this.showLocationDropdown = false;
  }
}
