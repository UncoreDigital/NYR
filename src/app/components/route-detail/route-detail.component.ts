// NOTE :- 
// Show Status Column when we click on Map from Route screen (If status is not completed then in all other case show the status in next screen)

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RouteMapComponent } from '../route-map/route-map.component';
import { computePageSizeOptions } from 'src/app/utils/paginator-utils';
import { LocationService } from 'src/app/services/location.service';
import { RouteService } from 'src/app/services/route.service';

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
  showRouteDetail = false;

  // Route summary properties
  totalStops = 3;
  totalDistance = '20 Miles';
  totalTime = '1.5 Hrs';
  deliveryDate = 'Oct 30, 2025';
  driverName = 'John Doe';
  startPoint = 'Warehouse A';

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
  
  constructor(private router: Router, private location: Location, private locationService: LocationService, private routeService: RouteService) { }

  ngOnInit(): void {
    // Check if data was passed from navigation using history.state
    const state = history.state;
    console.log('Navigation state:', state);
    this.routeCreationData = state.routeData || {};
    const routeData = state.routeData;
    this.routeStatus = routeData.status || '';
    // Check if data comes from create-route (selectedLocations)
    if (state.routeData['selectedDriver']) {
      this.selectedLocations = state.selectedLocations || [];
      this.selectedLocations.map(location => location.travelTime = '1 hr');
      console.log('Received selected locations:', this.selectedLocations);
      console.log('Received route data:', this.routeCreationData);
      
      // Convert selected locations to route detail format
      this.convertSelectedLocationsToRouteDetail();
    // } 
    // // Check if data comes from routes table (routeData)
    // else if (state && state.routeData) {
      
      
      // Check if we're coming from a completed route
      this.isFromCompletedRoute = this.routeStatus.toLowerCase() === 'completed';
      
      // Check if we're coming from a not started route
      this.isFromNotStartedRoute = this.routeStatus.toLowerCase() === 'not started';
      
      console.log('Received route data from routes table:', routeData);
      console.log('Route status:', this.routeStatus);
      console.log('Is from completed route:', this.isFromCompletedRoute);
      console.log('Is from not started route:', this.isFromNotStartedRoute);
      
      // Use default data but update with received route info
      // this.dataSource.data = this.routeDetail;
      this.updatePagination();
    } 
    else {
      // Fallback to default data if no navigation state
      console.log('No navigation state found, using default data');
      // this.dataSource.data = this.routeDetail;
      this.updatePagination();
    }
    this.driverName = this.routeCreationData.selectedDriver || this.routeCreationData.driverName || '';
    this.deliveryDate = this.routeCreationData.selectedDate || this.routeCreationData.shippingDate || new Date().toISOString().slice(0, 10).split('-').reverse().join('-');
    // Initialize button states
    this.initializeButtonStates();
    this.loadLocationsDetails();
  }

  private initializeButtonStates() {
    // Reset all button states to default
    this.hasRouteChanges = false;
    this.showRecalculateButton = false;
    this.showCreateRouteButton = false;
    this.approveRouteDisabled = false;
    this.recalculateRouteDisabled = false;
  }

  convertSelectedLocationsToRouteDetail() {
    if (this.selectedLocations.length > 0) {
      const convertedData = this.selectedLocations.map((location, index) => ({
        stop: `Stop ${index + 1}`,
        deliveryDate: location.shippingDate || this.routeCreationData.selectedDate || '2023-10-01',
        locationName: location.locationName,
        locationInventory: '0 Items', // Default value - could be calculated based on location data
        shippingInventory: '0 Items',   // Default value - could be calculated based on location data
        travelTime: location.travelTime || '1 hr',
        deliveryTime: '12 PM',     // Default value - could be calculated based on location data
        distance: location.distance || `${(index + 1) * 3 + Math.floor(Math.random() * 5)} Miles`, // Generate realistic distances
        status: location.status || 'Not Started' // Default status for new routes
      }));
      
      // this.dataSource.data = convertedData;
      this.updatePagination();
      
      // Update route summary based on selected locations
      this.totalStops = this.selectedLocations.length;
      this.totalDistance = `${this.selectedLocations.length * 5} Miles`; // Estimated
      this.totalTime = `${this.selectedLocations.length * 0.5} Hrs`;     // Estimated
    } else {
      // this.dataSource.data = this.routeDetail;
      this.updatePagination();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openInventoryModal(route: routeDetail) {
    // Sample product data - in real app, this would come from API
    this.productDetails = [];
    this.modalTitle = 'Inventory Items';
    this.isModalFromLocationPopup = false; // Ensure flag is false for regular modals
    this.showModal = true;
    this.productDisplayedColumns = ['productName', 'skuCode', 'size', 'side', 'colour', 'quantity'];
  }

  openShippingModal(route: routeDetail) {
    // Sample product data for shipping items - in real app, this would come from API
    this.productDetails = route.shippingInventoryData || [];
    this.modalTitle = 'Shipping Items';
    this.isModalFromLocationPopup = false; // Ensure flag is false for regular modals
    this.showModal = true;
    this.productDisplayedColumns = ['productName', 'skuCode', 'variationType', 'variationValue', 'quantity', 'inStock'];
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
    console.log('Selected customers:', this.selectedCustomers);
    const selectedCustomers = this.selectedCustomers;
    this.dataSource.data = []; // Ensure data source is updated
    this.allLocations.filter(x => x.selected).forEach((customer, index) => {
      const newStop: routeDetail = {
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
    this.productDetails = [
      {
        productName: 'Ankle Support Wrap',
        skuCode: 'MD-004',
        size: 'S',
        side: 'Universal',
        colour: 'White',
        quantity: 5,
        inStock: 8
      },
      {
        productName: 'Elbow Compression Band',
        skuCode: 'MD-005',
        size: 'L',
        side: 'Right',
        colour: 'Gray',
        quantity: 3,
        inStock: 7
      },
      {
        productName: 'Wrist Stabilizer',
        skuCode: 'MD-006',
        size: 'M',
        side: 'Left',
        colour: 'Black',
        quantity: 4,
        inStock: 12
      }
    ];
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
    // If map view is active, ensure latest route data from map is synced before approving
    if (this.currentView === 'map' && this.routeMapComponent) {
      this.syncWithRouteMapData(this.routeMapComponent.routeStops);
    }
    let routes: any[] = [];
    this.dataSource.data.forEach((route: any) => {
      let matchedData: any = this.allLocations.find(loc => route.id == loc.id);
      let address = matchedData ? matchedData.addressLine1 + ', ' + matchedData.addressLine2 + ', ' + matchedData.state + ' ' + matchedData.zipCode : '';
      routes.push({
        locationId: route.id,
        stopOrder: Number(route.stop.replace('Stop ', '').trim()),
        address: address,
        customerId: matchedData ? matchedData.customerId : '',
        contactPhone: matchedData ? (matchedData?.contactPhone ? matchedData.contactPhone : (matchedData.locationPhone || '')) : '',
        notes: '',
        restockRequestId: route?.type?.toLowerCase() != "followuprequest" ? route.requestId : 0,
        followupRequestId: route?.type?.toLowerCase() == "followuprequest" ? route.requestId : 0,
      });
    });
    const payload: any = {
      userId: this.routeCreationData.selectedDriverId || 0,
      deliveryDate: new Date(this.deliveryDate).toISOString(),
      routeStops: routes,
    }

    // Call API to create route
    this.routeService.createRoute(payload).subscribe({
      next: (res: any) => {
        // On success, navigate to route-detail (or routes list) with created info
        // console.log('Route created successfully', res);
        // this.router.navigate(['/route-detail'], {
        //   state: {
        //     selectedLocations: this.dataSource.data,
        //     routeData: {
        //       selectedDate: this.selectedDate,
        //       selectedDriver: this.selectedDriverName,
        //       totalLocations: this.dataSource.data.length,
        //       apiResponse: res
        //     }
        //   }
        // });
        // Handle route approval logic here
        this.router.navigate(['/routes']);
        this.closeApprovalModal();
      },
      error: (err: any) => {
        console.error('Error creating route:', err);
        alert('Failed to create route. Please try again.');
      }
    });
  }

  rejectApproval() {
    // Handle rejection logic here
    console.log('Route approval rejected');
    this.closeApprovalModal();
  }


  openRouteDetail() {
    this.showRouteDetail = true;
  }

  closeRouteDetail() {
    this.showRouteDetail = false;
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
    // // For the last row, show it's the final destination
    // else if (currentIndex === currentData.length - 1) {
    //   return `Final destination: ${this.truncateLocation(currentRoute.location)} - No further stops`;
    // }
    
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
      const matchedLocation = this.allLocations.find(loc => 
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
        fullAddress: `${stop.address?.addressLineOne}, ${stop.address?.addressLineTwo}`
      };
    });

    this.dataSource.data = tableData;
    this.updatePagination();
    
    // Calculate total distance
    const totalDistanceValue = stops.reduce((sum, stop, index) => {
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
      this.syncWithRouteMapData(this.routeMapComponent.routeStops);
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
    this.allLocations.map(loc => loc.selected = this.dataSource.data.find(stop => stop.id === loc.id) ? true : false);
    this.updatePagination();
    // Update button states
    this.hasRouteChanges = true;
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

    // Build payload for circuit computation based on current stops
    const payload: any = {
      userId: this.routeCreationData.selectedDriverId || null,
      deliveryDate: this.deliveryDate ? new Date(this.deliveryDate).toISOString() : null,
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
        
        const routeStops = this.dataSource.data.map((stop, idx) => ({
          "address": {
            addressLineOne : this.allLocations.find(loc => loc.id === stop.id)?.fullAddress || "",
          }
        }));

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
                    const rawStops = stopDetailsRes?.stops || [];
                    
                    // Process stops and calculate distances between consecutive stops
                    const stopsWithDistances = this.processStopsWithDistances(rawStops);
                    
                    this.mapRouteData = stopsWithDistances;
                    console.log('StopDetails response with distances:', this.mapRouteData);
                    
                    // Update table data with the calculated distances
                    this.updateTableDataFromStops(stopsWithDistances);
                  }
                });
                // Try to find optimized stops in response
                // const stopsArray = Array.isArray(optRes?.optimizedStops) ? optRes.optimizedStops
                //   : Array.isArray(optRes?.routeStops) ? optRes.routeStops
                //   : Array.isArray(optRes?.stops) ? optRes.stops
                //   : Array.isArray(optRes) ? optRes : null;

                // if (stopsArray && Array.isArray(stopsArray)) {
                //   const mapped = stopsArray.map((s: any, i: number) => ({
                //     stop: `Stop ${i + 1}`,
                //     deliveryDate: s.deliveryDate || this.deliveryDate || new Date().toISOString().split('T')[0],
                //     locationName: s.locationName || s.address || s.customerName || `Location ${i + 1}`,
                //     locationInventory: s.locationInventory || '0 Items',
                //     locationInventoryData: s.locationInventoryData || s.items || [],
                //     shippingInventoryData: s.shippingInventoryData || s.items || [],
                //     shippingInventory: s.shippingInventory || (s.items ? `${s.items.length} Items` : '0 Items'),
                //     distance: s.distance || s.driveDistance || '0 Miles',
                //     travelTime: s.travelTime || s.driveTime || '0 hr',
                //     deliveryTime: s.eta || s.deliveryTime || 'TBD',
                //     status: this.mapRouteStatusToTableStatus(s.status || s.stage || ''),
                //     id: s.locationId || s.id || null
                //   }));

                //   // Update table datasource and pagination
                //   this.dataSource.data = mapped;
                //   this.updatePagination();

                //   // Update map component if available
                //   if (this.routeMapComponent) {
                //     try {
                //       this.routeMapComponent.routeStops = mapped.map(m => ({
                //         locationName: m.locationName,
                //         eta: m.deliveryTime,
                //         items: (m.locationInventoryData || []).length,
                //         status: m.status && m.status.toLowerCase().includes('deliv') ? 'delivered' : 'pending',
                //         distance: m.distance,
                //         locationInventory: m.locationInventory,
                //         shippingInventory: m.shippingInventory,
                //         id: m.id
                //       }));
                //       this.routeMapComponent.routeDataChanged.emit(this.routeMapComponent.routeStops);
                //     } catch (err) {
                //       console.warn('Failed to update RouteMapComponent with optimized circuit', err);
                //     }
                //   }

                //   this.hasRouteChanges = false;
                //   this.updateButtonStates();
                //   this.recalculateRouteDisabled = false;
                //   this.showCreateRouteButton = true;
                // } else {
                //   console.warn('Optimize response did not include stops array:', optRes);
                //   alert('Optimize returned unexpected response. Check console.');
                //   this.recalculateRouteDisabled = false;
                //   this.showRecalculateButton = true;
                // }
              },
              error: (optErr: any) => {
                console.error('Error optimizing route by id:', optErr);
                alert('Failed to optimize route. See console for details.');
                this.recalculateRouteDisabled = false;
                this.showRecalculateButton = true;
              }
            });
          },
          error: (impErr: any) => {
            console.error('Error importing stops to Spoke route:', impErr);
            alert('Failed to import stops into Spoke. See console for details.');
            this.recalculateRouteDisabled = false;
            this.showRecalculateButton = true;
          }
        });
      },
      error: (planErr: any) => {
        console.error('Failed to create plan in Spoke:', planErr);
        alert('Failed to create plan in Spoke. See console for details.');
        this.recalculateRouteDisabled = false;
        this.showRecalculateButton = true;
      }
    });
  }

  createRoute() {
    // Navigate to create route or perform route creation logic
    this.router.navigate(['/create-route'], { 
      state: { 
        routeData: this.routeCreationData,
        selectedLocations: this.dataSource.data 
      } 
    });
    console.log('Create route clicked');
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
        locationInventory: stop.locationInventory || '0 Items',
        locationInventoryData: [],
        shippingInventoryData: stop.locationInventoryData || [],
        shippingInventory: stop.shippingInventory || '0 Items',
        distance: stop.distance || '0 Miles',
        travelTime: '1 hr', // Default travel time
        deliveryTime: stop.eta || 'N/A',
        status: this.mapRouteStatusToTableStatus(stop.status),
        id: stop.id,
        fullAddress: stop.fullAddress || '',
        type: stop.type || '',
        requestId: stop.requestId || null,
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
    this.locationService.getLocationsDetails().subscribe({
      next: (apiLocations: any[]) => {
        apiLocations.map(loc => loc.locationAddress = loc.addressLine1);
        apiLocations.map(loc => loc.driverName = loc.userName);
        apiLocations.map(x => x.shippingInventoryData = x.transferItems);
        apiLocations.map(x => x.shippingInventory = `${x.transferItems.length} Items`);
        apiLocations.map(x => x.fullAddress = `${x.addressLine1}, ${x.addressLine2}, ${x.state} ${x.zipCode}`);

        this.driverLocations = apiLocations.filter(x => x.userName == this.routeCreationData.selectedDriver);
        this.allLocations = apiLocations;
        this.driverLocations.map(loc => loc.selected = this.selectedLocations.find(stop => stop.id === loc.id) ? true : false);
        this.driverLocations.map(loc => loc.shippingInventoryData = apiLocations.find(stop => stop.id === loc.id) ? apiLocations.find(stop => stop.id === loc.id).shippingInventoryData : []);
        this.driverLocations.map(loc => loc.shippingInventory = apiLocations.find(stop => stop.id === loc.id) ? apiLocations.find(stop => stop.id === loc.id).shippingInventoryData.length + ' Items' : '0 Items');
        this.allLocations.map(loc => loc.selected = this.selectedLocations.find(stop => stop.id === loc.id) ? true : false);
        this.recalculateRoute();
        // this.dataSource.data = this.locations;
        // const computedOptions = computePageSizeOptions(this.dataSource.data.length);
        // this.pageSizeOptions = computedOptions.length ? computedOptions : [25];
        // this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading locations:', error);
        // this.errorMessage = 'Failed to load locations. Please try again.';
        // this.isLoading = false;
      }
    });
  }
}

