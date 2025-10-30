import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-transfer-location',
  templateUrl: './transfer-location.component.html',
  styleUrl: './transfer-location.component.css'
})
export class TransferLocationComponent implements OnInit {
  vanForm: FormGroup;
  startTime: string = '';
  endTime: string = '';
  selectedTransferOption: string = 'scan';
  showScanPopup: boolean = false;
  scannedItems: Array<{ index: number; productName: string; sku: string } > = [];
  manualAdjustmentCount: number = 1;
  scanReason: string = '';

  // Navigation state
  isFromTransfers: boolean = false;

  // Search terms for dropdowns
  customerSearchTerm: string = '';
  locationSearchTerm: string = '';
  productSearchTerm: string = '';
  
  // Dropdown visibility states
  showCustomerDropdown: boolean = false;
  showLocationDropdown: boolean = false;
  showProductDropdown: boolean = false;
  
  // Selected items
  selectedCustomer: any = null;
  selectedLocation: any = null;
  selectedProduct: any = null;

  // Data arrays for dropdowns
  customers = [
    { value: 'customer1', name: 'Customer 1' },
    { value: 'customer2', name: 'Customer 2' },
    { value: 'customer3', name: 'Customer 3' },
    { value: 'customer4', name: 'Customer 4' },
    { value: 'customer5', name: 'Customer 5' }
  ];
  
  locations = [
    { value: 'location1', name: 'Location 1' },
    { value: 'location2', name: 'Location 2' },
    { value: 'location3', name: 'Location 3' },
    { value: 'location4', name: 'Location 4' },
    { value: 'location5', name: 'Location 5' }
  ];
  
  products = [
    { value: 'product1', name: 'Product 1' },
    { value: 'product2', name: 'Product 2' },
    { value: 'product3', name: 'Product 3' },
    { value: 'product4', name: 'Product 4' },
    { value: 'product5', name: 'Product 5' }
  ];

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute) {
    this.selectedTransferOption = 'scan';
    this.vanForm = this.fb.group({
      customer: ['', Validators.required],
      location: [''],
      product: [''],
    });

    // Seed example scanned items; replace with real scan results later
    this.scannedItems = [
      { index: 1, productName: 'Cervical Collar', sku: 'MD-001' },
      { index: 2, productName: 'Cervical Collar', sku: 'MD-001' },
      { index: 3, productName: 'Cervical Collar', sku: 'MD-001' }
    ];
  }

  ngOnInit() {
    // Check query parameters to determine navigation source
    this.route.queryParams.subscribe(params => {
      if (params['from'] === 'transfers') {
        this.isFromTransfers = true;
      }
    });
  }

  onSubmit() {
    this.router.navigate(['/inlocation']);
    if (this.vanForm.valid) {
      // Handle form submission (e.g., send to API)
      console.log('Customer Data:', this.vanForm.value);
    } else {
      this.vanForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.vanForm.reset();
  }

  onTransferChange(event: any) {
    this.selectedTransferOption = event.target.value;
  }

  openScanPopup(): void {
    this.showScanPopup = true;
  }

  closeScanPopup(): void {
    this.showScanPopup = false;
    this.router.navigate(['/inlocation']);
  }

  removeScannedItem(index: number): void {
    this.scannedItems.splice(index, 1);
  }

  incrementAdjustment(): void {
    this.manualAdjustmentCount = this.manualAdjustmentCount + 1;
  }

  decrementAdjustment(): void {
    if (this.manualAdjustmentCount > 0) {
      this.manualAdjustmentCount = this.manualAdjustmentCount - 1;
    }
  }

  // Dropdown filter methods
  getFilteredCustomers() {
    if (!this.customerSearchTerm) {
      return this.customers;
    }
    return this.customers.filter(customer => 
      customer.name.toLowerCase().includes(this.customerSearchTerm.toLowerCase())
    );
  }
  
  getFilteredLocations() {
    if (!this.locationSearchTerm) {
      return this.locations;
    }
    return this.locations.filter(location => 
      location.name.toLowerCase().includes(this.locationSearchTerm.toLowerCase())
    );
  }
  
  getFilteredProducts() {
    if (!this.productSearchTerm) {
      return this.products;
    }
    return this.products.filter(product => 
      product.name.toLowerCase().includes(this.productSearchTerm.toLowerCase())
    );
  }
  
  filterCustomers() {
    // Trigger filtering when user types
  }
  
  filterLocations() {
    // Trigger filtering when user types
  }
  
  filterProducts() {
    // Trigger filtering when user types
  }
  
  selectCustomer(customer: any) {
    this.selectedCustomer = customer;
    this.customerSearchTerm = customer.name;
    this.vanForm.patchValue({ customer: customer.value });
    this.showCustomerDropdown = false;
  }
  
  selectLocation(location: any) {
    this.selectedLocation = location;
    this.locationSearchTerm = location.name;
    this.vanForm.patchValue({ location: location.value });
    this.showLocationDropdown = false;
  }
  
  selectProduct(product: any) {
    this.selectedProduct = product;
    this.productSearchTerm = product.name;
    this.vanForm.patchValue({ product: product.value });
    this.showProductDropdown = false;
  }
  
  hideCustomerDropdown() {
    setTimeout(() => {
      this.showCustomerDropdown = false;
    }, 200);
  }
  
  hideLocationDropdown() {
    setTimeout(() => {
      this.showLocationDropdown = false;
    }, 200);
  }
  
  hideProductDropdown() {
    setTimeout(() => {
      this.showProductDropdown = false;
    }, 200);
  }
  
  clearCustomer() {
    this.selectedCustomer = null;
    this.customerSearchTerm = '';
    this.vanForm.patchValue({ customer: '' });
    this.showCustomerDropdown = false;
  }
  
  clearLocation() {
    this.selectedLocation = null;
    this.locationSearchTerm = '';
    this.vanForm.patchValue({ location: '' });
    this.showLocationDropdown = false;
  }
  
  clearProduct() {
    this.selectedProduct = null;
    this.productSearchTerm = '';
    this.vanForm.patchValue({ product: '' });
    this.showProductDropdown = false;
  }
}
