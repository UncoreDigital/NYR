import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-transfer-van',
  templateUrl: './transfer-van.component.html',
  styleUrl: './transfer-van.component.css'
})
export class TransferVanComponent implements OnInit {
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
  vanSearchTerm: string = '';
  productSearchTerm: string = '';
  
  // Dropdown visibility states
  showVanDropdown: boolean = false;
  showProductDropdown: boolean = false;
  
  // Selected items
  selectedVan: any = null;
  selectedProduct: any = null;

  // Data arrays for dropdowns
  vans = [
    { value: 'van1', name: 'Van 1' },
    { value: 'van2', name: 'Van 2' },
    { value: 'van3', name: 'Van 3' },
    { value: 'van4', name: 'Van 4' },
    { value: 'van5', name: 'Van 5' }
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
      van: ['', Validators.required],
      product: [''],
      // image: [''],
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
    this.router.navigate(['/invans']);
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
    this.router.navigate(['/invans']);
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
  getFilteredVans() {
    if (!this.vanSearchTerm) {
      return this.vans;
    }
    return this.vans.filter(van => 
      van.name.toLowerCase().includes(this.vanSearchTerm.toLowerCase())
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
  
  filterVans() {
    // Trigger filtering when user types
  }
  
  filterProducts() {
    // Trigger filtering when user types
  }
  
  selectVan(van: any) {
    this.selectedVan = van;
    this.vanSearchTerm = van.name;
    this.vanForm.patchValue({ van: van.value });
    this.showVanDropdown = false;
  }
  
  selectProduct(product: any) {
    this.selectedProduct = product;
    this.productSearchTerm = product.name;
    this.vanForm.patchValue({ product: product.value });
    this.showProductDropdown = false;
  }
  
  hideVanDropdown() {
    setTimeout(() => {
      this.showVanDropdown = false;
    }, 200);
  }
  
  hideProductDropdown() {
    setTimeout(() => {
      this.showProductDropdown = false;
    }, 200);
  }
  
  clearVan() {
    this.selectedVan = null;
    this.vanSearchTerm = '';
    this.vanForm.patchValue({ van: '' });
    this.showVanDropdown = false;
  }
  
  clearProduct() {
    this.selectedProduct = null;
    this.productSearchTerm = '';
    this.vanForm.patchValue({ product: '' });
    this.showProductDropdown = false;
  }
}

