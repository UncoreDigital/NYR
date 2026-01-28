import { Component, OnInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { computePageSizeOptions } from 'src/app/utils/paginator-utils';
import { ToastService } from 'src/app/services/toast.service';
import { LocationService } from 'src/app/services/location.service';
import { TransferService, TransferResponse } from 'src/app/services/transfer.service';
import { FollowupRequestService, CreateFollowupRequest } from 'src/app/services/followup-request.service';
import { formatToMMDDYYYY } from 'src/app/utils/date-utils';

export interface Transfers {
  id: number;
  locationName: string;
  customerName: string;
  deliveryDate: string;
  driver: string;
  status: string;
  driverId?: number;
}

@Component({
  selector: 'app-transfers',
  templateUrl: './transfers.component.html',
  styleUrl: './transfers.component.css'
})
export class TransfersComponent implements OnInit {
  displayedColumns: string[] = ['locationName', 'customerName', 'deliveryDate', 'driver', 'status'];
  transfers: Transfers[] = [];
  pageSizeOptions: number[] = [25, 50, 75, 100];

  // Expose shared formatter to template
  formatToMMDDYYYY = formatToMMDDYYYY;
  
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
  isLoadingLocations: boolean = false;
  
  // Location data array - will be populated from API
  locations: any[] = [];

  // Pagination state
  pageIndex: number = 0;
  pageSize: number = 25;
  totalCount: number = 0;
  sortBy: string = 'deliveryDate';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Debounce subject for search
  private searchSubject = new Subject<string>();

  constructor(
    private router: Router,
    private transferService: TransferService,
    private locationService: LocationService,
    private followupRequestService: FollowupRequestService,
    private toastService: ToastService
  ) {
    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.pageIndex = 0;
      this.loadTransfers();
    });
  }

  ngOnInit(): void {
    this.loadTransfers();
    this.loadLocations();
  }

  loadLocations(): void {
    this.isLoadingLocations = true;
    this.locationService.getLocations().subscribe({
      next: (locations) => {
        this.locations = locations.map(l => ({
          value: l.id,
          name: l.locationName,
          id: l.id,
          customerId: l.customerId,
          customerName: l.customerName
        }));
        this.isLoadingLocations = false;
      },
      error: (error) => {
        console.error('Error loading locations:', error);
        this.toastService.error('Error', 'Failed to load locations');
        this.isLoadingLocations = false;
      }
    });
  }

  loadTransfers(): void {
    this.isLoading = true;
    
    const search = this.searchTerm || undefined;

    const params = {
      pageNumber: this.pageIndex + 1, // Backend uses 1-based indexing
      pageSize: this.pageSize,
      sortBy: this.mapColumnToSortField(this.sortBy),
      sortOrder: this.sortOrder,
      search
    };

    // Load only RestockRequest transfers (exclude VanTransfer) with pagination
    this.transferService.getTransfersByTypePaged('RestockRequest', params).subscribe({
      next: (result) => {
        const response = result.data || [];
        this.transfers = response.map(transfer => ({
          id: transfer.id,
          locationName: transfer.locationName || '-',
          customerName: transfer.customerName,
          // Keep original/raw date string in the model and format only for UI
          deliveryDate: transfer.deliveryDate ? transfer.deliveryDate : (transfer.requestDate ? transfer.requestDate : ''),
          driver: transfer.driverName || '-',
          status: this.mapStatusFromApi(transfer.status),
          shippingInventory: transfer.shippingInventory || [],
          driverId: transfer.driverId
        }));
        
        this.filteredTransfers = [...this.transfers];
        this.applyFilters(false);
        this.totalCount = result.totalCount;
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
      'Followup Completed': 'follow-up-completed',
      'Restock Request': 'restock-requested',
      'Restock Requested': 'restock-requested'
    };
    return statusMap[status] || status.toLowerCase().replace(/\s+/g, '-');
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value.trim());
  }

  applyFilters(reload: boolean = true) {
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
        (transfer.deliveryDate && formatToMMDDYYYY(transfer.deliveryDate).toLowerCase().includes(searchLower)) ||
        (transfer.deliveryDate && transfer.deliveryDate.toLowerCase().includes(searchLower)) ||
        transfer.driver.toLowerCase().includes(searchLower) ||
        transfer.status.toLowerCase().includes(searchLower)
      );
    }

    this.filteredTransfers = filtered;
    if (reload) {
      this.pageIndex = 0;
      this.loadTransfers();
    }
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
      'follow-up-requested': 'Followup requested',
      'follow-up-completed': 'Followup completed',
      'driver-assigned': 'Driver Assigned',
      'restock-requested': 'Restock requested'
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
      'driver-assigned': 'status-driver-assigned',
      'restock-request': 'status-pending'
    };
    return classMap[status] || 'status-default';
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'pending': 'visibility',
      'delivered': 'visibility',
      'in-transit': 'visibility',
      'follow-up': '',
      'follow-up-requested': '',
      'follow-up-completed': 'chat_bubble',
      'driver-assigned': 'visibility',
      'followup': '',
      'restock-requested': 'visibility'
    };
    // return iconMap[status] || 'visibility ';
    return iconMap[status] || '';
  }

  addFollowUp() {
    this.showFollowUpModal = true;
  }

  saveFollowUp() {
    if (!this.selectedLocation) {
      this.toastService.error('Error', 'Please select a location');
      return;
    }

    const request: CreateFollowupRequest = {
      customerId: this.selectedLocation.customerId,
      locationId: this.selectedLocation.id
    };

    this.followupRequestService.createFollowupRequest(request).subscribe({
      next: (response) => {
        this.toastService.success('Success', 'Followup request created successfully');
        this.showFollowUpModal = false;
        this.clearLocation();
        this.loadTransfers(); // Reload transfers to show the new followup request
      },
      error: (error) => {
        console.error('Error creating followup request:', error);
        this.toastService.error('Error', 'Failed to create followup request');
      }
    });
  }

  closeFollowUpModal() {
    this.showFollowUpModal = false;
    this.clearLocation();
  }

  transferDetail(transfer: Transfers) {
    if (this.getStatusIcon(transfer.status) === 'visibility') {
      this.router.navigate(['/transferDetail'], {
        state: { transfer: transfer }
      });
    }
  }

  transferToVan() {
    this.router.navigate(['/tovan'], { queryParams: { from: 'transfers' } });
  }

  transferToLocation() {
    this.router.navigate(['/tolocation'], { queryParams: { from: 'transfers' } });
  }

  requestInventory() {
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
    this.locationSearchTerm = `${location.name} - ${location.customerName}`;
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

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTransfers();
  }

  onSortChange(column: string) {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = column === 'deliveryDate' ? 'desc' : 'asc';
    }
    this.pageIndex = 0;
    this.loadTransfers();
  }

  private mapColumnToSortField(column: string): string {
    const columnMap: { [key: string]: string } = {
      locationName: 'locationName',
      customerName: 'customerName',
      deliveryDate: 'deliveryDate',
      driver: 'driverName',
      status: 'status'
    };
    return columnMap[column] || 'deliveryDate';
  }
}
