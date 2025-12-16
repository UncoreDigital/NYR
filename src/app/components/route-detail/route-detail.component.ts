// NOTE :- 
// Show Status Column when we click on Map from Route screen (If status is not completed then in all other case show the status in next screen)
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { RouteMapComponent } from '../route-map/route-map.component';
import { computePageSizeOptions } from 'src/app/utils/paginator-utils';
import { LocationService } from 'src/app/services/location.service';
import { RouteService } from 'src/app/services/route.service';
import { ToastService } from 'src/app/services/toast.service';
import { WarehouseService } from 'src/app/services/warehouse.service';

export interface routeDetail {
  stop: string;
  deliveryDate: string;
  locationName: string;
  // inventoryItem: string;
  // shippingItem: string;
  locationInventory?: string;
  locationInventoryData?: any[];
  shippingInventory?: string;
  shippingInventoryData?: any[];
  travelTime?: string;
  deliveryTime?: string;
  distance?: string;
  status?: string;
  id?: number;
  fullAddress?: string;
  latitude?: number;
  longitude?: number;
}

export interface ProductDetail {
  productName: string;
  skuCode: string;
  size: string;
  side: string;
  colour: string;
  quantity: number;
  inStock: number;
}

export interface Customer {
  id: number;
  locationName: string;
  locationAddress: string;
  driverName: string;
  locationInventory: string;
  locationInventoryData?: any[];
  shippingInventory: string;
  shippingInventoryData?: any[];
  status: string;
  selected: boolean;
  fullAddress?: string;
}

@Component({
  selector: 'app-route-detail',
  templateUrl: './route-detail.component.html',
  styleUrl: './route-detail.component.css'
})
export class RouteDetailComponent implements OnInit {
  baseColumns: string[] = ['stop', 'location', 'locationInventory', 'shippingInventory', 'distance', 'travelTime', 'deliveryTime'];
  dataSource = new MatTableDataSource<routeDetail>();

  // Dynamic displayedColumns getter
  get displayedColumns(): string[] {
    let columns = [...this.baseColumns];
    
    // Add status column if route status is not "Completed"
    if (this.routeStatus && this.routeStatus.toLowerCase() !== 'draft') {
      columns.push('status');
    }
    
    return this.shouldShowActionButtons() 
      ? [...columns, 'actions'] 
      : columns;
  }

  // Modal properties
  showModal = false;
  modalTitle = 'Route Details';
  productDetails: ProductDetail[] = [];
  productDisplayedColumns: string[] = ['productName', 'skuCode', 'size', 'side', 'colour', 'quantity', 'inStock'];
  isModalFromLocationPopup = false; // Flag to track if product modal is opened from location modal

  // Location Address Modal properties
  showLocationModal = false;
  customers: Customer[] = [];
  selectedCustomers: Customer[] = [];
  allSelected = false;
  
  // Radio button properties for location modal
  locationViewType: 'assigned' | 'all' = 'assigned';
  assignedLocations: Customer[] = [];
  allLocations: Customer[] = [];
  driverLocations: Customer[] = [];
  isLoading = false;

  // Approval Modal properties
  showApprovalModal = false;

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
  @ViewChild(RouteMapComponent) routeMapComponent!: RouteMapComponent;

  routeDetail: routeDetail[] = [];

  // Route summary properties
  totalStops = 0;
  totalDistance = '0 Miles';
  totalTime = '0 Hrs';
  deliveryDate = '-';
  driverName = '-';
  startPoint = '-';

  // Properties for received data from create-route
  selectedLocations: any[] = [];
  routeCreationData: any = {};

  // View toggle properties
  currentView: 'table' | 'map' = 'map';

  // Route status for conditional button display
  routeStatus: string = '';
  isFromCompletedRoute: boolean = false;
  isFromNotStartedRoute: boolean = false;
  
  // Button state management for route modifications
  hasRouteChanges: boolean = false;
  showRecalculateButton: boolean = false;
  showCreateRouteButton: boolean = false;
  approveRouteDisabled: boolean = false;
  recalculateRouteDisabled: boolean = false;
  mapRouteData: any[] = [];
  startingPointDetails: any;
  
  constructor(private router: Router, private locationService: LocationService, private routeService: RouteService, private toastService: ToastService, private warehouseService: WarehouseService) { }

  ngOnInit(): void {
    // Check if data was passed from navigation using history.state
    const state = history.state;
    this.routeCreationData = state.routeData || {};
    this.routeStatus = this.routeCreationData.status || '';
    // Check if data comes from create-route (selectedLocations)
    if (this.routeCreationData['selectedDriver'] || this.routeCreationData.driverName != "") {
      this.prepareLocationData(state.selectedLocations || state.routeData.routeStops);
      this.startPoint = this.routeCreationData?.startPoint || '';
      if (this.selectedLocations.length > 0) {
        this.totalStops = this.selectedLocations.length;
      }      
      // Check if we're coming from a completed route
      this.isFromCompletedRoute = this.routeStatus.toLowerCase() === 'completed';
      
      // Check if we're coming from a not started route
      this.isFromNotStartedRoute = this.routeStatus.toLowerCase() === 'not started';
    }
    this.getWareHouseById(this.routeCreationData?.warehouseId);
    this.updatePagination();
    this.driverName = this.routeCreationData.selectedDriver || this.routeCreationData.driverName || '';
    this.deliveryDate = this.routeCreationData.selectedDate || this.routeCreationData.shippingDate || new Date().toISOString().slice(0, 10).split('-').reverse().join('-');
    // Initialize button states
    this.initializeButtonStates();
    this.loadLocationsDetails();    
  }

  // UI-only formatter: returns MM-DD-YYYY for display, without modifying stored data
  formatToMMDDYYYY(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const s = dateStr.trim();

    // 1) Numeric dd-mm-yyyy or dd/mm/yyyy
    const numericDMY = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if (numericDMY) {
      const day = String(parseInt(numericDMY[1], 10)).padStart(2, '0');
      const month = String(parseInt(numericDMY[2], 10)).padStart(2, '0');
      const year = numericDMY[3];
      return `${month}-${day}-${year}`;
    }

    // 2) Match formats like '4th Feb 2026' or '4 Feb-2026' (handle ordinals)
    const dmMatch = s.match(/^(\d{1,2})(?:st|nd|rd|th)?[-\/\s,]*(\w+)[-\/\s,]*(\d{4})$/i);
    if (dmMatch) {
      const dayPart = dmMatch[1];
      const monthPart = dmMatch[2];
      const yearPart = dmMatch[3];

      // Try numeric month
      const monthNum = parseInt(monthPart, 10);
      let mm = '';
      if (!isNaN(monthNum)) {
        mm = String(monthNum).padStart(2, '0');
      } else {
        // map textual month to number
        const m = monthPart.toLowerCase();
        const monthMap: { [key: string]: number } = {
          jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
          apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
          aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10, october: 10,
          nov: 11, november: 11, dec: 12, december: 12
        };
        mm = monthMap[m] ? String(monthMap[m]).padStart(2, '0') : '00';
      }

      const dd = String(parseInt(dayPart, 10)).padStart(2, '0');
      return `${mm}-${dd}-${yearPart}`;
    }

    // 3) yyyy-mm-dd or yyyy/mm/dd
    const ymd = s.split(/[-\/]/);
    if (ymd.length === 3) {
      if (ymd[0].length === 4) {
        const yyyy = ymd[0];
        const mm = String(parseInt(ymd[1], 10)).padStart(2, '0');
        const dd = String(parseInt(ymd[2], 10)).padStart(2, '0');
        return `${mm}-${dd}-${yyyy}`;
      }
      if (ymd[2].length === 4) {
        // assuming dd-mm-yyyy
        const yyyy = ymd[2];
        const mm = String(parseInt(ymd[1], 10)).padStart(2, '0');
        const dd = String(parseInt(ymd[0], 10)).padStart(2, '0');
        return `${mm}-${dd}-${yyyy}`;
      }
    }

    // 4) Last resort: try Date parsing
    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) {
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      const yyyy = parsed.getFullYear();
      return `${mm}-${dd}-${yyyy}`;
    }

    // If all else fails, return original
    return dateStr;
  }

  getWareHouseById(warehouseId: number) {
    this.warehouseService.getWarehouseById(warehouseId).subscribe({
      next: (res: any) => {
        console.log('Warehouse Details:', res);
        this.startingPointDetails = res;
        this.startingPointDetails.fullAddress = (res?.addressLine1 || "") + ", " + (res?.addressLine2 || "") + ", " + (res?.city || "") + ", " + (res?.state || "") + ", " + (res?.zipCode || "");
      },
      error: (err: any) => {
        this.toastService.error('Error', 'Failed to get Warehouse details');
        this.isLoading = false;
        alert('Failed to get Warehouse details. Please try again.');
      }
    });
  }

  prepareLocationData(selectedLocations: any) {
    const locationData: any[] = [];

    //Prepare Location data 
    selectedLocations?.forEach((loc: any, index: number) => {
      let shippingInventory = loc.shippingInventory;
      shippingInventory.map((x: any) => x.restockRequestId = loc.restockRequestId || loc.requestId);
      shippingInventory.map((x: any) => x.routeStopId = loc.id || 0);

      // Check if location already exists in locationData
      const existingLocation = locationData.find(l => l.locationId === loc.locationId && l.type == loc.type);

      if (existingLocation) {
        // Location exists, only add shipping inventory
        existingLocation.shippingInventory = [
          ...(existingLocation.shippingInventory || []),
          ...shippingInventory
        ];
      } else {
        // Location doesn't exist, add new entry
        locationData.push({
          stop: `Stop ${locationData.length + 1}`,
          driverId: loc.driverId,
          driverName: loc.driverName,
          locationAddress: loc.locationAddress,
          locationId: loc.locationId,
          locationInventory: loc.locationInventory,
          locationName: loc.locationName,
          status: loc.status,
          userId: loc.userId,
          userName: loc.userName,
          shippingInventory: shippingInventory,
          type: loc.type,
          deliveryOTP: loc.deliveryOTP || '',
          fullAddress: loc.address || '',
          requestId: loc.requestId,
        });
      }
    });
    this.selectedLocations = locationData;
    //End
  }

  private initializeButtonStates() {
    // Reset all button states to default
    this.hasRouteChanges = false;
    this.showRecalculateButton = false;
    this.showCreateRouteButton = false;
    this.approveRouteDisabled = false;
    this.recalculateRouteDisabled = false;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openInventoryModal(route: routeDetail) {
    this.productDetails = route.locationInventoryData || [];
    this.modalTitle = 'Inventory Items';
    this.isModalFromLocationPopup = false; // Ensure flag is false for regular modals
    this.showModal = true;
    this.productDisplayedColumns = ['productName', 'skuCode', 'variantName', 'quantity'];
  }

  openShippingModal(route: routeDetail) {
    this.productDetails = route.shippingInventoryData || [];
    this.modalTitle = 'Shipping Items';
    this.isModalFromLocationPopup = false; // Ensure flag is false for regular modals
    this.showModal = true;
  // this.productDisplayedColumns = ['productName', 'skuCode', 'variantName', 'quantity', 'inStock'];
  this.productDisplayedColumns = ['productName', 'skuCode', 'variantName', 'quantity'];
  }

  closeModal() {
    this.showModal = false;
    this.isModalFromLocationPopup = false; // Reset flag when closing modal
  }

  openLocationModal() {
    // If we're currently viewing the map, delegate opening the add-location modal to the map component
    if (this.currentView === 'map' && this.routeMapComponent) {
      try {
        this.routeMapComponent.openAddStopModal();
        return;
      } catch (err) {
        console.warn('Failed to open add-stop modal on RouteMapComponent, falling back to parent modal', err);
      }
    }

    // Sample assigned locations data - locations with assigned drivers
    this.assignedLocations = this.selectedLocations;
  
    // Initialize with assigned locations by default
    this.locationViewType = 'assigned';
    this.customers = this.driverLocations;
    this.updateAllSelectedState();
    this.showLocationModal = true;
  }

  closeLocationModal() {
    this.showLocationModal = false;
  }

  toggleCustomerSelection(customer: Customer) {
    customer.selected = !customer.selected;
    if (customer.selected) {
      this.selectedCustomers.push(customer);
    } else {
      this.selectedCustomers = this.selectedCustomers.filter(c => c.id !== customer.id);
    }
    this.updateAllSelectedState();
  }

  toggleSelectAll() {
    this.allSelected = !this.allSelected;
    this.customers.forEach(customer => {
      customer.selected = this.allSelected;
    });

    if (this.allSelected) {
      this.selectedCustomers = [...this.customers];
    } else {
      this.selectedCustomers = [];
    }
  }

  updateAllSelectedState() {
    this.allSelected = this.customers.length > 0 && this.customers.every(customer => customer.selected);
  }

  createLocation() {
    // Handle create location logic here
    this.dataSource.data = []; // Ensure data source is updated
    this.allLocations.filter(x => x.selected).forEach((customer, index) => {
      const newStop: any = {
        stop: `Stop ${this.dataSource.data.length + index + 1}`,
        deliveryDate: new Date().toISOString().split('T')[0],
        locationName: customer.locationName,
        locationInventory: customer.locationInventory || `0 Items`,
        locationInventoryData: customer.locationInventoryData || [],
        shippingInventoryData: customer.shippingInventoryData || [],
        shippingInventory: customer.shippingInventory || `0 Items`,
        distance: '0 Miles', // Will be calculated
        travelTime: '0 hr', // Will be calculated
        deliveryTime: 'TBD',
        id: customer.id,
        locationId: customer.id,
        fullAddress: customer.fullAddress
      };
          
      this.dataSource.data.push(newStop);
    });
    this.selectedCustomers = [];
    
    this.closeLocationModal();
  }

  // Radio button change handler
  onLocationViewChange(viewType: 'assigned' | 'all') {
    this.locationViewType = viewType;
    if (viewType === 'assigned') {
      this.customers = this.assignedLocations;
    } else {
      this.customers = this.allLocations;
    }
    this.selectedCustomers = [];
    this.updateAllSelectedState();
  }

  // Location modal inventory handlers
  openLocationInventoryModal(customer: Customer, event: Event) {
    event.stopPropagation(); // Prevent row selection toggle
    
    // Sample product data for location inventory - in real app, this would come from API based on customer.id
    this.productDetails = [];
    this.modalTitle = `Location Inventory - ${customer.locationName}`;
    this.isModalFromLocationPopup = true; // Set flag for higher z-index
    this.showModal = true;
    this.productDisplayedColumns = ['productName', 'skuCode', 'size', 'side', 'colour', 'quantity'];
  }

  openLocationShippingModal(customer: Customer, event: Event) {
    event.stopPropagation(); // Prevent row selection toggle
    
    // Sample product data for shipping inventory - in real app, this would come from API based on customer.id
    this.productDetails = []
    this.modalTitle = `Shipping Inventory - ${customer.locationName}`;
    this.isModalFromLocationPopup = true; // Set flag for higher z-index
    this.showModal = true;
    this.productDisplayedColumns = ['productName', 'skuCode', 'size', 'side', 'colour', 'quantity', 'inStock'];
  }

  openApprovalModal() {
    this.showApprovalModal = true;
  }

  closeApprovalModal() {
    this.showApprovalModal = false;
  }

  approveRoute() {
    this.saveRoute("Not Started");
  }

  saveRoute(statusType: string) {
    // If map view is active, ensure latest route data from map is synced before approving
    if (this.currentView === 'map' && this.routeMapComponent) {
      this.syncWithRouteMapData(this.routeMapComponent.routeStops);
    }
    let routes: any[] = [];
    this.dataSource.data.forEach((route: any) => {
      // Get distinct restockRequestIds
      let restockIds = [...new Set(route?.shippingInventoryData.map((x: any) => x.restockRequestId))];

      //Check for the Followup or FollowupRequest type
      if (restockIds.length == 0) {
        restockIds = route?.type?.toLowerCase() == "followuprequest" ? [route.requestId] : [];
      }
      //
      
      let matchedData: any = this.allLocations.find(loc => route.locationId == loc.id);
      let address = matchedData ? matchedData.addressLine1 + ', ' + matchedData.addressLine2 + ', ' + matchedData.state + ' ' + matchedData.zipCode : '';
      
      // Loop through each distinct restockRequestId and create a route entry
      restockIds.forEach((restockId: any) => {
        //check if followup request already exists in routes then remove it
        if (!(route?.type?.toLowerCase() == "followuprequest" && routes.filter((id: any) => id.followupRequestId === restockId).length > 0)) {
          routes.push({
            id: route?.shippingInventoryData.filter((x: any) => x.restockRequestId == restockId)?.[0]?.routeStopId || 0,
            locationId: route.locationId,
            stopOrder: Number(route.stop.replace('Stop ', '').trim()),
            address: address,
            customerId: matchedData ? matchedData.customerId : '',
            contactPhone: matchedData ? (matchedData?.contactPhone ? matchedData.contactPhone : (matchedData.locationPhone || '')) : '',
            notes: '',
            restockRequestId: route?.type?.toLowerCase() != "followuprequest" ? restockId : 0,
            followupRequestId: route?.type?.toLowerCase() == "followuprequest" ? restockId : 0,
            latitude: route ? route.latitude : 0,
            longitude: route ? route.longitude : 0,
            distance: route.distance || '0 Miles',
          });
        }        
      });
    });
    const payload: any = {
      userId: this.routeCreationData.selectedDriverId || this.routeCreationData.driverId || 0,
      deliveryDate: this.convertToISO(this.deliveryDate),
      status: statusType,
      routeStops: routes
    }

    // Call API to create route
    this.isLoading = true;
    this.routeService.createRoute((this.routeCreationData.id || 0), payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.toastService.success('Success', 'Route created successfully');
        this.router.navigate(['/routes']);
        this.closeApprovalModal();
        // if (statusType === 'Draft') {
        //   // Navigate to create route or perform route creation logic
        //   this.router.navigate(['/create-route'], { 
        //     state: { 
        //       routeData: this.routeCreationData,
        //       selectedLocations: this.dataSource.data 
        //     } 
        //   });
        //   console.log('Create route clicked');
        // }
      },
      error: (err: any) => {
        this.toastService.error('Error', 'Failed to create route');
        this.isLoading = false;
        alert('Failed to create route. Please try again.');
      }
    });
  }

  convertToISO(dateStr: string): string {
    // const [day, month, year] = dateStr.split('-').map(Number);
    // const date = new Date(year, month - 1, day);
    // return date.toISOString();
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  rejectApproval() {
    // Handle rejection logic here
    console.log('Route approval rejected');
    this.closeApprovalModal();
  }

  // Method to check if action buttons should be shown (only for Draft status)
  shouldShowActionButtons(): boolean {
    return this.routeStatus === 'Draft' || this.routeStatus === 'Not Started' || this.routeStatus === '';
  }

  // Method to get distance tooltip text
  getDistanceTooltip(currentRoute: routeDetail): string {
    const currentData = this.dataSource.data;
    const currentIndex = currentData.findIndex(route => route.stop === currentRoute.stop);
    
    // For the first row (index 0), show distance from starting point to Stop 1
    if (currentIndex === 0) {
      const distance = currentRoute.distance || 'N/A';
      return `Distance from ${this.startPoint} to ${this.truncateLocation(currentRoute.locationName)}: ${distance}`;
    }
    // For middle rows, show distance from current stop to next stop
    else if (currentIndex > 0) {
      const fromRoute = currentData[currentIndex - 1]
      const nextRoute = currentData[currentIndex];
      const distance = currentRoute.distance || 'N/A';
      return `Distance from ${this.truncateLocation(fromRoute.locationName)} to ${this.truncateLocation(nextRoute.locationName)}: ${distance}`;
    }    
    const distance = currentRoute.distance || 'Unknown distance';
    return `Current location: ${this.truncateLocation(currentRoute.locationName)} - Distance: ${distance}`;
  }

  private truncateLocation(location: string): string {
    if (location.length > 25) {
      return location.substring(0, 25) + '...';
    }
    return location;
  }

  // Calculate distance between two coordinates using Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3958.8; // Radius of Earth in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Process stops and calculate distances
  private processStopsWithDistances(stops: any[]): any[] {
    if (!stops || stops.length === 0) return [];

    return stops.map((stop, index) => {
      let distance = '0 Miles';
      
      if (index > 0) {
        const prevStop = stops[index - 1];
        const currentLat = stop.address?.latitude;
        const currentLon = stop.address?.longitude;
        const prevLat = prevStop.address?.latitude;
        const prevLon = prevStop.address?.longitude;
        
        if (currentLat && currentLon && prevLat && prevLon) {
          const distanceValue = this.calculateDistance(prevLat, prevLon, currentLat, currentLon);
          distance = `${distanceValue} Miles`;
        }
      }
      
      return {
        ...stop,
        calculatedDistance: distance
      };
    });
  }

  // Update table data from optimized stops
  private updateTableDataFromStops(stops: any[]): void {
    if (!stops || stops.length === 0) return;

    const tableData: routeDetail[] = stops.map((stop, index) => {
      const matchedLocation = this.allLocations.filter(x => !this.startingPointDetails.fullAddress?.includes(x?.fullAddress)).find(loc => 
        loc.fullAddress?.includes(stop.address?.addressLineOne)
      );

      return {
        stop: `Stop ${index + 1}`,
        deliveryDate: this.deliveryDate || new Date().toISOString().split('T')[0],
        locationName: stop.address?.addressLineOne || matchedLocation?.locationName || `Location ${index + 1}`,
        locationInventory: matchedLocation?.locationInventory || '0 Items',
        locationInventoryData: matchedLocation?.locationInventoryData || [],
        shippingInventoryData: matchedLocation?.shippingInventoryData || [],
        shippingInventory: matchedLocation?.shippingInventory || '0 Items',
        distance: stop.calculatedDistance || '0 Miles',
        travelTime: '0 hr', // Will be calculated if available from API
        deliveryTime: 'TBD',
        status: 'Pending',
        id: matchedLocation?.id,
        fullAddress: `${stop.address?.addressLineOne}, ${stop.address?.addressLineTwo}`,
        latitude: stop.address.latitude,
        longitude: stop.address.longitude
      };
    });

    this.dataSource.data = tableData;
    tableData.forEach((route, idx) => {
      if (this.routeMapComponent.routeStops.filter((x: any) => x.locationId === route.id)) {
        this.routeMapComponent.routeStops.filter((x: any) => x.locationId === route.id)[0].distance = route.distance;
      }
    });
    this.updatePagination();
    
    // Calculate total distance
    const totalDistanceValue = this.mapRouteData?.reduce((sum, stop, index) => {
      if (index > 0 && stop.calculatedDistance) {
        const distValue = parseFloat(stop.calculatedDistance.replace(' Miles', ''));
        return sum + (isNaN(distValue) ? 0 : distValue);
      }
      return sum;
    }, 0);
    
    this.totalDistance = `${Math.round(totalDistanceValue * 10) / 10} Miles`;
    this.totalStops = stops.length;
    
    // Reset button states after successful recalculation
    this.hasRouteChanges = false;
    this.updateButtonStates();
    this.recalculateRouteDisabled = false;
    this.showCreateRouteButton = true;
  }

  // View toggle methods
  switchView(view: 'table' | 'map') {
    this.currentView = view;
    
    // When switching to table view, sync data from route-map component
    if (view === 'table' && this.routeMapComponent) {
      // this.syncWithRouteMapData(this.routeMapComponent.routeStops);
      this.syncWithRouteMapData(this.dataSource.data);
    }
  }

  // Status styling methods
  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'Delivered': 'status-completed',
      'Completed': 'status-completed',
      'InComplete': 'status-inComplete',
      'In Progress': 'status-in-progress',
      'Not Started': 'status-not-started',
      'Pending': 'status-pending',
      'Draft': 'status-draft',
      'Not-delivered': 'status-inComplete',
      'Not Delivered': 'status-inComplete',
    };
    return classMap[status] || status;
  }

  getDisplayStatus(originalStatus: string): string {
    // If we're coming from a completed route, all stops show as "Completed"
    if (this.isFromCompletedRoute) {
      // return 'Delivered';
      return originalStatus == 'delivered' ? 'Delivered' : 'Not-delivered';
    }
    
    // If we're coming from a not started route, all stops should show as "Pending"
    if (this.isFromNotStartedRoute) {
      return 'Pending';
    }
    
    // For other route statuses, return the original status
    return originalStatus || 'Not Started';
  }

  // Method to get overall route completion status
  getOverallRouteStatus(): string {
    if (!this.isFromCompletedRoute) {
      return this.routeStatus;
    }
    
    // If coming from completed route, overall status is always "Completed"
    return 'Delivered';
  }

  // Route modification methods
  deleteRoute(route: routeDetail) {
    // Remove route from data source
    const currentData = this.dataSource.data;
    const updatedData = currentData.filter(r => r.stop !== route.stop);
    this.dataSource.data = updatedData;
    this.driverLocations.map(loc => loc.selected = this.dataSource.data.find(stop => stop.id === loc.id) ? true : false);
    this.allLocations.map(loc => loc.selected = this.dataSource.data.find((stop: any) => stop.locationId === loc.id) ? true : false);
    this.updatePagination();
    // Update button states
    this.hasRouteChanges = true;
    this.totalStops = this.dataSource.data.length;
    this.updateButtonStates();
    
    console.log('Route deleted:', route);
  }

  recalculateRoute() {
    // If we're viewing the map, make sure we sync the latest map stops into the table / route data
    if (this.currentView === 'map' && this.routeMapComponent) {
      this.syncWithRouteMapData(this.routeMapComponent.routeStops);
    }

    // Disable recalculate button while request is in-flight
    this.recalculateRouteDisabled = true;
    this.showRecalculateButton = false;
    this.showCreateRouteButton = false;

    const dateStr = this.deliveryDate;
    const [day, month, year] = dateStr.split('-');

    const isoString = new Date(`${year}-${month}-${day}`).toISOString();

    // Build payload for circuit computation based on current stops
    const payload: any = {
      userId: this.routeCreationData.driverId || this.routeCreationData.selectedDriverId || null,
      deliveryDate: isoString, //this.deliveryDate ? new Date(this.deliveryDate).toISOString() : null,
      routeStops: this.dataSource.data.map((stop, idx) => ({
        locationId: stop.id,
        stopOrder: idx + 1,
        locationName: stop.locationName
      }))
    };

    // Step 1: create a plan in Spoke
    // const createPlanPayload = {
    //   title: `Plan for ${this.driverName || 'driver'}`,
    //   deliveryDate: payload.deliveryDate,
    //   driverId: payload.userId,
    //   stops: payload.routeStops.map((s: any, idx: number) => ({
    //     locationId: s.locationId,
    //     sequence: idx + 1,
    //     address: s.locationName,
    //     eta: null
    //   }))
    // };

    // Step 1: create a plan in Spoke
    const createPlanPayload = {
      title: `Plan for ${this.driverName || 'driver'}`,
      startDate: payload.deliveryDate,
      month: new Date(payload.deliveryDate).getMonth() + 1,
      year: new Date(payload.deliveryDate).getFullYear(),
      driverIds: ["QOHOmwlwieBQMdYLKwmX"]
    };
    console.log('Creating plan in Spoke with payload:', createPlanPayload);

    this.routeService.createPlan(createPlanPayload).subscribe({
      next: (planRes: any) => {
        console.log('CreatePlan response:', planRes);
        const routeId = planRes?.routeId || planRes?.planId || planRes?.id || null;
        if (!routeId) {
          console.warn('CreatePlan did not return a routeId/planId');
          alert('CreatePlan failed to return a route identifier. See console for details.');
          this.recalculateRouteDisabled = false;
          this.showRecalculateButton = true;
          return;
        }

        let routeStops: any[] = [];
        if (this.startingPointDetails?.fullAddress != "") {
            routeStops.push({
            "address": {
              addressLineOne : this.startingPointDetails?.fullAddress || "",
            }
          });
        }

        routeStops = [
          ...routeStops,
          ...this.dataSource.data.map((stop: any, idx) => ({
            "address": {
              addressLineOne : this.allLocations.find(loc => loc.id === stop.locationId)?.fullAddress || "",
            }
          }))
        ];        

        // Step 2: import stops into the created Spoke route
        
        this.routeService.importStopsToRoute(routeId.replace("plans/", "").trim(), routeStops).subscribe({
          next: (importRes: any) => {
            console.log('ImportStops response:', importRes);

            // Step 3: optimize the route by id on Spoke
            console.log(`Optimizing route ${routeId} in Spoke`);
            this.routeService.optimizeRouteById(routeId.replace("plans/", "").trim(), {}).subscribe({
              next: (optRes: any) => {
                console.log('OptimizeRouteById response:', optRes);

                //Step 4: parse optimized stops and update UI
                this.routeService.getStopDetails(routeId.replace("plans/", "").trim()).subscribe({
                  next: (stopDetailsRes: any) => {
                    let rawStops: any[] = [];
                    rawStops = stopDetailsRes?.stops || [];
                    // routeStops.filter(x => !x?.address?.addressLineOne.includes(this.startingPointDetails?.fullAddress)).forEach(element => {
                    //   if (element.address.addressLineOne.includes(stopDetailsRes?.address?.addressLineOne)) {
                    //     rawStops.push(element);
                    //   }
                      
                    // });
                    // let rawStops = stopDetailsRes?.stops || [];
                    // rawStops = rawStops.slice(1, -1);

                    // Process stops and calculate distances between consecutive stops
                    let finalStops: any[] = [];
                    const stopsWithDistances = this.processStopsWithDistances(rawStops);
                    stopsWithDistances?.filter((x: any) => !this.startingPointDetails?.fullAddress.includes(x?.address?.addressLineOne)).forEach((element: any) => {
                      if (routeStops.filter(x => x?.address?.addressLineOne.includes(element?.address?.addressLineOne)).length > 0) {
                        finalStops.push(element);
                      }
                    });
                    
                    this.mapRouteData = [];
                    /// Stops for getting distance calculation
                    stopsWithDistances?.forEach(element => {
                      if (routeStops?.map(x => x?.address?.addressLineOne)?.filter(x => x?.includes(element?.address?.addressLineOne)).length > 0) {
                        this.mapRouteData.push(element);
                      }                      
                    });


                    // // //Call service Getting distnace value 
                    // this.routeService.getPlanDetails(routeId.replace("plans/", "").trim()).subscribe({
                    //   next: (optRes: any) => {
                    //     console.log('GetPlanDetails response for distance calculation:', optRes);
                    //     let distanceData: any[] = [];
                    //     distanceData = optRes?.stops || [];
                    //   },
                    //   error: (err: any) => {
                    //     console.error('Error optimizing route for distance calculation:', err);
                    //   }
                    // });
                    // //


                    // this.mapRouteData = stopsWithDistances;
                    console.log('StopDetails response with distances:', this.mapRouteData);
                    
                    // Update table data with the calculated distances
                    this.updateTableDataFromStops(finalStops);
                    this.isLoading = false;
                  }
                });          
              },
              error: (optErr: any) => {
                console.error('Error optimizing route by id:', optErr);
                this.isLoading = false;
                alert('Failed to optimize route. See console for details.');
                this.recalculateRouteDisabled = false;
                this.showRecalculateButton = true;
              }
            });
          },
          error: (impErr: any) => {
            console.error('Error importing stops to Spoke route:', impErr);
            alert('Failed to import stops into Spoke. See console for details.');
            this.isLoading = false;
            this.recalculateRouteDisabled = false;
            this.showRecalculateButton = true;
          }
        });
      },
      error: (planErr: any) => {
        console.error('Failed to create plan in Spoke:', planErr);
        alert('Failed to create plan in Spoke. See console for details.');
        this.isLoading = false;
        this.recalculateRouteDisabled = false;
        this.showRecalculateButton = true;
      }
    });
  }

  createRoute() {
    this.saveRoute("Draft");
  }

  private updateButtonStates() {
    if (this.hasRouteChanges) {
      // Enable recalculate button and disable approve button
      this.showRecalculateButton = true;
      this.approveRouteDisabled = true;
      this.recalculateRouteDisabled = false;
      this.showCreateRouteButton = false;
    } else {
      // Default state
      this.showRecalculateButton = false;
      this.approveRouteDisabled = false;
      this.recalculateRouteDisabled = false;
      this.showCreateRouteButton = false;
    }
  }

  // Method to sync data with route-map component
  syncWithRouteMapData(routeStops: any[]): void {
    if (routeStops && routeStops.length > 0) {
      this.routeDetail = routeStops.map((stop, index) => ({
        stop: `Stop ${index + 1}`,
        deliveryDate: new Date().toISOString().split('T')[0], // Current date
        locationName: stop.locationName,
        locationId: stop.locationId,
        customerId: stop.customerId,
        customerName: stop.customerName,
        locationInventory: stop.locationInventory || '0 Items',
        locationInventoryData: stop.locationInventoryData || [],
        shippingInventoryData: stop.shippingInventoryData || [],
        shippingInventory: stop.shippingInventory || '0 Items',
        distance: stop.distance || '0 Miles',
        travelTime: '1 hr', // Default travel time
        deliveryTime: stop.eta || 'N/A',
        status: this.mapRouteStatusToTableStatus(stop.status),
        id: stop.id,
        fullAddress: stop.fullAddress || '',
        type: stop.type || '',
        requestId: stop.requestId || null,
        latitude: this.dataSource?.data?.find(d => d.id === stop.id)?.latitude || 0,
        longitude: this.dataSource?.data?.find(d => d.id === stop.id)?.longitude || 0
      }));
      
      // Update the data source for the table
      this.dataSource.data = this.routeDetail;
      this.updatePagination();
    }
  }

  // Handle route data changes from route-map component
  onRouteDataChanged(routeStops: any[]): void {
    console.log('Route data changed from map view:', routeStops);
    this.syncWithRouteMapData(routeStops);
    // Mark that the route has changed (enables Recalculate) and update button states
    this.hasRouteChanges = true;
    this.totalStops = this.dataSource.data.length;
    this.updateButtonStates();
  }

  // Helper method to map route-map status to table status
  private mapRouteStatusToTableStatus(mapStatus: string): string {
    // If we're coming from a completed route, all stops should be "Completed"
    if (this.isFromCompletedRoute) {
      // return 'Delivered';
      return mapStatus;
    }
    
    // If we're coming from a not started route, all stops should be "Pending"
    if (this.isFromNotStartedRoute) {
      return 'Pending';
    }
    
    const statusMapping: { [key: string]: string } = {
      'delivered': 'Delivered',
      'Delivered': 'Delivered',
      'in-progress': 'In Progress',
      'In Progress': 'In Progress',
      'pending': 'Pending',
      'draft': 'Not Started',
      'Not Delivered': 'Not Delivered',
      'status-inComplete': 'Not Delivered',
    };
    return statusMapping[mapStatus] || 'Not Started';
  }

  updatePagination() {
    const computedOptions = computePageSizeOptions(this.dataSource.data.length);
    this.pageSizeOptions = computedOptions.length ? computedOptions : [25];
  }

  loadLocationsDetails(): void {
    this.isLoading = true;
    this.locationService.getLocationsDetails().subscribe({
      next: (apiLocations: any[]) => {
        apiLocations.map(loc => loc.locationAddress = loc.addressLine1);
        apiLocations.map(loc => loc.driverName = loc.userName);
        apiLocations.map(x => x.shippingInventoryData = x.transferItems);
        apiLocations.map(x => x.shippingInventory = `${x.transferItems.length} Items`);
        apiLocations.map(x => x.locationInventory = `${x.locationInventoryData?.length || 0} Items`);
        apiLocations.map(x => x.locationInventoryData = x.locationInventoryData || []);
        apiLocations.map(x => x.fullAddress = `${x.addressLine1}, ${x.addressLine2}, ${x.state} ${x.zipCode}`);

        this.driverLocations = apiLocations.filter(x => x.userName == this.routeCreationData.selectedDriver);
        this.allLocations = apiLocations;
        this.driverLocations.map(loc => loc.selected = this.selectedLocations.find(stop => stop.locationId === loc.id) ? true : false);
        this.driverLocations.map(loc => loc.shippingInventoryData = apiLocations.find(stop => stop.id === loc.id) ? apiLocations.find(stop => stop.id === loc.id).shippingInventoryData : []);
        this.driverLocations.map(loc => loc.shippingInventory = apiLocations.find(stop => stop.id === loc.id) ? apiLocations.find(stop => stop.id === loc.id).shippingInventoryData.length + ' Items' : '0 Items');
        this.allLocations.map(loc => loc.selected = this.selectedLocations.find(stop => stop.locationId === loc.id) ? true : false);
        this.recalculateRoute();
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error loading locations:', error);
      }
    });
  }
}

