import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { WarehouseInventoryService } from '../../../services/warehouse-inventory.service';
import { WarehouseService } from '../../../services/warehouse.service';
import { ProductService } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';
import { AddInventoryRequest, AddBulkInventoryRequest, BulkInventoryItem, WarehouseInventoryResponse } from '../../../models/warehouse-inventory.model';
import { WarehouseResponse } from '../../../models/warehouse.model';
import { ProductApiModel, ProductVariation } from '../../../models/product.model';

export interface Variation {
  id?: number;
  name: string;
  value: string;
  quantity?: number;
  currentQuantity?: number; // Existing quantity in warehouse
  inventoryId?: number; // Warehouse inventory ID for updates
}

export interface VariationCombination {
  id: number;
  displayName: string; // e.g., "Cotton / Small"
  values: { name: string; value: string; variationId?: number }[];
  quantity: number;
  currentQuantity?: number;
}

export interface InventoryCartItem {
  variationId?: number;
  variationName?: string;
  variationValue?: string;
  quantity: number;
  isUniversal?: boolean;
  inventoryId?: number; // For tracking existing inventory items
}

@Component({
  selector: 'app-add-inventory',
  templateUrl: './add-inventory.component.html',
  styleUrl: './add-inventory.component.css'
})
export class AddInventoryComponent implements OnInit {
  inventoryForm: FormGroup;
  
  // Product variations from selected product
  allVariations: Variation[] = [];
  filteredVariations: Variation[] = [];
  searchTerm: string = '';
  
  // Variation combinations (like Amazon style)
  variationCombinations: VariationCombination[] = [];
  filteredCombinations: VariationCombination[] = [];
  groupedVariations: Map<string, string[]> = new Map();
  
  // Available product variations for the selected product
  productVariations: ProductVariation[] = [];
  
  // Inventory cart for managing multiple variations with quantities
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
  isEditMode = false;
  warehouseId: number | null = null;
  warehouseInventoryItems: WarehouseInventoryResponse[] = [];
  warehouseProducts: ProductApiModel[] = []; // Products that exist in this warehouse

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute,
    private warehouseInventoryService: WarehouseInventoryService,
    private warehouseService: WarehouseService,
    private productService: ProductService,
    private toastService: ToastService
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
        this.isEditMode = true;
        this.warehouseId = +params['id'];
      }
    });
    
    // Load data
    this.loadWarehouses();
    this.loadProducts();
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (warehouses) => {
        this.warehouses = warehouses;
        
        // If in edit mode, load the warehouse after warehouses list is loaded
        if (this.isEditMode && this.warehouseId) {
          this.loadWarehouseForEdit(this.warehouseId);
        }
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
        if (this.isEditMode && this.selectedWarehouse) {
          this.loadExistingInventory(this.selectedWarehouse.id);
        }
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
    
    // Load variations from the selected product
    this.productVariations = product.variations || [];
    
    // Convert ProductVariation to Variation interface and map existing quantities
    this.allVariations = this.productVariations.map(pv => {
      // Find existing inventory for this variation
      const existingInventory = inventoryItems.find(item => item.productVariationId === pv.id);
      
      return {
        id: pv.id,
        name: pv.variationType,
        value: pv.variationValue,
        quantity: 0, // New quantity to add
        currentQuantity: existingInventory ? existingInventory.quantity : 0,
        inventoryId: existingInventory ? existingInventory.id : undefined
      };
    });
    
    this.filteredVariations = [...this.allVariations];
    
    // Generate combinations with current quantities
    this.generateVariationCombinations();
    
    // Map current quantities to combinations
    this.variationCombinations.forEach(combo => {
      // Find matching inventory items for this combination
      let totalCurrentQty = 0;
      combo.values.forEach(val => {
        const variation = this.allVariations.find(v => v.name === val.name && v.value === val.value);
        if (variation && variation.currentQuantity) {
          totalCurrentQty = Math.max(totalCurrentQty, variation.currentQuantity);
        }
      });
      combo.currentQuantity = totalCurrentQty;
    });
    
    // Don't clear cart in edit mode - we want to preserve the state
    if (!this.isEditMode) {
      this.clearInventoryData();
    }
  }

  loadProductVariations(product: ProductApiModel): void {
    // Load variations from the selected product
    this.productVariations = product.variations || [];
    
    // Convert ProductVariation to Variation interface for the UI
    this.allVariations = this.productVariations.map(pv => ({
      id: pv.id,
      name: pv.variationType,
      value: pv.variationValue,
      quantity: 0,
      currentQuantity: 0
    }));
    
    this.filteredVariations = [...this.allVariations];
    
    // Generate combinations
    this.generateVariationCombinations();
    
    // Clear cart and universal product when product changes (only in add mode)
    if (!this.isEditMode) {
      this.clearInventoryData();
    }
  }

  generateVariationCombinations(): void {
    // Group variations by type
    this.groupedVariations.clear();
    
    this.allVariations.forEach(v => {
      if (!this.groupedVariations.has(v.name)) {
        this.groupedVariations.set(v.name, []);
      }
      this.groupedVariations.get(v.name)!.push(v.value);
    });
    
    // Generate cartesian product of all variation values
    const variationTypes = Array.from(this.groupedVariations.keys());
    const variationValues = variationTypes.map(type => this.groupedVariations.get(type)!);
    
    if (variationTypes.length === 0) {
      this.variationCombinations = [];
      return;
    }
    
    const combinations = this.cartesianProduct(variationTypes, variationValues);
    
    this.variationCombinations = combinations.map((combo, index) => {
      const displayName = combo.map(c => c.value).join(' / ');
      const values = combo.map(c => {
        const variation = this.allVariations.find(v => v.name === c.type && v.value === c.value);
        return {
          name: c.type,
          value: c.value,
          variationId: variation?.id
        };
      });
      
      return {
        id: index + 1,
        displayName,
        values,
        quantity: 0,
        currentQuantity: 0
      };
    });
    
    // Initialize filtered combinations with all combinations
    this.filteredCombinations = [...this.variationCombinations];
  }

  private cartesianProduct(types: string[], values: string[][]): { type: string; value: string }[][] {
    if (types.length === 0) return [[]];
    if (types.length === 1) {
      return values[0].map(v => [{ type: types[0], value: v }]);
    }

    const result: { type: string; value: string }[][] = [];
    const [firstType, ...restTypes] = types;
    const [firstValues, ...restValues] = values;
    const restProduct = this.cartesianProduct(restTypes, restValues);

    firstValues.forEach(val => {
      restProduct.forEach(prod => {
        result.push([{ type: firstType, value: val }, ...prod]);
      });
    });

    return result;
  }

  clearProductVariations(): void {
    this.productVariations = [];
    this.allVariations = [];
    this.filteredVariations = [];
    this.clearInventoryData();
  }

  clearInventoryData(): void {
    this.inventoryCart = [];
    this.universalProductQuantity = 0;
    this.universalProductInCart = false;
  }

  applyFilter(event: any): void {
    const filterValue = event.target.value.toLowerCase();
    
    // Filter individual variations (for old table view if used)
    this.filteredVariations = this.allVariations.filter(variation =>
      variation.name.toLowerCase().includes(filterValue) ||
      variation.value.toLowerCase().includes(filterValue)
    );
    
    // Filter combinations (for new combination view)
    this.filteredCombinations = this.variationCombinations.filter(combo =>
      combo.displayName.toLowerCase().includes(filterValue)
    );
  }

  updateVariationQuantity(variation: Variation): void {
    // Update quantity in the variation object
    // This is handled by ngModel binding
  }

  addVariationToCart(variation: Variation): void {
    if (variation.quantity && variation.quantity > 0) {
      // Check if this variation already exists in cart
      const existingItemIndex = this.inventoryCart.findIndex(item => 
        item.variationId === variation.id
      );
      
      if (existingItemIndex > -1) {
        // Variation exists, add to existing quantity
        this.inventoryCart[existingItemIndex].quantity += variation.quantity;
        this.toastService.success('Success', 'Quantity updated in cart');
      } else {
        // New variation, add to cart
        const cartItem: InventoryCartItem = {
          variationId: variation.id,
          variationName: variation.name,
          variationValue: variation.value,
          quantity: variation.quantity,
          isUniversal: false,
          inventoryId: variation.inventoryId // Include inventory ID for updates
        };
        
        this.inventoryCart.push(cartItem);
        this.toastService.success('Success', 'Added to cart');
      }
      
      // Reset the variation quantity after adding to cart
      variation.quantity = 0;
    }
  }

  addSingleCombinationToCart(combo: VariationCombination): void {
    if (!combo.quantity || combo.quantity <= 0) {
      return;
    }

    // Check if this variant already exists in cart
    const existingItemIndex = this.inventoryCart.findIndex(item => 
      item.variationName === combo.displayName && !item.variationValue
    );
    
    if (existingItemIndex > -1) {
      // Variant exists, add to existing quantity
      this.inventoryCart[existingItemIndex].quantity += combo.quantity;
      this.toastService.success('Success', 'Quantity updated in cart');
    } else {
      // New variant, add to cart
      const cartItem: InventoryCartItem = {
        variationName: combo.displayName,
        variationValue: '', // Not used for combinations
        quantity: combo.quantity,
        isUniversal: false
      };
      
      // Store the first variation ID (or handle multiple IDs if API supports it)
      if (combo.values.length > 0 && combo.values[0].variationId) {
        cartItem.variationId = combo.values[0].variationId;
      }
      
      this.inventoryCart.push(cartItem);
      this.toastService.success('Success', 'Added to cart');
    }
    
    // Reset quantity after adding
    combo.quantity = 0;
  }

  addSelectedCombinationsToCart(): void {
    const combosWithQuantity = this.variationCombinations.filter(c => c.quantity > 0);
    let addedCount = 0;
    let updatedCount = 0;
    
    combosWithQuantity.forEach(combo => {
      // Check if this variant already exists in cart
      const existingItemIndex = this.inventoryCart.findIndex(item => 
        item.variationName === combo.displayName && !item.variationValue
      );
      
      if (existingItemIndex > -1) {
        // Variant exists, add to existing quantity
        this.inventoryCart[existingItemIndex].quantity += combo.quantity;
        updatedCount++;
      } else {
        // New variant, add to cart
        const cartItem: InventoryCartItem = {
          variationName: combo.displayName,
          variationValue: '', // Not used for combinations
          quantity: combo.quantity,
          isUniversal: false
        };
        
        // Store the first variation ID (or handle multiple IDs if API supports it)
        if (combo.values.length > 0 && combo.values[0].variationId) {
          cartItem.variationId = combo.values[0].variationId;
        }
        
        this.inventoryCart.push(cartItem);
        addedCount++;
      }
      
      // Reset quantity after adding
      combo.quantity = 0;
    });
    
    // Show appropriate success message
    if (addedCount > 0 && updatedCount > 0) {
      this.toastService.success('Success', `${addedCount} variant(s) added, ${updatedCount} variant(s) updated in cart`);
    } else if (addedCount > 0) {
      this.toastService.success('Success', `${addedCount} variant(s) added to cart`);
    } else if (updatedCount > 0) {
      this.toastService.success('Success', `${updatedCount} variant(s) updated in cart`);
    }
  }

  hasCombinationsWithQuantity(): boolean {
    return this.variationCombinations.some(c => c.quantity > 0);
  }

  getTotalCartQuantity(): number {
    return this.inventoryCart.reduce((total, item) => total + (item.quantity || 0), 0);
  }

  addUniversalProductToCart(): void {
    if (this.universalProductQuantity > 0) {
      // Check if universal product already exists in cart
      const existingItemIndex = this.inventoryCart.findIndex(item => item.isUniversal);
      
      if (existingItemIndex > -1) {
        // Universal product exists, add to existing quantity
        this.inventoryCart[existingItemIndex].quantity += this.universalProductQuantity;
        this.toastService.success('Success', 'Quantity updated in cart');
      } else {
        // New universal product, add to cart
        const cartItem: InventoryCartItem = {
          quantity: this.universalProductQuantity,
          isUniversal: true
        };
        
        this.inventoryCart.push(cartItem);
        this.universalProductInCart = true;
        this.toastService.success('Success', 'Added to cart');
      }
      
      this.universalProductQuantity = 0;
    }
  }

  isVariationInCart(variation: Variation): boolean {
    return this.inventoryCart.some(item => 
      item.variationId === variation.id
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
    const productsToFilter = this.isEditMode ? this.warehouseProducts : this.products;
    
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
    
    // In edit mode, load with existing inventory data
    if (this.isEditMode && this.warehouseInventoryItems.length > 0) {
      this.selectProductForEdit(product, this.warehouseInventoryItems);
    } else {
      // Load variations for the selected product (add mode)
      this.loadProductVariations(product);
    }
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
    this.inventoryForm.patchValue({ warehouseName: '' });
    this.showWarehouseDropdown = false;
  }
  
  clearProduct() {
    // Don't allow clearing product in edit mode
    if (this.isEditMode) {
      return;
    }
    
    this.selectedProduct = null;
    this.productSearchTerm = '';
    this.inventoryForm.patchValue({ prodcut: '' });
    this.showProductDropdown = false;
    
    // Clear variations and inventory data when product is cleared
    this.clearProductVariations();
  }

  onSubmit(): void {
    if (this.selectedWarehouse && this.selectedProduct && this.inventoryCart.length > 0) {
      this.loading = true;
      
      // Prepare bulk inventory request
      const bulkInventoryItems: BulkInventoryItem[] = this.inventoryCart.map(item => ({
        productVariationId: item.variationId || 0, // Use 0 for universal products or handle differently based on API requirements
        quantity: item.quantity,
        notes: item.isUniversal 
          ? 'Universal product - no variations' 
          : `Variation: ${item.variationName} - ${item.variationValue}`
      }));

      const addBulkInventoryRequest: AddBulkInventoryRequest = {
        warehouseId: this.selectedWarehouse.id,
        productId: this.selectedProduct.id,
        inventoryItems: bulkInventoryItems
      };

      const actionText = this.isEditMode ? 'Updating' : 'Adding';
      const successText = this.isEditMode ? 'updated' : 'added';
      
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
    this.clearProductVariations();
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
}

