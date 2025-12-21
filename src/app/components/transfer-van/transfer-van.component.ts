import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { VanService } from '../../services/van.service';
import { LocationService } from '../../services/location.service';
import { WarehouseService } from '../../services/warehouse.service';
import { WarehouseInventoryService } from '../../services/warehouse-inventory.service';
import { VanInventoryService } from '../../services/van-inventory.service';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-transfer-van',
  templateUrl: './transfer-van.component.html',
  styleUrl: './transfer-van.component.css'
})
export class TransferVanComponent implements OnInit {
  vanForm: FormGroup;
  startTime: string = '';
  endTime: string = '';
  selectedTransferOption: string = 'manual';
  showScanPopup: boolean = false;
  scannedItems: Array<{ index: number; productName: string; sku: string; productId?: number; variationId?: number } > = [];
  manualAdjustmentCount: number = 1;
  scanReason: string = '';

  // Navigation state
  isFromTransfers: boolean = false;

  // Search terms for dropdowns
  vanSearchTerm: string = '';
  warehouseSearchTerm: string = '';
  locationSearchTerm: string = '';
  productSearchTerm: string = '';
  
  // Dropdown visibility states
  showVanDropdown: boolean = false;
  showWarehouseDropdown: boolean = false;
  showLocationDropdown: boolean = false;
  showProductDropdown: boolean = false;
  
  // Selected items
  selectedVan: any = null;
  selectedWarehouse: any = null;
  selectedLocation: any = null;
  selectedProduct: any = null;

  // Data arrays for dropdowns
  vans: any[] = [];
  warehouses: any[] = [];
  locations: any[] = [];
  products: any[] = [];
  warehouseInventoryItems: any[] = [];
  allVariants: any[] = [];
  filteredVariants: any[] = [];
  transferCart: any[] = [];
  
  // Loading states
  isLoading = false;
  isSaving = false;
  isLoadingVans = false;
  isLoadingWarehouses = false;
  isLoadingLocations = false;
  isLoadingProducts = false;
  isLoadingInventory = false;
  
  variationSearchTerm: string = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private route: ActivatedRoute,
    private vanService: VanService,
    private warehouseService: WarehouseService,
    private warehouseInventoryService: WarehouseInventoryService,
    private locationService: LocationService,
    private vanInventoryService: VanInventoryService,
    private productService: ProductService,
    private toastService: ToastService
  ) {
    this.selectedTransferOption = 'manual';
    this.vanForm = this.fb.group({
      van: ['', Validators.required],
      warehouse: ['', Validators.required],
      // location: ['', Validators.required], // COMMENTED OUT FOR FUTURE PHASE
      product: [''],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });

    this.scannedItems = [];
  }

  ngOnInit() {
    // Check query parameters to determine navigation source
    this.route.queryParams.subscribe(params => {
      if (params['from'] === 'transfers') {
        this.isFromTransfers = true;
      }
    });
    
    this.loadWarehouses();
    this.loadVans();
    // this.loadLocations(); // COMMENTED OUT FOR FUTURE PHASE
  }
  
  loadVans(): void {
    this.isLoadingVans = true;
    this.vanService.getVans().subscribe({
      next: (vans) => {
        this.vans = vans.map(v => ({
          value: v.id,
          name: v.vanName,
          id: v.id
        }));
        this.isLoadingVans = false;
      },
      error: (error) => {
        console.error('Error loading vans:', error);
        this.toastService.error('Error', 'Failed to load vans');
        this.isLoadingVans = false;
      }
    });
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
  
  loadLocations(): void {
    this.isLoadingLocations = true;
    this.locationService.getLocations().subscribe({
      next: (locations) => {
        this.locations = locations.map(l => ({
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
  
  loadWarehouseInventory(warehouseId: number): void {
    this.isLoadingInventory = true;
    this.warehouseInventoryService.getInventoryByWarehouse(warehouseId).subscribe({
      next: (items) => {
        this.warehouseInventoryItems = items;
        
        // Get unique products from warehouse inventory
        const uniqueProductIds = [...new Set(items.map(item => item.productId))];
        
        // Load products that exist in this warehouse's inventory
        this.products = [];
        uniqueProductIds.forEach(productId => {
          const inventoryItem = items.find(item => item.productId === productId);
          if (inventoryItem) {
            this.products.push({
              value: productId,
              name: inventoryItem.productName,
              id: productId,
              sku: inventoryItem.productSKU || ''
            });
          }
        });
        
        this.isLoadingInventory = false;
      },
      error: (error) => {
        console.error('Error loading warehouse inventory:', error);
        this.toastService.error('Error', 'Failed to load warehouse inventory');
        this.isLoadingInventory = false;
      }
    });
  }
  
  loadProductVariants(productId: number): void {
    // Load product variants with attributes from API
    this.productService.getProductVariantsWithAttributes(productId).subscribe({
      next: (variants) => {
        // Get variants that exist in warehouse inventory
        const warehouseVariantIds = this.warehouseInventoryItems
          .filter(item => item.productId === productId && item.productVariantId)
          .map(item => item.productVariantId);
        
        this.allVariants = variants
          .filter(v => warehouseVariantIds.includes(v.id))
          .map(v => {
            const inventoryItem = this.warehouseInventoryItems
              .find(item => item.productVariantId === v.id);
            
            return {
              id: v.id,
              variantName: v.variantName,
              sku: v.sku,
              availableQuantity: inventoryItem?.quantity || 0,
              transferQuantity: 0,
              inventoryId: inventoryItem?.id,
              attributes: v.attributes.map(a => ({
                variationName: a.variationName,
                variationOptionName: a.variationOptionName
              }))
            };
          });
        
        this.filteredVariants = [...this.allVariants];
      },
      error: (error) => {
        console.error('Error loading product variants:', error);
        this.toastService.error('Error', 'Failed to load product variants');
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
    if (variant.transferQuantity && variant.transferQuantity > 0 && variant.transferQuantity <= variant.availableQuantity) {
      const existingIndex = this.transferCart.findIndex(item => item.variantId === variant.id);
      
      if (existingIndex >= 0) {
        // Update existing cart item
        this.transferCart[existingIndex].quantity = variant.transferQuantity;
      } else {
        // Add new cart item
        this.transferCart.push({
          productId: this.selectedProduct.id,
          productName: this.selectedProduct.name,
          variantId: variant.id,
          variantName: variant.variantName,
          sku: variant.sku,
          quantity: variant.transferQuantity,
          availableQuantity: variant.availableQuantity
        });
      }
      
      // Reset transfer quantity
      variant.transferQuantity = 0;
      this.toastService.success('Added', 'Item added to transfer cart');
    } else if (variant.transferQuantity > variant.availableQuantity) {
      this.toastService.error('Error', `Quantity cannot exceed available quantity (${variant.availableQuantity})`);
    }
  }
  
  removeFromTransferCart(index: number): void {
    this.transferCart.splice(index, 1);
    this.toastService.info('Removed', 'Item removed from cart');
  }
  
  updateCartItemQuantity(index: number, quantity: number): void {
    const item = this.transferCart[index];
    if (quantity > 0 && quantity <= item.availableQuantity) {
      item.quantity = quantity;
    } else if (quantity > item.availableQuantity) {
      this.toastService.error('Error', `Quantity cannot exceed available quantity (${item.availableQuantity})`);
      item.quantity = item.availableQuantity;
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
    
    if (!this.selectedVan || !this.selectedWarehouse) {
      this.toastService.error('Validation Error', 'Please select van and warehouse');
      return;
    }
    
    if (this.transferCart.length === 0) {
      this.toastService.error('Validation Error', 'Please add items to transfer cart');
      return;
    }
    
    // Prepare items from transfer cart
    const items = this.transferCart.map(item => ({
      productId: item.productId,
      productVariantId: item.variantId,
      quantity: item.quantity
    }));
    
    const transferData: any = {
      vanId: this.selectedVan.id,
      warehouseId: this.selectedWarehouse.id,
      items: items
    };
    
    // COMMENTED OUT FOR FUTURE PHASE: Add locationId when location is selected
    // if (this.selectedLocation) {
    //   transferData.locationId = this.selectedLocation.id;
    // }
    
    this.isSaving = true;
    this.vanInventoryService.createTransfer(transferData).subscribe({
      next: (response) => {
        this.toastService.success('Success', `Transfer to van created successfully. ${this.transferCart.length} item(s) transferred.`);
        this.isSaving = false;
        this.router.navigate(['/invans']);
      },
      error: (error) => {
        console.error('Error creating transfer:', error);
        const errorMessage = error.error?.message || error.error || 'Failed to create transfer to van';
        this.toastService.error('Error', errorMessage);
        this.isSaving = false;
      }
    });
  }

  onCancel() {
    this.vanForm.reset();
    this.selectedVan = null;
    this.selectedWarehouse = null;
    this.selectedLocation = null;
    this.selectedProduct = null;
    this.vanSearchTerm = '';
    this.warehouseSearchTerm = '';
    this.locationSearchTerm = '';
    this.productSearchTerm = '';
    this.transferCart = [];
    this.allVariants = [];
    this.filteredVariants = [];
    this.router.navigate(['/invans']);
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
  
  getFilteredWarehouses() {
    if (!this.warehouseSearchTerm) {
      return this.warehouses;
    }
    return this.warehouses.filter(warehouse => 
      warehouse.name.toLowerCase().includes(this.warehouseSearchTerm.toLowerCase())
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
  
  filterVans() {
    // Trigger filtering when user types
  }
  
  filterWarehouses() {
    // Trigger filtering when user types
  }
  
  filterLocations() {
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
  
  selectWarehouse(warehouse: any) {
    this.selectedWarehouse = warehouse;
    this.warehouseSearchTerm = warehouse.name;
    this.vanForm.patchValue({ warehouse: warehouse.value });
    this.showWarehouseDropdown = false;
    
    // Clear product selection and load warehouse inventory
    this.selectedProduct = null;
    this.productSearchTerm = '';
    this.products = [];
    this.allVariants = [];
    this.filteredVariants = [];
    this.transferCart = [];
    
    // Load inventory for selected warehouse
    this.loadWarehouseInventory(warehouse.id);
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
    
    // Load variants from API
    this.loadProductVariants(product.id);
  }
  
  hideVanDropdown() {
    setTimeout(() => {
      this.showVanDropdown = false;
    }, 200);
  }
  
  hideWarehouseDropdown() {
    setTimeout(() => {
      this.showWarehouseDropdown = false;
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
  
  clearVan() {
    this.selectedVan = null;
    this.vanSearchTerm = '';
    this.vanForm.patchValue({ van: '' });
    this.showVanDropdown = false;
  }
  
  clearWarehouse() {
    this.selectedWarehouse = null;
    this.warehouseSearchTerm = '';
    this.vanSearchTerm = '';
    this.productSearchTerm = '';
    this.vanForm.patchValue({ warehouse: '' });
    this.showWarehouseDropdown = false;
    this.products = [];
    this.allVariants = [];
    this.filteredVariants = [];
    this.transferCart = [];
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

