import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { VanService } from '../../services/van.service';
import { LocationService } from '../../services/location.service';
import { TransferInventoryService } from '../../services/transfer-inventory.service';
import { VanInventoryService } from '../../services/van-inventory.service';
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
  locationSearchTerm: string = '';
  productSearchTerm: string = '';
  
  // Dropdown visibility states
  showVanDropdown: boolean = false;
  showLocationDropdown: boolean = false;
  showProductDropdown: boolean = false;
  
  // Selected items
  selectedVan: any = null;
  selectedLocation: any = null;
  selectedProduct: any = null;

  // Data arrays for dropdowns
  vans: any[] = [];
  locations: any[] = [];
  products: any[] = [];
  transferInventoryItems: any[] = [];
  allVariations: any[] = [];
  filteredVariations: any[] = [];
  transferCart: any[] = [];
  
  // Loading states
  isLoading = false;
  isSaving = false;
  isLoadingVans = false;
  isLoadingLocations = false;
  isLoadingProducts = false;
  isLoadingInventory = false;
  
  variationSearchTerm: string = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private route: ActivatedRoute,
    private vanService: VanService,
    private locationService: LocationService,
    private transferInventoryService: TransferInventoryService,
    private vanInventoryService: VanInventoryService,
    private toastService: ToastService
  ) {
    this.selectedTransferOption = 'manual';
    this.vanForm = this.fb.group({
      van: ['', Validators.required],
      location: ['', Validators.required],
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
    
    this.loadVans();
    this.loadLocations();
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
  
  loadTransferInventoryByLocation(locationId: number): void {
    this.isLoadingInventory = true;
    this.transferInventoryService.getTransferItemsByLocationId(locationId).subscribe({
      next: (items) => {
        this.transferInventoryItems = items;
        
        // Get unique products from transfer inventory
        const uniqueProductIds = [...new Set(items.map(item => item.productId))];
        
        // Load products that exist in this location's transfer inventory
        this.products = [];
        uniqueProductIds.forEach(productId => {
          const inventoryItem = items.find(item => item.productId === productId);
          if (inventoryItem) {
            this.products.push({
              value: productId,
              name: inventoryItem.productName,
              id: productId,
              sku: inventoryItem.skuCode || ''
            });
          }
        });
        
        this.isLoadingInventory = false;
      },
      error: (error) => {
        console.error('Error loading transfer inventory:', error);
        this.toastService.error('Error', 'Failed to load location inventory');
        this.isLoadingInventory = false;
      }
    });
  }
  
  loadProductVariations(productId: number): void {
    // Get all inventory items for this product from the selected location
    const productInventory = this.transferInventoryItems.filter(item => item.productId === productId);
    
    // Map to variations with available quantity
    this.allVariations = productInventory.map(item => ({
      id: item.productVariationId,
      variationId: item.productVariationId,
      variationType: item.variationType || 'N/A',
      variationValue: item.variationValue || 'N/A',
      availableQuantity: item.quantity,
      transferQuantity: 0,
      inventoryId: item.id
    }));
    
    this.filteredVariations = [...this.allVariations];
  }
  
  applyVariationFilter(event: any): void {
    const filterValue = event.target.value.toLowerCase();
    this.filteredVariations = this.allVariations.filter(variation =>
      variation.variationType.toLowerCase().includes(filterValue) ||
      variation.variationValue.toLowerCase().includes(filterValue)
    );
  }
  
  addVariationToCart(variation: any): void {
    if (variation.transferQuantity && variation.transferQuantity > 0 && variation.transferQuantity <= variation.availableQuantity) {
      const existingIndex = this.transferCart.findIndex(item => item.variationId === variation.variationId);
      
      if (existingIndex >= 0) {
        // Update existing cart item
        this.transferCart[existingIndex].quantity = variation.transferQuantity;
      } else {
        // Add new cart item
        this.transferCart.push({
          productId: this.selectedProduct.id,
          productName: this.selectedProduct.name,
          variationId: variation.variationId,
          variationType: variation.variationType,
          variationValue: variation.variationValue,
          quantity: variation.transferQuantity,
          availableQuantity: variation.availableQuantity
        });
      }
      
      // Reset transfer quantity
      variation.transferQuantity = 0;
      this.toastService.success('Added', 'Item added to transfer cart');
    } else if (variation.transferQuantity > variation.availableQuantity) {
      this.toastService.error('Error', `Quantity cannot exceed available quantity (${variation.availableQuantity})`);
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
  
  isVariationInCart(variation: any): boolean {
    return this.transferCart.some(item => item.variationId === variation.variationId);
  }

  onSubmit() {
    if (!this.vanForm.valid) {
      this.vanForm.markAllAsTouched();
      this.toastService.error('Validation Error', 'Please fill in all required fields');
      return;
    }
    
    if (!this.selectedVan || !this.selectedLocation) {
      this.toastService.error('Validation Error', 'Please select van and location');
      return;
    }
    
    if (this.transferCart.length === 0) {
      this.toastService.error('Validation Error', 'Please add items to transfer cart');
      return;
    }
    
    // Prepare items from transfer cart
    const items = this.transferCart.map(item => ({
      productId: item.productId,
      productVariationId: item.variationId,
      quantity: item.quantity
    }));
    
    const transferData = {
      vanId: this.selectedVan.id,
      locationId: this.selectedLocation.id,
      items: items
    };
    
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
    this.selectedLocation = null;
    this.selectedProduct = null;
    this.vanSearchTerm = '';
    this.locationSearchTerm = '';
    this.productSearchTerm = '';
    this.transferCart = [];
    this.allVariations = [];
    this.filteredVariations = [];
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
  
  selectLocation(location: any) {
    this.selectedLocation = location;
    this.locationSearchTerm = location.name;
    this.vanForm.patchValue({ location: location.value });
    this.showLocationDropdown = false;
    
    // Clear product selection and load location inventory
    this.selectedProduct = null;
    this.productSearchTerm = '';
    this.products = [];
    this.allVariations = [];
    this.filteredVariations = [];
    this.transferCart = [];
    
    // Load inventory for selected location
    this.loadTransferInventoryByLocation(location.id);
  }
  
  selectProduct(product: any) {
    this.selectedProduct = product;
    this.productSearchTerm = product.name;
    this.vanForm.patchValue({ product: product.value });
    this.showProductDropdown = false;
    
    // Load variations from location inventory
    this.loadProductVariations(product.id);
  }
  
  hideVanDropdown() {
    setTimeout(() => {
      this.showVanDropdown = false;
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
  
  clearLocation() {
    this.selectedLocation = null;
    this.locationSearchTerm = '';
    this.vanForm.patchValue({ location: '' });
    this.showLocationDropdown = false;
    this.products = [];
    this.allVariations = [];
    this.filteredVariations = [];
    this.transferCart = [];
  }
  
  clearProduct() {
    this.selectedProduct = null;
    this.productSearchTerm = '';
    this.vanForm.patchValue({ product: '' });
    this.showProductDropdown = false;
    this.allVariations = [];
    this.filteredVariations = [];
  }
}

