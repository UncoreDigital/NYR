import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { LocationService } from '../../services/location.service';
import { ProductService } from '../../services/product.service';
import { RestockRequestService } from '../../services/restock-request.service';
import { ToastService } from '../../services/toast.service';
import { WarehouseService } from '../../services/warehouse.service';
import { WarehouseInventoryService } from '../../services/warehouse-inventory.service';

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
  scannedItems: Array<{ index: number; productName: string; sku: string; productId?: number; variationId?: number } > = [];
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
  customers: any[] = [];
  locations: any[] = [];
  products: any[] = [];
  warehouses: any[] = [];
  warehouseInventory: any[] = [];
  allVariants: any[] = [];
  filteredVariants: any[] = [];
  transferCart: any[] = [];
  
  // Loading states
  isLoading = false;
  isSaving = false;
  isLoadingCustomers = false;
  isLoadingLocations = false;
  isLoadingProducts = false;
  isLoadingWarehouses = false;
  isLoadingInventory = false;
  
  // Selected warehouse
  selectedWarehouse: any = null;
  warehouseSearchTerm: string = '';
  showWarehouseDropdown: boolean = false;
  variationSearchTerm: string = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private route: ActivatedRoute,
    private customerService: CustomerService,
    private locationService: LocationService,
    private productService: ProductService,
    private restockRequestService: RestockRequestService,
    private toastService: ToastService,
    private warehouseService: WarehouseService,
    private warehouseInventoryService: WarehouseInventoryService
  ) {
    this.selectedTransferOption = 'manual';
    this.vanForm = this.fb.group({
      customer: ['', Validators.required],
      location: ['', Validators.required],
      // warehouse: ['', Validators.required], // COMMENTED OUT
      product: [''],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });

    // Seed example scanned items; replace with real scan results later
    this.scannedItems = [];
  }

  ngOnInit() {
    // Check query parameters to determine navigation source
    this.route.queryParams.subscribe(params => {
      if (params['from'] === 'transfers') {
        this.isFromTransfers = true;
      }
    });
    
    this.loadCustomers();
    // this.loadWarehouses(); // COMMENTED OUT
    this.loadAllProducts();
  }
  
  loadWarehouses(): void {
    this.isLoadingWarehouses = true;
    this.warehouseService.getWarehouses().subscribe({
      next: (warehouses) => {
        this.warehouses = warehouses.map(w => ({
          value: w.id,
          name: w.name,
          id: w.id
        }));
        this.isLoadingWarehouses = false;
      },
      error: (error) => {
        console.error('Error loading warehouses:', error);
        this.toastService.error('Error', 'Failed to load warehouses');
        this.isLoadingWarehouses = false;
      }
    });
  }
  
  loadCustomers(): void {
    this.isLoadingCustomers = true;
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers.map(c => ({
          value: c.id,
          name: c.companyName,
          id: c.id
        }));
        this.isLoadingCustomers = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.toastService.error('Error', 'Failed to load customers');
        this.isLoadingCustomers = false;
      }
    });
  }
  
  loadLocationsByCustomer(customerId: number): void {
    this.isLoadingLocations = true;
    this.locationService.getLocations().subscribe({
      next: (allLocations) => {
        this.locations = allLocations
          .filter(l => l.customerId === customerId)
          .map(l => ({
            value: l.id,
            name: l.locationName,
            id: l.id
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
  
  loadAllProducts(): void {
    this.isLoadingProducts = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products.map(p => ({
          value: p.id,
          name: p.name,
          id: p.id,
          sku: (p.variants && p.variants.length > 0) ? (p.variants[0].barcodeSKU || '') : ''
        }));
        this.isLoadingProducts = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.toastService.error('Error', 'Failed to load products');
        this.isLoadingProducts = false;
      }
    });
  }
  
  loadProductVariants(productId: number): void {
    // Load product variants with attributes from API
    this.productService.getProductVariantsWithAttributes(productId).subscribe({
      next: (variants) => {
        this.allVariants = variants.map(v => ({
          id: v.id,
          variantName: v.variantName,
          sku: v.sku,
          price: v.price,
          requestQuantity: 0,
          attributes: v.attributes.map(a => ({
            variationName: a.variationName,
            variationOptionName: a.variationOptionName
          }))
        }));
        
        this.filteredVariants = [...this.allVariants];
      },
      error: (error) => {
        console.error('Error loading product variants:', error);
        this.toastService.error('Error', 'Failed to load product variants');
        this.allVariants = [];
        this.filteredVariants = [];
      }
    });
  }
  
  applyVariantFilter(event: any): void {
    const filterValue = event.target.value.toLowerCase();
    this.filteredVariants = this.allVariants.filter(variant =>
      variant.variantName.toLowerCase().includes(filterValue) ||
      variant.attributes.some((a: any) => 
        a.variationName.toLowerCase().includes(filterValue) ||
        a.variationOptionName.toLowerCase().includes(filterValue)
      )
    );
  }
  
  addVariantToCart(variant: any): void {
    if (variant.requestQuantity && variant.requestQuantity > 0) {
      const existingIndex = this.transferCart.findIndex(item => item.variantId === variant.id);
      
      if (existingIndex >= 0) {
        // Update existing cart item
        this.transferCart[existingIndex].quantity = variant.requestQuantity;
      } else {
        // Add new cart item
        this.transferCart.push({
          productId: this.selectedProduct.id,
          productName: this.selectedProduct.name,
          variantId: variant.id,
          variantName: variant.variantName,
          sku: variant.sku,
          quantity: variant.requestQuantity
        });
      }
      
      // Reset request quantity
      variant.requestQuantity = 0;
      this.toastService.success('Added', 'Item added to request cart');
    }
  }  
  
  removeFromTransferCart(index: number): void {
    this.transferCart.splice(index, 1);
    this.toastService.info('Removed', 'Item removed from cart');
  }
  
  updateCartItemQuantity(index: number, quantity: number): void {
    const item = this.transferCart[index];
    if (quantity > 0) {
      item.quantity = quantity;
    } else {
      this.toastService.error('Error', 'Quantity must be at least 1');
      item.quantity = 1;
    }
  }
  
  isVariantInCart(variant: any): boolean {
    return this.transferCart.some(item => item.variantId === variant.id);
  }

  onSubmit() {
    if (!this.vanForm.valid) {
      this.vanForm.markAllAsTouched();
      this.toastService.error('Validation Error', 'Please fill in all required fields');
      return;
    }
    
    if (!this.selectedCustomer || !this.selectedLocation) {
      this.toastService.error('Validation Error', 'Please select customer and location');
      return;
    }
    
    if (this.transferCart.length === 0) {
      this.toastService.error('Validation Error', 'Please add items to request cart');
      return;
    }
    
    // Prepare items from request cart
    const items = this.transferCart.map(item => ({
      productId: item.productId,
      productVariantId: item.variantId,
      quantity: item.quantity
    }));
    
    const requestData = {
      customerId: this.selectedCustomer.id,
      locationId: this.selectedLocation.id,
      items: items
    };
    
    this.isSaving = true;
    this.restockRequestService.createRequest(requestData).subscribe({
      next: (response) => {
        this.toastService.success('Success', `Restock request created successfully. ${this.transferCart.length} item(s) requested.`);
        this.isSaving = false;
        this.router.navigate(['/inlocation']);
      },
      error: (error) => {
        console.error('Error creating restock request:', error);
        const errorMessage = error.error?.message || error.error || 'Failed to create restock request';
        this.toastService.error('Error', errorMessage);
        this.isSaving = false;
      }
    });
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
  
  getFilteredWarehouses() {
    if (!this.warehouseSearchTerm) {
      return this.warehouses;
    }
    return this.warehouses.filter(warehouse => 
      warehouse.name.toLowerCase().includes(this.warehouseSearchTerm.toLowerCase())
    );
  }
  
  filterWarehouses() {
    // Trigger filtering when user types
  }
  
  hideWarehouseDropdown() {
    setTimeout(() => {
      this.showWarehouseDropdown = false;
    }, 200);
  }
  
  clearWarehouse() {
    this.selectedWarehouse = null;
    this.warehouseSearchTerm = '';
    this.vanForm.patchValue({ warehouse: '' });
    this.showWarehouseDropdown = false;
    this.products = [];
    this.allVariants = [];
    this.filteredVariants = [];
    this.transferCart = [];
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
    
    // Load locations for selected customer
    this.selectedLocation = null;
    this.locationSearchTerm = '';
    this.locations = [];
    this.loadLocationsByCustomer(customer.id);
  }
  
  // COMMENTED OUT: Warehouse selection
  // selectWarehouse(warehouse: any) {
  //   this.selectedWarehouse = warehouse;
  //   this.warehouseSearchTerm = warehouse.name;
  //   this.vanForm.patchValue({ warehouse: warehouse.value });
  //   this.showWarehouseDropdown = false;
  //   
  //   // Clear product selection and load warehouse inventory
  //   this.selectedProduct = null;
  //   this.productSearchTerm = '';
  //   this.products = [];
  //   this.allVariations = [];
  //   this.filteredVariations = [];
  //   this.transferCart = [];
  //   
  //   // Load inventory for selected warehouse
  //   this.loadWarehouseInventory(warehouse.id);
  // }
  
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
    
    // Load variants for the product
    this.loadProductVariants(product.id);
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
    this.locationSearchTerm = '';
    this.allVariants = [];
    this.productSearchTerm = '';
    this.filteredVariants = [];
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
    this.allVariants = [];
    this.filteredVariants = [];
  }
}
