import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { TransferInventoryService } from 'src/app/services/transfer-inventory.service';
import { LocationService } from 'src/app/services/location.service';
import * as L from 'leaflet';

export interface RouteStop {
  locationName: string;
  eta: string;
  items?: number;
  status: 'delivered' | 'in-progress' | 'not-delivered' | 'pending' | 'In Progress' | 'Not Delivered';
  distance?: string;
  locationInventory?: string;
  locationInventoryData?: any[];
  shippingInventory?: string;
  shippingInventoryData?: any[];
  id?: number;
}

export interface Customer {
  locationAddress?: string;
  driverName?: string;
  locationName: string;
  eta: string;
  items?: number;
  distance?: string;
  locationInventory?: string;
  locationInventoryData?: any[];
  shippingInventory?: string;
  shippingInventoryData?: any[];
  id?: number;
  selected?: boolean;
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

@Component({
  selector: 'app-route-map',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatTooltipModule, MatTableModule, SidebarComponent, HeaderComponent, RouterModule],
  templateUrl: './route-map.component.html',
  styleUrl: './route-map.component.css'
})
export class RouteMapComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() showFullLayout: boolean = true; // Default to true for standalone usage
  @Output() routeDataChanged = new EventEmitter<RouteStop[]>();
  @Input() mapRouteData: any[] = [];
  
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
  driverLocations: Customer[] = [];
  
  // Location inventory modal properties
  showLocationInventoryModal = false;
  selectedLocationInventory: ProductDetail[] = [];
  
  // Shipping inventory modal properties
  showShippingInventoryModal = false;
  selectedShippingInventory: ProductDetail[] = [];
  routeStops: RouteStop[] = [];
  availableCustomers: Customer[] = [];
  private map: any;

  constructor(
    private router: Router,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png',
      iconRetinaUrl: 'assets/marker-icon.png',
    });

    const state = history.state;
    console.log('Navigation state:', state);
    this.routeStops = state.selectedLocations || state.routeData?.routeStops || [];
    //Temp Solution to get route data from state
    this.getInventoryobyLocation();

     if (state.routeData['selectedDriver'] || state.routeData?.routeStops) {
        this.routeData = {
          driverName: state.routeData['selectedDriver'],
          totalStops: state.routeData['totalLocations'],
          shippingDate: state.routeData['selectedDate'],
          driverid: state.routeData['selectedDriverId'],
          // status: params['status']
        };
        // Check if this is a draft route
        this.isDraftRoute = state.routeData['status']?.toLowerCase() === 'draft';
        this.isCompletedRoute = state.routeData['status']?.toLowerCase() === 'completed';
        this.isNotStartedRoute = state.routeData['status']?.toLowerCase() === 'not started';
        this.isNotStartedRoute = this.isNotStartedRoute === false && this.isDraftRoute === false && this.isCompletedRoute === false ? true : this.isNotStartedRoute;
        console.log('Route status from params:', state.routeData['status']);
        console.log('Is draft route:', this.isDraftRoute);
        console.log('Is completed route:', this.isCompletedRoute);
      }
    // // Get route data from navigation state or route params
    // const navigation = this.router.getCurrentNavigation();
    // if (navigation?.extras?.state) {
    //   this.routeData = navigation.extras.state['routeData'];
    // }
    
    // If no data from navigation, get from route params (for direct URL access)

    // Check route data status if available
    if (this.routeData?.status) {
      this.isDraftRoute = this.routeData.status.toLowerCase() === 'draft';
      this.isCompletedRoute = this.routeData.status.toLowerCase() === 'completed';
      this.isNotStartedRoute = this.routeData.status.toLowerCase() === 'not started';
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
    this.loadLocationsDetails();
  }

  getInventoryobyLocation(): void {
    this.routeStops?.forEach((stop: any, index) => {
      // this.transferInventoryService.getTransferItemsByLocationId(stop.id || 0).subscribe({
      //   next: (items) => {
      //     console.log('Inventory items for location', stop.locationName, items);
      const updated = { ...this.routeStops[index], locationInventory: `0 Items`, locationInventoryData: stop?.shippingInventory || [], shippingInventory: `${stop?.shippingInventory?.length || 0} Items` };
      this.routeStops = [
        ...this.routeStops!.slice(0, index),
        updated,
        ...this.routeStops!.slice(index + 1)
      ];
      //     console.log(this.routeStops);
      //   },
      //   error: (error) => {
      //     console.error('Error loading location inventory:', error);
      //   }
      // });
    });
  }

  initializeCustomers(): void {
    this.assignedLocations = [];
    // Set initial customers based on locationViewType
    this.customers = this.locationViewType === 'assigned' ? this.assignedLocations : this.allLocations;
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Check if mapRouteData has changed and is not the first change
    if (changes['mapRouteData'] && !changes['mapRouteData'].firstChange) {
      console.log('mapRouteData changed, reinitializing map:', changes['mapRouteData'].currentValue);
      // Reinitialize the map with new data
      if (this.map) {
        this.initializeMap();
      }
    }
  }

  initializeMap(): void {
    // Clear existing map if it exists
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    // Check if mapRouteData has valid stops
    const stops: any[] = this.mapRouteData?.map(x => x.address).filter(addr => addr?.latitude && addr?.longitude) || [];
    
    if (stops.length === 0) {
      console.warn('No valid stops with coordinates to display on map');
      // Initialize map with default center if no stops
      this.map = L.map('map', {
        center: [23.0497, 72.5167],
        zoom: 13
      });
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(this.map);
      
      return;
    }

    // Initialize new map
    this.map = L.map('map', {
      center: [stops[0].latitude, stops[0].longitude],
      zoom: 13
    });

    // OSM tile layer (FREE)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    // Add markers for stops
    stops.forEach(stop => {
      L.marker([
        stop.latitude,
        stop.longitude
      ])
        .addTo(this.map)
        .bindPopup(`<b>${stop.addressLineOne}</b><br>${stop.addressLineTwo}`);
    });

    // Fit map to markers
    const group = L.featureGroup(
      stops.map(s =>
        L.marker([s.latitude, s.longitude])
      )
    );
    this.map.fitBounds(group.getBounds());

    // Draw route polyline
    const latlngs = stops.map(s => [s.latitude, s.longitude]);
    L.polyline(latlngs, { color: 'blue' }).addTo(this.map);
  }

  getTotalTime(): string {
    return '23 min';
  }

  goBack(): void {
    this.router.navigate(['/routes']);
  }

  // Product Modal functions for stops
  openStopLocationInventoryModal(stop: RouteStop): void {
    console.log('Opening location inventory modal for:', stop.locationName);
    // this.productDetails.data = [
    //   { productName: 'Cervical Collar', skuCode: 'CC001', size: 'Medium', side: 'Left', colour: 'Beige', quantity: 2, inStock: 15 },
    //   { productName: 'Knee Brace', skuCode: 'KB002', size: 'Large', side: 'Right', colour: 'Black', quantity: 1, inStock: 8 }
    // ];
    this.productDetails.data = stop.locationInventoryData || [];
    this.modalTitle = `Location Inventory - ${stop.locationName}`;
    this.showModal = true;
    this.productDisplayedColumns = ['productName', 'skuCode', 'variationType', 'variationValue', 'quantity'];
    console.log('Modal should be showing:', this.showModal);
  }

  openStopShippingInventoryModal(stop: RouteStop): void {
    console.log('Opening shipping inventory modal for:', stop.locationName);
    // this.productDetails.data = [
    //   { productName: 'Ankle Support', skuCode: 'AS003', size: 'Small', side: 'Left', colour: 'Grey', quantity: 3, inStock: 12 },
    //   { productName: 'Wrist Splint', skuCode: 'WS004', size: 'Medium', side: 'Right', colour: 'Blue', quantity: 2, inStock: 6 }
    // ];
    this.productDetails.data = stop.locationInventoryData || [];
    this.modalTitle = `Shipping Inventory - ${stop.locationName}`;
    this.showModal = true;
    this.productDisplayedColumns = ['productName', 'skuCode', 'variationType', 'variationValue', 'quantity'];
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
    // this.driverLocations = this.routeStops;
    this.availableCustomers = this.routeStops;
    this.assignedLocations = this.routeStops;
    // this.assignedLocations = this.availableCustomers.filter(customer => customer.driverName !== 'Not Assigned');
    // this.allLocations = this.availableCustomers;
    
    // Initialize with assigned locations by default
    this.locationViewType = 'assigned';
    this.customers = this.driverLocations;
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
      this.customers = this.driverLocations;
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
        locationName: customer.locationName,
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
    if ((this.isDraftRoute || this.isNotStartedRoute) && this.routeStops.length > index) {
      const stopLocation = this.routeStops[index].locationName;
      const confirmed = confirm(`Are you sure you want to delete "${stopLocation}" from this route?`);
      
      if (confirmed) {
        this.routeStops.splice(index, 1);
        this.driverLocations.map(loc => loc.selected = this.routeStops.find(stop => stop.id === loc.id) ? true : false);
        this.allLocations.map(loc => loc.selected = this.routeStops.find(stop => stop.id === loc.id) ? true : false);
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
        // status: 'delivered' as const
      }));
      // this.routeStops[0].status = 'not-delivered' as const;
      console.log('Updated all route stops to completed status');
    } else if (this.isNotStartedRoute) {
      // Set all route stops to pending status
      this.routeStops = this.routeStops.map(stop => ({
        ...stop,
        // status: 'pending' as const
      }));
      console.log('Updated all route stops to pending status');
    }
  }

  loadLocationsDetails(): void {
    this.locationService.getLocationsDetails().subscribe({
      next: (apiLocations: any[]) => {
        apiLocations.map(loc => loc.locationAddress = loc.addressLine1);
        apiLocations.map(loc => loc.driverName = loc.userName);
        apiLocations.map(x => x.shippingInventoryData = x.transferItems);
        apiLocations.map(x => x.shippingInventory = `${x.transferItems.length} Items`);
        this.driverLocations = apiLocations.filter(x => x.userName == this.routeData.driverName);
        this.allLocations = apiLocations;
        this.driverLocations.map(loc => loc.selected = this.routeStops.find(stop => stop.id === loc.id) ? true : false);
        this.allLocations.map(loc => loc.selected = this.routeStops.find(stop => stop.id === loc.id) ? true : false);
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