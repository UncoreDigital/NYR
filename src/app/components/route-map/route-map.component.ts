import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { LocationService } from 'src/app/services/location.service';
import * as L from 'leaflet';

export interface RouteStop {
  locationName: string;
  eta: string;
  otp?: string;
  items?: number;
  status: 'delivered' | 'in-progress' | 'not-delivered' | 'pending' | 'In Progress' | 'Not Delivered';
  distance?: string;
  locationInventory?: string;
  locationInventoryData?: any[];
  shippingInventory?: string;
  shippingInventoryData?: any[];
  id?: number;
  deliveryOTP?: string;
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
    this.prepareLocationData(state.selectedLocations || state.routeData?.routeStops || [])
    //Temp Solution to get route data from state
    this.getInventoryobyLocation();

     if (state.routeData['selectedDriver'] || state.routeData?.routeStops) {
        this.routeData = {
          driverName: state.routeData['selectedDriver'],
          totalStops: state.routeData['totalLocations'],
          shippingDate: state.routeData['selectedDate'],
          driverid: state.routeData['selectedDriverId'],
          routeStatus: state.routeData['status'] || ''
        };
        // Check if this is a draft route
        this.isDraftRoute = state.routeData['status']?.toLowerCase() === 'draft';
        this.isCompletedRoute = state.routeData['status']?.toLowerCase() === 'completed';
        this.isNotStartedRoute = state.routeData['status']?.toLowerCase() === 'not started';
        this.isNotStartedRoute = this.isNotStartedRoute === false && this.isDraftRoute === false && this.isCompletedRoute === false ? true : this.isNotStartedRoute;
      }
    
    // Check route data status if available
    if (this.routeData?.status) {
      this.isDraftRoute = this.routeData.status.toLowerCase() === 'draft';
      this.isCompletedRoute = this.routeData.status.toLowerCase() === 'completed';
      this.isNotStartedRoute = this.routeData.status.toLowerCase() === 'not started';
    }

    // Update route stops status based on route completion status
    this.updateRouteStopsStatus();

    // Initialize customer data for location modal
    this.initializeCustomers();
    this.loadLocationsDetails();
  }

  prepareLocationData(selectedLocations: any) {
      const locationData: any[] = [];
      //Prepare Location data 
      selectedLocations.forEach((loc: any, index: number) => {
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
            id: loc.id,
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
          });
        }
      });
      //End
      this.routeStops = locationData;
  }

  getInventoryobyLocation(): void {
    this.routeStops?.forEach((stop: any, index) => {
      const updated = { ...this.routeStops[index], locationInventory: `${stop?.locationInventory?.length || 0} Items`, locationInventoryData: stop?.locationInventory || [], shippingInventoryData: stop?.shippingInventory, shippingInventory: `${stop?.shippingInventory?.length || 0} Items` };
      this.routeStops = [
        ...this.routeStops!.slice(0, index),
        updated,
        ...this.routeStops!.slice(index + 1)
      ];     
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
    this.productDetails.data = stop.locationInventoryData || [];
    this.modalTitle = `Location Inventory - ${stop.locationName}`;
    this.showModal = true;
    this.productDisplayedColumns = ['productName', 'skuCode', 'variantName', 'quantity'];
  }

  openStopShippingInventoryModal(stop: RouteStop): void {
    this.productDetails.data = stop.shippingInventoryData || [];
    this.modalTitle = `Shipping Inventory - ${stop.locationName}`;
    this.showModal = true;
    this.productDisplayedColumns = ['productName', 'skuCode', 'variantName', 'quantity'];
  }

  closeModal(): void {
    this.showModal = false;
    this.productDetails.data = [];
    this.modalTitle = '';
  }

  // Modal functions
  openAddStopModal(): void {
    this.assignedLocations = this.routeStops;
    // Initialize with assigned locations by default
    this.locationViewType = 'assigned';
    this.customers = this.driverLocations;
    this.selectedCustomers = [];
    this.showAddStopModal = true;
  }

  closeAddStopModal(): void {
    this.showAddStopModal = false;
    // Reset selections when closing modal
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
    this.selectedLocationInventory = [];
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
    this.selectedShippingInventory = [];
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

  addSelectedCustomersToStops(): void {
    const selectedCustomers = this.selectedCustomers;
    
    selectedCustomers.forEach((customer: any, index) => {
      const newStop: any = {
        locationId: customer.id,
        locationName: customer.locationName,
        customerId: customer.customerId,
        customerName: customer.customerName,
        eta: this.generateNextETA(),
        items: Math.floor(Math.random() * 5) + 1, // Random number of items between 1-5
        status: 'pending',
        distance: '0 Miles', // Will be calculated
        locationInventory: customer.locationInventory,
        locationInventoryData: customer.locationInventoryData || [],
        shippingInventory: customer.shippingInventory,
        shippingInventoryData: customer.shippingInventoryData || []
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
      // const confirmed = confirm(`Are you sure you want to delete "${stopLocation}" from this route?`);
      
      // if (confirmed) {
        this.routeStops.splice(index, 1);
        this.driverLocations.map(loc => loc.selected = this.routeStops.find(stop => stop.id === loc.id) ? true : false);
        this.allLocations.map(loc => loc.selected = this.routeStops.find((stop: any) => stop?.locationId === loc.id) ? true : false);
        console.log('Stop deleted, remaining stops:', this.routeStops.length);
        
        // Emit the updated route data
        this.routeDataChanged.emit(this.routeStops);
      // }
    }
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
        apiLocations.map(x => x.locationInventoryData = x.locationInventoryData || []);
        apiLocations.map(x => x.locationInventory = `${x.locationInventoryData.length} Items`);
        this.driverLocations = apiLocations.filter(x => x.userName == this.routeData.driverName);
        this.allLocations = apiLocations;
        this.driverLocations.map(loc => loc.selected = this.routeStops.find((stop:any) => stop.locationId === loc.id) ? true : false);
        this.allLocations.map(loc => loc.selected = this.routeStops.find((stop:any) => stop.locationId === loc.id) ? true : false);
      },
      error: (error: any) => {
        console.error('Error loading locations:', error);
      }
    });
  }
}