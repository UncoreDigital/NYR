import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

export interface RouteStop {
  location: string;
  eta: string;
  items?: number;
  status: 'completed' | 'in-transit' | 'pending';
  distance?: string;
  locationInventory?: string;
  shippingInventory?: string;
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

export interface ProductDetail {
  productName: string;
  skuCode: string;
  size: string;
  side: string;
  colour: string;
  quantity: number;
  inStock: number;
}

@Component({
  selector: 'app-route-map',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatTooltipModule, MatTableModule, SidebarComponent, HeaderComponent, RouterModule],
  templateUrl: './route-map.component.html',
  styleUrl: './route-map.component.css'
})
export class RouteMapComponent implements OnInit, AfterViewInit {
  @Input() showFullLayout: boolean = true; // Default to true for standalone usage
  @Output() routeDataChanged = new EventEmitter<RouteStop[]>();
  
  routeData: any = null;
  showAddStopModal = false;
  isDraftRoute = false;
  isCompletedRoute = false;
  isNotStartedRoute = false;
  
  // Modal properties for product details
  showModal = false;
  modalTitle = '';
  productDetails = new MatTableDataSource<ProductDetail>([]);
  productDisplayedColumns: string[] = ['productName', 'skuCode', 'size', 'side', 'colour', 'quantity', 'inStock'];
  
  // Location modal properties
  customers: Customer[] = [];
  selectedCustomers: Customer[] = [];
  locationViewType: 'assigned' | 'all' = 'assigned';
  assignedLocations: Customer[] = [];
  allLocations: Customer[] = [];
  
  // Location inventory modal properties
  showLocationInventoryModal = false;
  selectedLocationInventory: ProductDetail[] = [];
  
  // Shipping inventory modal properties
  showShippingInventoryModal = false;
  selectedShippingInventory: ProductDetail[] = [];
  
  routeStops: RouteStop[] = [
    {
      location: 'Howard University',
      eta: '10:00 AM',
      items: 4,
      status: 'completed',
      distance: '5.2 Miles',
      locationInventory: '2 Items',
      shippingInventory: '2 Items'
    },
    {
      location: 'Bryant Street',
      eta: '10:30 AM',
      status: 'in-transit',
      distance: '12.8 Miles',
      locationInventory: '3 Items',
      shippingInventory: '4 Items'
    },
    {
      location: 'District Vet',
      eta: '11:40 AM',
      status: 'pending',
      distance: '8.3 Miles',
      locationInventory: '4 Items',
      shippingInventory: '3 Items'
    }
  ];

  availableCustomers: Customer[] = [
    { id: 1, locationName: 'Downtown Medical Center', locationAddress: '123 Main St, New York, NY 10001', driverName: 'John Smith', locationInventory: '5 Items', shippingInventory: '3 Items', status: 'Ready To Ship', selected: false },
    { id: 2, locationName: 'West Side Clinic', locationAddress: '456 Oak Ave, Los Angeles, CA 90210', driverName: 'Jane Doe', locationInventory: '8 Items', shippingInventory: '6 Items', status: 'Ready To Ship', selected: false },
    { id: 3, locationName: 'Central Hospital', locationAddress: '789 Pine Rd, Chicago, IL 60601', driverName: 'Mike Johnson', locationInventory: '12 Items', shippingInventory: '9 Items', status: 'Ready To Ship', selected: false },
    { id: 4, locationName: 'South Medical Plaza', locationAddress: '321 Elm St, Houston, TX 77001', driverName: 'Sarah Wilson', locationInventory: '6 Items', shippingInventory: '4 Items', status: 'Ready To Ship', selected: false },
    { id: 5, locationName: 'East Valley Clinic', locationAddress: '654 Maple Dr, Phoenix, AZ 85001', driverName: 'David Brown', locationInventory: '9 Items', shippingInventory: '7 Items', status: 'Ready To Ship', selected: false },
    { id: 6, locationName: 'North Point Medical', locationAddress: '987 Cedar Ln, Philadelphia, PA 19101', driverName: 'Lisa Anderson', locationInventory: '4 Items', shippingInventory: '2 Items', status: 'Ready To Ship', selected: false },
    { id: 7, locationName: 'Metro Health Center', locationAddress: 'Address Not Available', driverName: 'Not Assigned', locationInventory: '7 Items', shippingInventory: '5 Items', status: 'Follow up', selected: false }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get route data from navigation state or route params
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.routeData = navigation.extras.state['routeData'];
    }
    
    // If no data from navigation, get from route params (for direct URL access)
    this.route.queryParams.subscribe(params => {
      if (params['driverName']) {
        this.routeData = {
          driverName: params['driverName'],
          totalStops: params['totalStops'],
          shippingDate: params['shippingDate'],
          status: params['status']
        };
        // Check if this is a draft route
        this.isDraftRoute = params['status']?.toLowerCase() === 'draft';
        this.isCompletedRoute = params['status']?.toLowerCase() === 'completed';
        this.isNotStartedRoute = params['status']?.toLowerCase() === 'not started';
        console.log('Route status from params:', params['status']);
        console.log('Is draft route:', this.isDraftRoute);
        console.log('Is completed route:', this.isCompletedRoute);
      }
    });

    // Check route data status if available
    if (this.routeData?.status) {
      this.isDraftRoute = this.routeData.status.toLowerCase() === 'draft';
      this.isCompletedRoute = this.routeData.status.toLowerCase() === 'completed';
      this.isNotStartedRoute = this.routeData.status.toLowerCase() === 'not started';
      console.log('Route status:', this.routeData.status);
      console.log('Is draft route:', this.isDraftRoute);
      console.log('Is completed route:', this.isCompletedRoute);
      console.log('Is not started route:', this.isNotStartedRoute);
    }

    // Update route stops status based on route completion status
    this.updateRouteStopsStatus();

    // Fallback data if no route data is available
    if (!this.routeData) {
      this.routeData = {
        driverName: 'James Miller',
        totalStops: 3,
        shippingDate: '20/06/2025',
        status: 'Draft', // Set to Draft for testing
        startPoint: 'Warehouse 1',
        distance: '5.1 miles'
      };
      // Set isDraftRoute for fallback data
      this.isDraftRoute = true;
    }

    // Initialize customer data for location modal
    this.initializeCustomers();
  }

  initializeCustomers(): void {
    this.assignedLocations = [
      {
        id: 1,
        locationName: 'Downtown Medical Center',
        locationAddress: '123 Main St, Downtown',
        driverName: 'James Miller',
        status: 'Ready To Ship',
        selected: false,
        locationInventory: '2 items',
        shippingInventory: '2 items'
      },
      {
        id: 2,
        locationName: 'Southside Clinic',
        locationAddress: '456 Oak Ave, Southside',
        driverName: 'James Miller',
        status: 'Follow up',
        selected: false,
        locationInventory: '1 item',
        shippingInventory: '1 item'
      }
    ];

    this.allLocations = [
      ...this.assignedLocations,
      {
        id: 3,
        locationName: 'Northgate Hospital',
        locationAddress: '789 Pine St, Northgate',
        driverName: 'Sarah Johnson',
        status: 'Ready To Ship',
        selected: false,
        locationInventory: '1 item',
        shippingInventory: '1 item'
      }
    ];

    // Set initial customers based on locationViewType
    this.customers = this.locationViewType === 'assigned' ? this.assignedLocations : this.allLocations;
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    // Initialize the map here
    // For now, we'll use a placeholder
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      mapContainer.innerHTML = `
        <div style="width: 100%; height: 100%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
          <div style="text-align: center; color: #666;">
            <div style="font-size: 48px; margin-bottom: 16px;">🗺️</div>
            <div>Interactive Map View</div>
            <div style="font-size: 12px; margin-top: 8px;">Map integration will be implemented here</div>
          </div>
        </div>
      `;
    }
  }

  getTotalTime(): string {
    return '23 min';
  }

  goBack(): void {
    this.router.navigate(['/routes']);
  }

  // Product Modal functions for stops
  openStopLocationInventoryModal(stop: RouteStop): void {
    console.log('Opening location inventory modal for:', stop.location);
    this.productDetails.data = [
      { productName: 'Cervical Collar', skuCode: 'CC001', size: 'Medium', side: 'Left', colour: 'Beige', quantity: 2, inStock: 15 },
      { productName: 'Knee Brace', skuCode: 'KB002', size: 'Large', side: 'Right', colour: 'Black', quantity: 1, inStock: 8 }
    ];
    this.modalTitle = `Location Inventory - ${stop.location}`;
    this.showModal = true;
    this.productDisplayedColumns = ['productName', 'skuCode', 'size', 'side', 'colour', 'inStock'];
    console.log('Modal should be showing:', this.showModal);
  }

  openStopShippingInventoryModal(stop: RouteStop): void {
    console.log('Opening shipping inventory modal for:', stop.location);
    this.productDetails.data = [
      { productName: 'Ankle Support', skuCode: 'AS003', size: 'Small', side: 'Left', colour: 'Grey', quantity: 3, inStock: 12 },
      { productName: 'Wrist Splint', skuCode: 'WS004', size: 'Medium', side: 'Right', colour: 'Blue', quantity: 2, inStock: 6 }
    ];
    this.modalTitle = `Shipping Inventory - ${stop.location}`;
    this.showModal = true;
    this.productDisplayedColumns = ['productName', 'skuCode', 'size', 'side', 'colour', 'inStock'];
    console.log('Modal should be showing:', this.showModal);
  }

  closeModal(): void {
    console.log('Closing modal');
    this.showModal = false;
    this.productDetails.data = [];
    this.modalTitle = '';
  }

  // Modal functions
  openAddStopModal(): void {
    // Initialize location data similar to route-detail component
    this.assignedLocations = this.availableCustomers.filter(customer => customer.driverName !== 'Not Assigned');
    this.allLocations = this.availableCustomers;
    
    // Initialize with assigned locations by default
    this.locationViewType = 'assigned';
    this.customers = this.assignedLocations;
    this.selectedCustomers = [];
    this.showAddStopModal = true;
  }

  closeAddStopModal(): void {
    this.showAddStopModal = false;
    // Reset selections when closing modal
    this.availableCustomers.forEach(customer => customer.selected = false);
    this.selectedCustomers = [];
  }

  toggleCustomerSelection(customer: Customer): void {
    customer.selected = !customer.selected;
    if (customer.selected) {
      this.selectedCustomers.push(customer);
    } else {
      this.selectedCustomers = this.selectedCustomers.filter(c => c.id !== customer.id);
    }
  }

  // Location modal inventory handlers (similar to route-detail)
  openLocationInventoryModal(customer: Customer, event: Event) {
    event.stopPropagation(); // Prevent row selection toggle
    this.selectedLocationInventory = [
      { productName: 'Cervical Collar', skuCode: 'CC001', size: 'Medium', side: 'Left', colour: 'Beige', quantity: 2, inStock: 15 },
      { productName: 'Knee Brace', skuCode: 'KB002', size: 'Large', side: 'Right', colour: 'Black', quantity: 1, inStock: 8 }
    ];
    this.modalTitle = `Location Inventory - ${customer.locationName}`;
    this.showLocationInventoryModal = true;
    this.productDisplayedColumns = ['productName', 'skuCode', 'size', 'side', 'colour', 'quantity', 'inStock'];
  }

  closeLocationInventoryModal(): void {
    this.showLocationInventoryModal = false;
    this.selectedLocationInventory = [];
  }

  openLocationShippingModal(customer: Customer, event: Event) {
    event.stopPropagation(); // Prevent row selection toggle
    this.selectedShippingInventory = [
      { productName: 'Ankle Support', skuCode: 'AS003', size: 'Small', side: 'Left', colour: 'Grey', quantity: 3, inStock: 12 },
      { productName: 'Wrist Splint', skuCode: 'WS004', size: 'Medium', side: 'Right', colour: 'Blue', quantity: 2, inStock: 6 }
    ];
    this.modalTitle = `Shipping Inventory - ${customer.locationName}`;
    this.showShippingInventoryModal = true;
    this.productDisplayedColumns = ['productName', 'skuCode', 'size', 'side', 'colour', 'quantity', 'inStock'];
  }

  closeShippingInventoryModal(): void {
    this.showShippingInventoryModal = false;
    this.selectedShippingInventory = [];
  }

  hasSelectedCustomers(): boolean {
    return this.selectedCustomers.length > 0;
  }

  // Location modal radio button handler
  onLocationViewChange(viewType: 'assigned' | 'all'): void {
    this.locationViewType = viewType;
    // Update customers list based on view type
    if (viewType === 'assigned') {
      this.customers = this.assignedLocations;
    } else {
      this.customers = this.allLocations;
    }
  }

  // Remove old methods that are no longer needed
  toggleAllCustomers(event: any): void {
    // This method is no longer used with the new location modal design
  }

  areAllCustomersSelected(): boolean {
    // This method is no longer used with the new location modal design
    return false;
  }

  isSomeCustomersSelected(): boolean {
    // This method is no longer used with the new location modal design
    return false;
  }

  onCustomerSelectionChange(): void {
    // This method is no longer used with the new location modal design
  }

  addSelectedCustomersToStops(): void {
    const selectedCustomers = this.selectedCustomers;
    
    selectedCustomers.forEach((customer, index) => {
      const newStop: RouteStop = {
        location: customer.locationName,
        eta: this.generateNextETA(),
        items: Math.floor(Math.random() * 5) + 1, // Random number of items between 1-5
        status: 'pending',
        distance: '0 Miles', // Will be calculated
        locationInventory: customer.locationInventory,
        shippingInventory: customer.shippingInventory
      };
      
      this.routeStops.push(newStop);
    });

    // Close modal and reset selections
    this.closeAddStopModal();
    
    // Emit the updated route data
    this.routeDataChanged.emit(this.routeStops);
  }

  private generateNextETA(): string {
    const currentTime = new Date();
    const randomMinutes = Math.floor(Math.random() * 60) + 30; // Add 30-90 minutes
    currentTime.setMinutes(currentTime.getMinutes() + randomMinutes);
    
    return currentTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }

  // Delete stop functionality for draft routes
  deleteStop(index: number): void {
    if (this.isDraftRoute && this.routeStops.length > index) {
      const stopLocation = this.routeStops[index].location;
      const confirmed = confirm(`Are you sure you want to delete "${stopLocation}" from this route?`);
      
      if (confirmed) {
        this.routeStops.splice(index, 1);
        console.log('Stop deleted, remaining stops:', this.routeStops.length);
        
        // Emit the updated route data
        this.routeDataChanged.emit(this.routeStops);
      }
    }
  }

  // Check if delete is allowed (only for draft routes)
  canDeleteStop(): boolean {
    return this.isDraftRoute;
  }

  // Update route stops status based on route completion status
  updateRouteStopsStatus(): void {
    if (this.isCompletedRoute) {
      // Set all route stops to completed status
      this.routeStops = this.routeStops.map(stop => ({
        ...stop,
        status: 'completed' as const
      }));
      console.log('Updated all route stops to completed status');
    } else if (this.isNotStartedRoute) {
      // Set all route stops to pending status
      this.routeStops = this.routeStops.map(stop => ({
        ...stop,
        status: 'pending' as const
      }));
      console.log('Updated all route stops to pending status');
    }
  }
}