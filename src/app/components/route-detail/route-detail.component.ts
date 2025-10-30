import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

export interface routeDetail {
  stop: string;
  deliveryDate: string;
  location: string;
  inventoryItem: string;
  shippingItem: string;
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
  name: string;
  status: string;
  selected: boolean;
}

@Component({
  selector: 'app-route-detail',
  templateUrl: './route-detail.component.html',
  styleUrl: './route-detail.component.css'
})
export class RouteDetailComponent implements OnInit {
  displayedColumns: string[] = ['stop', 'location', 'inventoryItem', 'shippingItem', 'actions'];
  dataSource = new MatTableDataSource<routeDetail>();

  // Modal properties
  showModal = false;
  modalTitle = 'Route Details';
  productDetails: ProductDetail[] = [];
  productDisplayedColumns: string[] = ['productName', 'skuCode', 'size', 'side', 'colour', 'quantity', 'inStock'];

  // Location Address Modal properties
  showLocationModal = false;
  customers: Customer[] = [];
  selectedCustomers: Customer[] = [];
  allSelected = false;

  // Approval Modal properties
  showApprovalModal = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  routeDetail: routeDetail[] = [
    { stop: 'Stop 1', deliveryDate: '2023-10-01', location: 'New York, NY', inventoryItem: '2 Items', shippingItem: '2 Items' },
    { stop: 'Stop 2', deliveryDate: '2023-10-02', location: 'Los Angeles, CA', inventoryItem: '3 Items', shippingItem: '4 Items' },
    { stop: 'Stop 3', deliveryDate: '2023-10-03', location: 'Chicago, IL', inventoryItem: '4 Items', shippingItem: '3 Items' },
    { stop: 'Stop 12', deliveryDate: '2023-10-12', location: 'Jacksonville, FL', inventoryItem: '5 Items', shippingItem: '2 Items' },
  ];
  showRouteDetail = false;

  // Route summary properties
  totalStops = 3;
  totalDistance = '20 Miles';
  totalTime = '1.5 Hrs';
  deliveryDate = 'Oct 30, 2025';

  // Properties for received data from create-route
  selectedLocations: any[] = [];
  routeCreationData: any = {};
  // View toggle properties
  currentView: 'table' | 'map' = 'table';
  constructor(private router: Router, private location: Location) { }

  ngOnInit(): void {
    // Check if data was passed from create-route navigation using history.state
    const state = history.state;
    console.log('Navigation state:', state);
    
    if (state && state.selectedLocations) {
      this.selectedLocations = state.selectedLocations || [];
      this.routeCreationData = state.routeData || {};
      
      console.log('Received selected locations:', this.selectedLocations);
      console.log('Received route data:', this.routeCreationData);
      
      // Convert selected locations to route detail format
      this.convertSelectedLocationsToRouteDetail();
    } else {
      // Fallback to default data if no navigation state
      console.log('No navigation state found, using default data');
      this.dataSource.data = this.routeDetail;
    }
  }

  convertSelectedLocationsToRouteDetail() {
    if (this.selectedLocations.length > 0) {
      const convertedData = this.selectedLocations.map((location, index) => ({
        stop: `Stop ${index + 1}`,
        deliveryDate: location.shippingDate || this.routeCreationData.selectedDate || '2023-10-01',
        location: location.locationAddress || location.locationName,
        inventoryItem: '2 Items', // Default value - could be calculated based on location data
        shippingItem: '2 Items'   // Default value - could be calculated based on location data
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
    this.showModal = true;
    this.productDisplayedColumns = ['productName', 'skuCode', 'size', 'side', 'colour', 'quantity', 'inStock'];
  }

  closeModal() {
    this.showModal = false;
  }

  openLocationModal() {
    // Sample customer data - in real app, this would come from API
    this.customers = [
      { id: 1, name: 'Cervical Collar', status: 'Ready To Ship', selected: true },
      { id: 2, name: 'Cervical Collar', status: 'Ready To Ship', selected: true },
      { id: 3, name: 'Cervical Collar', status: 'Ready To Ship', selected: true },
      { id: 4, name: 'Cervical Collar', status: 'Ready To Ship', selected: true },
      { id: 5, name: 'Cervical Collar', status: 'Ready To Ship', selected: true },
      { id: 6, name: 'Cervical Collar', status: 'Ready To Ship', selected: true },
      { id: 7, name: 'Cervical Collar', status: 'Ready To Ship', selected: true },
      { id: 8, name: '-', status: 'Follow up', selected: false }
    ];
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
    this.closeLocationModal();
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

  // View toggle methods
  switchView(view: 'table' | 'map') {
    this.currentView = view;
  }

}

