// NOTE :- 
// Show Status Column when we click on Map from Route screen (If status is not completed then in all other case show the status in next screen)

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RouteMapComponent } from '../route-map/route-map.component';

export interface routeDetail {
  stop: string;
  deliveryDate: string;
  location: string;
  inventoryItem: string;
  shippingItem: string;
  travelTime?: string;
  deliveryTime?: string;
  distance?: string;
  status?: string;
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
  shippingInventory: string;
  status: string;
  selected: boolean;
}

@Component({
  selector: 'app-route-detail',
  templateUrl: './route-detail.component.html',
  styleUrl: './route-detail.component.css'
})
export class RouteDetailComponent implements OnInit {
  baseColumns: string[] = ['stop', 'location', 'inventoryItem', 'shippingItem', 'distance', 'travelTime', 'deliveryTime'];
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

  // Approval Modal properties
  showApprovalModal = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(RouteMapComponent) routeMapComponent!: RouteMapComponent;

  routeDetail: routeDetail[] = [
    { stop: 'Stop 1', deliveryDate: '2023-10-01', location: 'Howard University', inventoryItem: '2 Items', shippingItem: '2 Items', distance: '5.2 Miles', travelTime: '1 hr', deliveryTime: '10:00 AM', status: 'Pending' },
    { stop: 'Stop 2', deliveryDate: '2023-10-02', location: 'Bryant Street', inventoryItem: '3 Items', shippingItem: '4 Items', distance: '12.8 Miles', travelTime: '2 hr', deliveryTime: '10:30 AM', status: 'In Progress' },
    { stop: 'Stop 3', deliveryDate: '2023-10-03', location: 'District Vet', inventoryItem: '4 Items', shippingItem: '3 Items', distance: '8.3 Miles', travelTime: '0.5 hr', deliveryTime: '11:40 AM', status: 'Completed' },
    { stop: 'Stop 4', deliveryDate: '2023-10-04', location: 'Medical Center', inventoryItem: '5 Items', shippingItem: '2 Items', distance: '15.7 Miles', travelTime: '3 hr', deliveryTime: '1:00 PM', status: 'Not Started' },
  ];
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
  
  constructor(private router: Router, private location: Location) { }

  ngOnInit(): void {
    // Check if data was passed from navigation using history.state
    const state = history.state;
    console.log('Navigation state:', state);
    
    // Check if data comes from create-route (selectedLocations)
    if (state && state.selectedLocations) {
      this.selectedLocations = state.selectedLocations || [];
      this.routeCreationData = state.routeData || {};
      this.selectedLocations.map(location => location.travelTime = '1 hr');
      console.log('Received selected locations:', this.selectedLocations);
      console.log('Received route data:', this.routeCreationData);
      
      // Convert selected locations to route detail format
      this.convertSelectedLocationsToRouteDetail();
    } 
    // Check if data comes from routes table (routeData)
    else if (state && state.routeData) {
      const routeData = state.routeData;
      this.routeStatus = routeData.status || '';
      
      // Check if we're coming from a completed route
      this.isFromCompletedRoute = this.routeStatus.toLowerCase() === 'completed';
      
      // Check if we're coming from a not started route
      this.isFromNotStartedRoute = this.routeStatus.toLowerCase() === 'not started';
      
      console.log('Received route data from routes table:', routeData);
      console.log('Route status:', this.routeStatus);
      console.log('Is from completed route:', this.isFromCompletedRoute);
      console.log('Is from not started route:', this.isFromNotStartedRoute);
      
      // Use default data but update with received route info
      this.dataSource.data = this.routeDetail;
    } 
    else {
      // Fallback to default data if no navigation state
      console.log('No navigation state found, using default data');
      this.dataSource.data = this.routeDetail;
    }
    
    // Initialize button states
    this.initializeButtonStates();
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
        location: location.locationAddress || location.locationName,
        inventoryItem: '2 Items', // Default value - could be calculated based on location data
        shippingItem: '2 Items',   // Default value - could be calculated based on location data
        travelTime: location.travelTime || '1 hr',
        deliveryTime: '12 PM',     // Default value - could be calculated based on location data
        distance: location.distance || `${(index + 1) * 3 + Math.floor(Math.random() * 5)} Miles`, // Generate realistic distances
        status: location.status || 'Not Started' // Default status for new routes
      }));
      
      this.dataSource.data = convertedData;
      
      // Update route summary based on selected locations
      this.totalStops = this.selectedLocations.length;
      this.totalDistance = `${this.selectedLocations.length * 5} Miles`; // Estimated
      this.totalTime = `${this.selectedLocations.length * 0.5} Hrs`;     // Estimated
    } else {
      this.dataSource.data = this.routeDetail;
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
    this.productDetails = [
      {
        productName: 'Pneumatic Walking Boot',
        skuCode: 'MD-001',
        size: 'L',
        side: 'Universal',
        colour: 'Black',
        quantity: 10,
        inStock: 25
      },
      {
        productName: 'Pneumatic Walking Boot',
        skuCode: 'MD-001',
        size: 'L',
        side: 'Universal',
        colour: 'Black',
        quantity: 10,
        inStock: 25
      }
    ];
    this.modalTitle = 'Inventory Items';
    this.isModalFromLocationPopup = false; // Ensure flag is false for regular modals
    this.showModal = true;
    this.productDisplayedColumns = ['productName', 'skuCode', 'size', 'side', 'colour', 'quantity'];
  }

  openShippingModal(route: routeDetail) {
    // Sample product data for shipping items - in real app, this would come from API
    this.productDetails = [
      {
        productName: 'Pneumatic Walking Boot',
        skuCode: 'MD-001',
        size: 'L',
        side: 'Universal',
        colour: 'Black',
        quantity: 10,
        inStock: 25
      },
      {
        productName: 'Pneumatic Walking Boot',
        skuCode: 'MD-001',
        size: 'L',
        side: 'Universal',
        colour: 'Black',
        quantity: 10,
        inStock: 25
      }
    ];
    this.modalTitle = 'Shipping Items';
    this.isModalFromLocationPopup = false; // Ensure flag is false for regular modals
    this.showModal = true;
    this.productDisplayedColumns = ['productName', 'skuCode', 'size', 'side', 'colour', 'quantity', 'inStock'];
  }

  closeModal() {
    this.showModal = false;
    this.isModalFromLocationPopup = false; // Reset flag when closing modal
  }

  openLocationModal() {
    // Sample assigned locations data - locations with assigned drivers
    this.assignedLocations = [
      { id: 1, locationName: 'Downtown Medical Center', locationAddress: '123 Main St, New York, NY 10001', driverName: 'John Smith', locationInventory: '5 Items', shippingInventory: '3 Items', status: 'Ready To Ship', selected: false },
      { id: 2, locationName: 'West Side Clinic', locationAddress: '456 Oak Ave, Los Angeles, CA 90210', driverName: 'Jane Doe', locationInventory: '8 Items', shippingInventory: '6 Items', status: 'Ready To Ship', selected: false },
      { id: 3, locationName: 'Central Hospital', locationAddress: '789 Pine Rd, Chicago, IL 60601', driverName: 'Mike Johnson', locationInventory: '12 Items', shippingInventory: '9 Items', status: 'Ready To Ship', selected: false },
      { id: 4, locationName: 'South Medical Plaza', locationAddress: '321 Elm St, Houston, TX 77001', driverName: 'Sarah Wilson', locationInventory: '6 Items', shippingInventory: '4 Items', status: 'Ready To Ship', selected: false }
    ];

    // Sample all locations data - includes both assigned and unassigned locations
    this.allLocations = [
      { id: 1, locationName: 'Downtown Medical Center', locationAddress: '123 Main St, New York, NY 10001', driverName: 'John Smith', locationInventory: '5 Items', shippingInventory: '3 Items', status: 'Ready To Ship', selected: false },
      { id: 2, locationName: 'West Side Clinic', locationAddress: '456 Oak Ave, Los Angeles, CA 90210', driverName: 'Jane Doe', locationInventory: '8 Items', shippingInventory: '6 Items', status: 'Ready To Ship', selected: false },
      { id: 3, locationName: 'Central Hospital', locationAddress: '789 Pine Rd, Chicago, IL 60601', driverName: 'Mike Johnson', locationInventory: '12 Items', shippingInventory: '9 Items', status: 'Ready To Ship', selected: false },
      { id: 4, locationName: 'South Medical Plaza', locationAddress: '321 Elm St, Houston, TX 77001', driverName: 'Sarah Wilson', locationInventory: '6 Items', shippingInventory: '4 Items', status: 'Ready To Ship', selected: false },
      { id: 5, locationName: 'East Valley Clinic', locationAddress: '654 Maple Dr, Phoenix, AZ 85001', driverName: 'David Brown', locationInventory: '9 Items', shippingInventory: '7 Items', status: 'Ready To Ship', selected: false },
      { id: 6, locationName: 'North Point Medical', locationAddress: '987 Cedar Ln, Philadelphia, PA 19101', driverName: 'Lisa Anderson', locationInventory: '4 Items', shippingInventory: '2 Items', status: 'Ready To Ship', selected: false },
      { id: 7, locationName: 'Riverside Hospital', locationAddress: '147 Birch Way, San Antonio, TX 78201', driverName: 'Tom Garcia', locationInventory: '11 Items', shippingInventory: '8 Items', status: 'Ready To Ship', selected: false },
      { id: 8, locationName: 'Metro Health Center', locationAddress: 'Address Not Available', driverName: 'Not Assigned', locationInventory: '7 Items', shippingInventory: '5 Items', status: 'Follow up', selected: false },
      { id: 9, locationName: 'Community Clinic', locationAddress: '555 Willow St, Dallas, TX 75201', driverName: 'Not Assigned', locationInventory: '3 Items', shippingInventory: '1 Item', status: 'Follow up', selected: false },
      { id: 10, locationName: 'Bay Area Medical', locationAddress: '777 Poplar Ave, Miami, FL 33101', driverName: 'Not Assigned', locationInventory: '6 Items', shippingInventory: '4 Items', status: 'Pending', selected: false }
    ];

    // Initialize with assigned locations by default
    this.locationViewType = 'assigned';
    this.customers = this.assignedLocations;
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
    
    // Add selected customers as new routes to the main table
    if (this.selectedCustomers.length > 0) {
      const currentData = this.dataSource.data;
      const newRoutes: routeDetail[] = this.selectedCustomers.map((customer, index) => ({
        stop: `Stop ${currentData.length + index + 1}`,
        deliveryDate: new Date().toISOString().split('T')[0],
        location: customer.locationAddress,
        inventoryItem: customer.locationInventory,
        shippingItem: customer.shippingInventory,
        distance: '0 Miles', // Will be calculated
        travelTime: '0 hr', // Will be calculated
        deliveryTime: 'TBD',
        status: customer.status
      }));
      
      // Update data source with new routes
      this.dataSource.data = [...currentData, ...newRoutes];
      
      // Mark that route has changes and update button states
      this.hasRouteChanges = true;
      this.updateButtonStates();
      
      console.log('Added new routes:', newRoutes);
    }
    
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
    this.productDetails = [
      {
        productName: 'Pneumatic Walking Boot',
        skuCode: 'MD-001',
        size: 'L',
        side: 'Universal',
        colour: 'Black',
        quantity: 8,
        inStock: 15
      },
      {
        productName: 'Compression Sleeve',
        skuCode: 'MD-002',
        size: 'M',
        side: 'Left',
        colour: 'Blue',
        quantity: 12,
        inStock: 20
      },
      {
        productName: 'Knee Support Brace',
        skuCode: 'MD-003',
        size: 'XL',
        side: 'Right',
        colour: 'Black',
        quantity: 6,
        inStock: 10
      }
    ];
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
    // Handle route approval logic here
    this.router.navigate(['/routes']);
    this.closeApprovalModal();
    // You can add additional logic like showing a success message or updating the route status
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
      return `Distance from ${this.startPoint} to ${this.truncateLocation(currentRoute.location)}: ${distance}`;
    }
    // For middle rows, show distance from current stop to next stop
    else if (currentIndex > 0) {
      const fromRoute = currentData[currentIndex - 1]
      const nextRoute = currentData[currentIndex];
      const distance = currentRoute.distance || 'N/A';
      return `Distance from ${this.truncateLocation(fromRoute.location)} to ${this.truncateLocation(nextRoute.location)}: ${distance}`;
    } 
    // // For the last row, show it's the final destination
    // else if (currentIndex === currentData.length - 1) {
    //   return `Final destination: ${this.truncateLocation(currentRoute.location)} - No further stops`;
    // }
    
    const distance = currentRoute.distance || 'Unknown distance';
    return `Current location: ${this.truncateLocation(currentRoute.location)} - Distance: ${distance}`;
  }

  private truncateLocation(location: string): string {
    if (location.length > 25) {
      return location.substring(0, 25) + '...';
    }
    return location;
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
      'InComplete': 'status-inComplete',
      'In Progress': 'status-in-progress',
      'Not Started': 'status-not-started',
      'Pending': 'status-pending',
      'Draft': 'status-draft',
      'Not-delivered': 'status-inComplete',
    };
    return classMap[status] || 'status-default';
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
    
    // Update button states
    this.hasRouteChanges = true;
    this.updateButtonStates();
    
    console.log('Route deleted:', route);
  }

  recalculateRoute() {
    // Disable recalculate button and enable create route
    this.recalculateRouteDisabled = true;
    this.showRecalculateButton = false;
    this.showCreateRouteButton = true;
    
    console.log('Route recalculated');
    // Here you would typically call an API to recalculate the route
    // For now, we'll just update the UI state
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
        location: stop.location,
        inventoryItem: stop.locationInventory || '0 Items',
        shippingItem: stop.shippingInventory || '0 Items',
        distance: stop.distance || '0 Miles',
        travelTime: '1 hr', // Default travel time
        deliveryTime: stop.eta || 'N/A',
        status: this.mapRouteStatusToTableStatus(stop.status)
      }));
      
      // Update the data source for the table
      this.dataSource.data = this.routeDetail;
      console.log('Synced route data from map to table:', this.routeDetail);
    }
  }

  // Handle route data changes from route-map component
  onRouteDataChanged(routeStops: any[]): void {
    console.log('Route data changed from map view:', routeStops);
    this.syncWithRouteMapData(routeStops);
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
      'in-progress': 'In Progress',
      'pending': 'Pending',
      'draft': 'Not Started'
    };
    return statusMapping[mapStatus] || 'Not Started';
  }
}

