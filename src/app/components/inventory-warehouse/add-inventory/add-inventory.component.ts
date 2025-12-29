import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { WarehouseInventoryService } from '../../../services/warehouse-inventory.service';
import { WarehouseService } from '../../../services/warehouse.service';
import { ProductService, ProductVariantDto } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';
import { BarcodeScannerService, ScanResult } from '../../../services/barcode-scanner.service';
import { AddBulkInventoryRequest, BulkInventoryItem, WarehouseInventoryResponse } from '../../../models/warehouse-inventory.model';
import { WarehouseResponse } from '../../../models/warehouse.model';
import { ProductApiModel } from '../../../models/product.model';

export interface Variant {
  id: number;
  variantName: string;
  sku?: string;
  price?: number;
  quantity?: number;
  currentQuantity?: number; // Existing quantity in warehouse
  inventoryId?: number; // Warehouse inventory ID for updates
  attributes: { variationName: string; variationOptionName: string }[];
}

export interface InventoryCartItem {
  variantId?: number;
  variantName?: string;
  quantity: number;
  isUniversal?: boolean;
  inventoryId?: number; // For tracking existing inventory items
}

@Component({
  selector: 'app-add-inventory',
  templateUrl: './add-inventory.component.html',
  styleUrl: './add-inventory.component.css'
})
export class AddInventoryComponent implements OnInit, OnDestroy {
  inventoryForm: FormGroup;
  
  // Product variants from selected product
  allVariants: Variant[] = [];
  filteredVariants: Variant[] = [];
  searchTerm: string = '';
  
  // Available product variants for the selected product
  productVariants: ProductVariantDto[] = [];
  
  // Inventory cart for managing multiple variants with quantities
  inventoryCart: InventoryCartItem[] = [];
  
  // Universal product quantity (for products without variations)
  universalProductQuantity: number = 0;
  universalProductInCart: boolean = false;
  
  // Search terms for dropdowns
  warehouseSearchTerm: string = '';
  productSearchTerm: string = '';
  
  // Dropdown visibility states
  showWarehouseDropdown: boolean = false;
  showProductDropdown: boolean = false;
  
  // Selected items
  selectedWarehouse: WarehouseResponse | null = null;
  selectedProduct: ProductApiModel | null = null;
  
  // Data arrays for dropdowns
  warehouses: WarehouseResponse[] = [];
  products: ProductApiModel[] = [];
  loading = false;
  
  // Edit mode
  warehouseId: number | null = null;
  warehouseInventoryItems: WarehouseInventoryResponse[] = [];
  warehouseProducts: ProductApiModel[] = []; // Products that exist in this warehouse

  // Barcode scanning
  isScanning: boolean = false;
  private scanSubscription: Subscription | null = null;
  
  // Test mode properties
  testBarcode: string = '';
  showTestInterface: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute,
    private warehouseInventoryService: WarehouseInventoryService,
    private warehouseService: WarehouseService,
    private productService: ProductService,
    private toastService: ToastService,
    private barcodeScannerService: BarcodeScannerService
  ) {
    this.inventoryForm = this.fb.group({
      warehouseName: ['', Validators.required],
      prodcut: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode first
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.warehouseId = +params['id'];
      }
    });
    
    // Load data
    this.loadWarehouses();
    this.loadProducts();
    
    // Add test products if in test mode
    if (this.barcodeScannerService.isTestMode()) {
      this.addTestProducts();
    }
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (warehouses) => {
        this.warehouses = warehouses;
      },
      error: (error) => {
        console.error('Error loading warehouses:', error);
      }
    });
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        
        // If in edit mode and warehouse is already loaded, load existing inventory
        this.loadExistingInventory(this?.selectedWarehouse?.id || 0);
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  loadWarehouseForEdit(warehouseId: number): void {
    // Find warehouse from the already loaded list
    const warehouse = this.warehouses.find(w => w.id === warehouseId);
    
    if (warehouse) {
      this.selectedWarehouse = warehouse;
      this.warehouseSearchTerm = warehouse.name;
      this.inventoryForm.patchValue({ warehouseName: warehouse.id });
      
      // Load existing inventory if products are already loaded
      if (this.products.length > 0) {
        this.loadExistingInventory(warehouseId);
      }
    } else {
      // Fallback: load from API if not found in list
      this.warehouseService.getWarehouseById(warehouseId).subscribe({
        next: (warehouse) => {
          this.selectedWarehouse = warehouse;
          this.warehouseSearchTerm = warehouse.name;
          this.inventoryForm.patchValue({ warehouseName: warehouse.id });
          
          // Load existing inventory if products are already loaded
          if (this.products.length > 0) {
            this.loadExistingInventory(warehouseId);
          }
        },
        error: (error) => {
          console.error('Error loading warehouse:', error);
          // Navigate back if warehouse not found
          this.router.navigate(['/inwarehouse']);
        }
      });
    }
  }

  loadExistingInventory(warehouseId: number): void {
    this.warehouseInventoryService.getInventoryByWarehouse(warehouseId).subscribe({
      next: (inventoryItems) => {
        this.warehouseInventoryItems = inventoryItems;
        
        if (inventoryItems.length > 0) {
          // Get unique product IDs from inventory
          const uniqueProductIds = [...new Set(inventoryItems.map(item => item.productId))];
          
          // Load all products that exist in this warehouse
          this.loadWarehouseProducts(uniqueProductIds);
        }
      },
      error: (error) => {
        console.error('Error loading existing inventory:', error);
      }
    });
  }

  loadWarehouseProducts(productIds: number[]): void {
    this.warehouseProducts = [];
    
    // Load each product
    productIds.forEach(productId => {
      const product = this.products.find(p => p.id === productId);
      
      if (product) {
        this.warehouseProducts.push(product);
      } else {
        // If product not in loaded list, fetch it
        this.productService.getProductById(productId).subscribe({
          next: (product) => {
            // Add to products list if not already there
            if (!this.products.find(p => p.id === product.id)) {
              this.products.push(product);
            }
            this.warehouseProducts.push(product);
          },
          error: (error) => {
            console.error('Error loading product:', error);
          }
        });
      }
    });
  }

  selectProductForEdit(product: ProductApiModel, inventoryItems: WarehouseInventoryResponse[]): void {
    this.selectedProduct = product;
    this.productSearchTerm = product.name;
    this.inventoryForm.patchValue({ prodcut: product.id });
    
    // Load variants from the API with attributes
    this.productService.getProductVariantsWithAttributes(product.id).subscribe({
      next: (variants) => {
        this.productVariants = variants;
        variants.map(x => x.sku = this.warehouseProducts.find(p => p.id === x.productId)?.barcodeSKU
        || this.warehouseProducts.find(p => p.id === x.productId)?.barcodeSKU2 
        || this.warehouseProducts.find(p => p.id === x.productId)?.barcodeSKU3 
        || this.warehouseProducts.find(p => p.id === x.productId)?.barcodeSKU4 
        || '');
        // Convert ProductVariantDto to Variant interface and map existing quantities
        this.allVariants = variants.map(v => {
          // Find existing inventory for this variant
          const existingInventory = inventoryItems.find(item => item.productVariantId === v.id);
          
          return {
            id: v.id,
            variantName: v.variantName,
            sku: v.sku,
            price: v.price,
            quantity: 0, // New quantity to add
            currentQuantity: existingInventory ? existingInventory.quantity : 0,
            inventoryId: existingInventory ? existingInventory.id : undefined,
            attributes: v.attributes.map(a => ({
              variationName: a.variationName,
              variationOptionName: a.variationOptionName
            }))
          };
        });
        
        this.filteredVariants = [...this.allVariants];
        
        // Don't clear cart in edit mode - we want to preserve the state
        this.clearInventoryData();
      },
      error: (error) => {
        console.error('Error loading product variants:', error);
        this.toastService.error('Error', 'Failed to load product variants');
      }
    });
  }

  loadProductVariants(product: ProductApiModel): void {
    // Load variants from the API with attributes
    this.productService.getProductVariantsWithAttributes(product.id).subscribe({
      next: (variants) => {
        this.productVariants = variants;
        
        // Convert ProductVariantDto to Variant interface for the UI
        this.allVariants = variants.map(v => {
          // Find existing inventory for this variant
          const existingInventory = this.warehouseInventoryItems.find(item => item.productVariantId === v.id);
          return {
            id: v.id,
            variantName: v.variantName,
            sku: v.sku,
            price: v.price,
            quantity: 0,
            currentQuantity: 0,
            attributes: v.attributes.map(a => ({
              variationName: a.variationName,
              variationOptionName: a.variationOptionName
            }))
          };
        });
        
        this.filteredVariants = [...this.allVariants];
        
        // Clear cart when product changes (only in add mode)
        this.clearInventoryData();
      },
      error: (error) => {
        console.error('Error loading product variants:', error);
        this.toastService.error('Error', 'Failed to load product variants');
        this.allVariants = [];
        this.filteredVariants = [];
      }
    });
  }

  clearProductVariants(): void {
    this.productVariants = [];
    this.allVariants = [];
    this.filteredVariants = [];
    this.clearInventoryData();
  }

  clearInventoryData(): void {
    this.inventoryCart = [];
    this.universalProductQuantity = 0;
    this.universalProductInCart = false;
  }

  applyFilter(event: any): void {
    const filterValue = event.target.value.toLowerCase();
    this.filteredVariants = this.allVariants.filter(variant =>
      variant.variantName.toLowerCase().includes(filterValue) ||
      variant.attributes.some(a => 
        a.variationName.toLowerCase().includes(filterValue) ||
        a.variationOptionName.toLowerCase().includes(filterValue)
      )
    );
  }

  updateVariantQuantity(variant: Variant): void {
    // Update quantity in the variant object
    // This is handled by ngModel binding
  }

  addVariantToCart(variant: Variant): void {
    if (variant.quantity && variant.quantity > 0 && !this.isVariantInCart(variant)) {
      const cartItem: InventoryCartItem = {
        variantId: variant.id,
        variantName: variant.variantName,
        quantity: variant.quantity,
        isUniversal: false,
        inventoryId: variant.inventoryId // Include inventory ID for updates
      };
      
      this.inventoryCart.push(cartItem);
      
      // Reset the variant quantity after adding to cart
      variant.quantity = 0;
    } else if (this.isVariantInCart(variant)) {
      // If variant is already in cart, increase its quantity
      const existingCartItem = this.inventoryCart.find(item => item.variantId === variant.id);
      if (existingCartItem && variant.quantity && variant.quantity > 0) {
        existingCartItem.quantity += variant.quantity;
        variant.quantity = 0;
        this.toastService.success('Quantity Updated', `${variant.variantName} quantity updated to ${existingCartItem.quantity}`);
      }
    }
  }

  addUniversalProductToCart(): void {
    if (this.universalProductQuantity > 0 && !this.universalProductInCart) {
      const cartItem: InventoryCartItem = {
        quantity: this.universalProductQuantity,
        isUniversal: true
      };
      
      this.inventoryCart.push(cartItem);
      this.universalProductInCart = true;
      this.universalProductQuantity = 0;
    }
  }

  isVariantInCart(variant: Variant): boolean {
    return this.inventoryCart.some(item => 
      item.variantId === variant.id
    );
  }

  removeFromCart(index: number): void {
    const removedItem = this.inventoryCart[index];
    
    if (removedItem.isUniversal) {
      this.universalProductInCart = false;
    }
    
    this.inventoryCart.splice(index, 1);
  }

  updateCartItemQuantity(index: number, quantity: number): void {
    if (quantity > 0) {
      this.inventoryCart[index].quantity = quantity;
    }
  }

  getFilteredWarehouses() {
    if (!this.warehouseSearchTerm) {
      return this.warehouses;
    }
    return this.warehouses.filter(warehouse => 
      warehouse.name.toLowerCase().includes(this.warehouseSearchTerm.toLowerCase())
    );
  }
  
  getFilteredProducts() {
    // In edit mode, only show products that exist in this warehouse
    const productsToFilter = this.products;
    
    if (!this.productSearchTerm) {
      return productsToFilter;
    }
    return productsToFilter.filter(product => 
      product.name.toLowerCase().includes(this.productSearchTerm.toLowerCase())
    );
  }
  
  filterWarehouses() {
    // Trigger filtering when user types
  }
  
  filterProducts() {
    // Trigger filtering when user types
  }
  
  selectWarehouse(warehouse: WarehouseResponse) {
    this.warehouseId = warehouse.id;
    this.clearProduct();
    this.loadExistingInventory(this.warehouseId);
    this.selectedWarehouse = warehouse;
    this.warehouseSearchTerm = warehouse.name;
    this.inventoryForm.patchValue({ warehouseName: warehouse.id });
    this.showWarehouseDropdown = false;
  }
  
  selectProduct(product: ProductApiModel) {
    this.selectedProduct = product;
    this.productSearchTerm = product.name;
    this.inventoryForm.patchValue({ prodcut: product.id });
    this.showProductDropdown = false;
    
    this.selectProductForEdit(product, this.warehouseInventoryItems);
  }
  
  hideWarehouseDropdown() {
    setTimeout(() => {
      this.showWarehouseDropdown = false;
    }, 200);
  }
  
  hideProductDropdown() {
    setTimeout(() => {
      this.showProductDropdown = false;
    }, 200);
  }
  
  clearWarehouse() {
    this.selectedWarehouse = null;
    this.warehouseSearchTerm = '';
    this.productSearchTerm = '';
    this.allVariants = [];
    this.filteredVariants = [];
    this.inventoryForm.patchValue({ warehouseName: '' });
    this.showWarehouseDropdown = false;
  }
  
  clearProduct() {
    this.selectedProduct = null;
    this.productSearchTerm = '';
    this.inventoryForm.patchValue({ prodcut: '' });
    this.showProductDropdown = false;
    
    // Clear variants and inventory data when product is cleared
    this.clearProductVariants();
  }

  onSubmit(): void {
    if (this.selectedWarehouse && this.selectedProduct && this.inventoryCart.length > 0) {
      this.loading = true;
      
      // Prepare bulk inventory request
      const bulkInventoryItems: BulkInventoryItem[] = this.inventoryCart.map(item => ({
        productVariantId: item.variantId, // Use ProductVariantId (nullable for universal products)
        quantity: item.quantity,
        notes: item.isUniversal 
          ? 'Universal product - no variants' 
          : `Variant: ${item.variantName}`
      }));

      const addBulkInventoryRequest: AddBulkInventoryRequest = {
        warehouseId: this.selectedWarehouse.id,
        productId: this.selectedProduct.id,
        inventoryItems: bulkInventoryItems
      };

      const actionText = 'Adding';
      const successText = 'added';
      
      this.toastService.info('Saving', `${actionText} inventory...`);

      // Execute bulk inventory addition
      this.warehouseInventoryService.addBulkInventory(addBulkInventoryRequest).subscribe({
        next: (responses) => {
          console.log('All inventory items added successfully:', responses);
          this.loading = false;
          this.toastService.success('Success', `Inventory has been ${successText} successfully`);
          this.router.navigate(['/inwarehouse']);
        },
        error: (error) => {
          console.error('Error adding inventory items:', error);
          this.loading = false;
          const message = error?.error?.message || `Failed to ${actionText.toLowerCase()} inventory`;
          this.toastService.error('Error', message);
        }
      });
    } else {
      this.toastService.error('Error', 'Please select warehouse, product and add items to cart');
    }
  }

  changeProduct() {
    // Clear current product selection and cart
    this.selectedProduct = null;
    this.productSearchTerm = '';
    this.clearProductVariants();
    this.inventoryCart = [];
  }

  onCancel() {
    this.router.navigate(['/inwarehouse']);
  }

  addAnotherInventory() {
    this.inventoryForm.reset();
  }

  goToWarehousesList() {
    this.router.navigate(['/warehouse']);
  }

  ngOnDestroy(): void {
    // Clean up scan subscription
    if (this.scanSubscription) {
      this.scanSubscription.unsubscribe();
    }
    this.barcodeScannerService.stopScanning();
  }

  startBarcodeScanning(): void {
    if (!this.selectedWarehouse) {
      this.toastService.error('Error', 'Please select a warehouse first');
      return;
    }

    // Prevent multiple subscriptions
    if (this.isScanning) {
      return;
    }

    this.isScanning = true;
    
    // Only show toast if not in test simulation mode
    if (!this.barcodeScannerService.isTestMode() || this.showTestInterface === false) {
      this.toastService.info('Scanner Ready', 'Point the CipherLab RS35 scanner at a barcode');
    }

    // Clean up any existing subscription
    if (this.scanSubscription) {
      this.scanSubscription.unsubscribe();
      this.scanSubscription = null;
    }

    // Subscribe to scan results
    this.scanSubscription = this.barcodeScannerService.startScanning().subscribe({
      next: (result: ScanResult | null) => {
        if (result) {
          this.handleScanResult(result);
        }
      },
      error: (error) => {
        console.error('Scan error:', error);
        this.isScanning = false;
        this.toastService.error('Scan Error', 'Failed to scan barcode');
      }
    });
  }

  private handleScanResult(result: ScanResult): void {
    this.isScanning = false;

    if (!result.success) {
      this.toastService.error('Scan Failed', result.error || 'Unable to read barcode');
      return;
    }

    const scannedBarcode = result.barcode;
    this.toastService.success('Barcode Scanned', `Code: ${scannedBarcode}`);

    // Search for product by barcode
    this.findProductByBarcode(scannedBarcode);
  }

  private findProductByBarcode(barcode: string): void {
    // Search through all products to find matching barcode
    const matchingProduct = this.products.find(product => 
      product.barcodeSKU === barcode ||
      product.barcodeSKU2 === barcode ||
      product.barcodeSKU3 === barcode ||
      product.barcodeSKU4 === barcode
    );

    if (matchingProduct) {
      // Check if this is the same product already selected
      if (this.selectedProduct && this.selectedProduct.id === matchingProduct.id) {
        // Same product - try to add/increase variant quantity
        this.handleSameProductScan(barcode);
      } else {
        // Different product - auto-select it
        this.selectProduct(matchingProduct);
        this.toastService.success('Product Found', `Selected: ${matchingProduct.name}`);
        
        // Try to find matching variant by SKU
        setTimeout(() => {
          this.findAndSelectVariantBySKU(barcode);
        }, 500);
      }
    } else {
      // If no product found, try to find variant in currently selected product
      if (this.selectedProduct) {
        this.findAndSelectVariantBySKU(barcode);
      } else {
        this.toastService.error('Not Found', `No product found with barcode: ${barcode}`);
      }
    }
  }

  private handleSameProductScan(barcode: string): void {
    // Product is already selected, try to add/increase variant
    if (this.allVariants.length === 1) {
      // Single variant - increase quantity
      const singleVariant = this.allVariants[0];
      const existingCartItem = this.inventoryCart.find(item => item.variantId === singleVariant.id);
      
      if (existingCartItem) {
        existingCartItem.quantity += 1;
        this.toastService.success('Quantity Updated', `${singleVariant.variantName} quantity increased to ${existingCartItem.quantity}`);
      } else {
        singleVariant.quantity = 1;
        this.addVariantToCart(singleVariant);
        this.toastService.success('Variant Added', `${singleVariant.variantName} added to cart`);
      }
    } else {
      // Multiple variants - try to find specific variant by SKU
      this.findAndSelectVariantBySKU(barcode);
    }
  }

  private findAndSelectVariantBySKU(sku: string): void {
    if (!this.selectedProduct || this.allVariants.length === 0) {
      return;
    }

    // Find variant with matching SKU
    const matchingVariant = this.allVariants.find(variant => 
      variant.sku === sku
    );

    if (matchingVariant) {
      // Check if variant is already in cart
      const existingCartItem = this.inventoryCart.find(item => item.variantId === matchingVariant.id);
      
      if (existingCartItem) {
        // Increase quantity if already in cart
        existingCartItem.quantity += 1;
        this.toastService.success('Quantity Updated', `${matchingVariant.variantName} quantity increased to ${existingCartItem.quantity}`);
      } else {
        // Add new variant to cart with quantity 1
        matchingVariant.quantity = 1;
        this.addVariantToCart(matchingVariant);
        this.toastService.success('Variant Added', `${matchingVariant.variantName} added to cart`);
      }
    } else {
      // If no specific variant found but product has only one variant, add/increase that variant
      if (this.allVariants.length === 1) {
        const singleVariant = this.allVariants[0];
        const existingCartItem = this.inventoryCart.find(item => item.variantId === singleVariant.id);
        
        if (existingCartItem) {
          // Increase quantity if already in cart
          existingCartItem.quantity += 1;
          this.toastService.success('Quantity Updated', `${singleVariant.variantName} quantity increased to ${existingCartItem.quantity}`);
        } else {
          // Add single variant to cart
          singleVariant.quantity = 1;
          this.addVariantToCart(singleVariant);
          this.toastService.success('Variant Added', `${singleVariant.variantName} added to cart`);
        }
      } else {
        this.toastService.warning('Variant Not Found', `No variant found with SKU: ${sku}`);
      }
    }
  }

  stopScanning(): void {
    this.isScanning = false;
    this.barcodeScannerService.stopScanning();
    if (this.scanSubscription) {
      this.scanSubscription.unsubscribe();
      this.scanSubscription = null;
    }
  }

  // Test mode methods
  toggleTestInterface(): void {
    this.showTestInterface = !this.showTestInterface;
  }

  isTestMode(): boolean {
    return this.barcodeScannerService.isTestMode();
  }

  simulateBarcodeScan(): void {
    if (!this.testBarcode.trim()) {
      this.toastService.error('Error', 'Please enter a barcode to simulate');
      return;
    }

    if (!this.selectedWarehouse) {
      this.toastService.error('Error', 'Please select a warehouse first');
      return;
    }

    // Start scanning silently if not already scanning
    if (!this.isScanning) {
      this.isScanning = true;
      
      // Clean up any existing subscription
      if (this.scanSubscription) {
        this.scanSubscription.unsubscribe();
        this.scanSubscription = null;
      }

      // Subscribe to scan results without showing "Scanner Ready" toast
      this.scanSubscription = this.barcodeScannerService.startScanning().subscribe({
        next: (result: ScanResult | null) => {
          if (result) {
            this.handleScanResult(result);
          }
        },
        error: (error) => {
          console.error('Scan error:', error);
          this.isScanning = false;
          this.toastService.error('Scan Error', 'Failed to scan barcode');
        }
      });

      // Wait a moment for scanning to start
      setTimeout(() => {
        this.barcodeScannerService.simulateScan(this.testBarcode.trim());
      }, 100);
    } else {
      this.barcodeScannerService.simulateScan(this.testBarcode.trim());
    }
  }

  simulateRandomScan(): void {
    if (!this.selectedWarehouse) {
      this.toastService.error('Error', 'Please select a warehouse first');
      return;
    }

    // Start scanning silently if not already scanning
    if (!this.isScanning) {
      this.isScanning = true;
      
      // Clean up any existing subscription
      if (this.scanSubscription) {
        this.scanSubscription.unsubscribe();
        this.scanSubscription = null;
      }

      // Subscribe to scan results without showing "Scanner Ready" toast
      this.scanSubscription = this.barcodeScannerService.startScanning().subscribe({
        next: (result: ScanResult | null) => {
          if (result) {
            this.handleScanResult(result);
          }
        },
        error: (error) => {
          console.error('Scan error:', error);
          this.isScanning = false;
          this.toastService.error('Scan Error', 'Failed to scan barcode');
        }
      });

      setTimeout(() => {
        this.barcodeScannerService.simulateRandomScan();
      }, 100);
    } else {
      this.barcodeScannerService.simulateRandomScan();
    }
  }

  simulateError(): void {
    if (!this.selectedWarehouse) {
      this.toastService.error('Error', 'Please select a warehouse first');
      return;
    }

    // Start scanning silently if not already scanning
    if (!this.isScanning) {
      this.isScanning = true;
      
      // Clean up any existing subscription
      if (this.scanSubscription) {
        this.scanSubscription.unsubscribe();
        this.scanSubscription = null;
      }

      // Subscribe to scan results without showing "Scanner Ready" toast
      this.scanSubscription = this.barcodeScannerService.startScanning().subscribe({
        next: (result: ScanResult | null) => {
          if (result) {
            this.handleScanResult(result);
          }
        },
        error: (error) => {
          console.error('Scan error:', error);
          this.isScanning = false;
          this.toastService.error('Scan Error', 'Failed to scan barcode');
        }
      });

      setTimeout(() => {
        this.barcodeScannerService.simulateError('Test scan error');
      }, 100);
    } else {
      this.barcodeScannerService.simulateError('Test scan error');
    }
  }

  getTestBarcodes(): string[] {
    return this.barcodeScannerService.getTestBarcodes();
  }

  useTestBarcode(barcode: string): void {
    this.testBarcode = barcode;
  }

  private addTestProducts(): void {
    // Add some test products with matching barcodes for testing
    const testProducts: ProductApiModel[] = [
      {
        id: 9999,
        name: 'Test Product 1 (Single Variant)',
        barcodeSKU: '123232432',
        barcodeSKU2: '',
        barcodeSKU3: '',
        barcodeSKU4: '',
        description: 'Test product with single variant for barcode scanning'
      } as ProductApiModel,
      {
        id: 9998,
        name: 'Test Product 2 (Single Variant)',
        barcodeSKU: '96321457',
        barcodeSKU2: '',
        barcodeSKU3: '',
        barcodeSKU4: '',
        description: 'Another test product with single variant'
      } as ProductApiModel,
      {
        id: 9997,
        name: 'Sample Item (Multiple Variants)',
        barcodeSKU: 'SKU14',
        barcodeSKU2: 'TEST002',
        barcodeSKU3: 'SAMPLE123',
        barcodeSKU4: 'DEMO456',
        description: 'Sample item with multiple SKUs and variants'
      } as ProductApiModel
    ];

    // Add test products to the products array if they don't already exist
    testProducts.forEach(testProduct => {
      const exists = this.products.find(p => p.id === testProduct.id);
      if (!exists) {
        this.products.push(testProduct);
      }
    });

    console.log('Test products added for barcode scanning simulation');
    console.log('- Products 1 & 2: Single variant (quantity increases on each scan)');
    console.log('- Product 3: Multiple variants (specific variant selection)');
  }
}

