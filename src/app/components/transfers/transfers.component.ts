import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { computePageSizeOptions } from 'src/app/utils/paginator-utils';
import { VanInventoryService } from 'src/app/services/van-inventory.service';
import { TransferTrackingResponse } from 'src/app/models/van-inventory.model';
import { ToastService } from 'src/app/services/toast.service';

export interface Transfers {
  id: number;
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

  transfers: Transfers[] = [];
  
  // Filter properties
  filteredTransfers: Transfers[] = [];
  selectedWarehouseName = '';
  selectedStatus = '';
  searchTerm = '';
  
  showFollowUpModal: boolean = false;
  isLoading: boolean = false;

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

  constructor(
    private router: Router,
    private vanInventoryService: VanInventoryService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadTransfers();
  }

  loadTransfers(): void {
    this.isLoading = true;
    this.vanInventoryService.getAllTransfersTracking().subscribe({
      next: (response: TransferTrackingResponse[]) => {
        this.transfers = response.map(transfer => ({
          id: transfer.id,
          locationName: transfer.locationName,
          customerName: transfer.customerName,
          deliveryDate: transfer.deliveryDate ? this.formatDate(transfer.deliveryDate) : '-',
          driver: transfer.driverName || '-',
          status: this.mapStatusFromApi(transfer.status)
        }));
        this.filteredTransfers = [...this.transfers];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transfers:', error);
        this.toastService.error('Error', 'Failed to load transfers');
        this.isLoading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  }

  mapStatusFromApi(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Pending': 'pending',
      'Driver Assigned': 'driver-assigned',
      'In Transit': 'in-transit',
      'Delivered': 'delivered',
      'Followup Requested': 'follow-up-requested',
      'Followup Completed': 'follow-up-completed'
    };
    return statusMap[status] || status.toLowerCase().replace(/\s+/g, '-');
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
    const computedOptions = computePageSizeOptions(this.dataSource.data.length);
    this.pageSizeOptions = computedOptions.length ? computedOptions : [25];
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
      'pending': 'Pending',
      'delivered': 'Delivered',
      'in-transit': 'In transit',
      'follow-up-requested': 'Follow up requested',
      'follow-up-completed': 'Follow up completed',
      'driver-assigned': 'Driver Assigned'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'pending': 'status-pending',
      'delivered': 'status-delivered',
      'in-transit': 'status-in-transit',
      'follow-up': 'status-follow-up',
      'follow-up-requested': 'status-follow-up',
      'follow-up-completed': 'status-follow-up-completed',
      'driver-assigned': 'status-driver-assigned'
    };
    return classMap[status] || 'status-default';
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'pending': '',
      'delivered': 'visibility',
      'in-transit': 'visibility',
      'follow-up': '',
      'follow-up-requested': '',
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
    this.router.navigate(['/transfers']);
  }

  transferDetail(iconName: string) {
    if (iconName === 'visibility') {
      this.router.navigate(['/transferDetail']);
    }
  }

  transferToVan() {
    this.router.navigate(['/tovan'], { queryParams: { from: 'transfers' } });
  }

  transferToLocation() {
    this.router.navigate(['/tolocation'], { queryParams: { from: 'transfers' } });
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
