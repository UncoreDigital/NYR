import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { WarehouseInventoryService } from '../../../services/warehouse-inventory.service';
import { WarehouseService } from '../../../services/warehouse.service';
import { ProductService } from '../../../services/product.service';
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
    private productService: ProductService
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
    
    // Clear cart and universal product when product changes (only in add mode)
    if (!this.isEditMode) {
      this.clearInventoryData();
    }
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
    this.filteredVariations = this.allVariations.filter(variation =>
      variation.name.toLowerCase().includes(filterValue) ||
      variation.value.toLowerCase().includes(filterValue)
    );
  }

  updateVariationQuantity(variation: Variation): void {
    // Update quantity in the variation object
    // This is handled by ngModel binding
  }

  addVariationToCart(variation: Variation): void {
    if (variation.quantity && variation.quantity > 0 && !this.isVariationInCart(variation)) {
      const cartItem: InventoryCartItem = {
        variationId: variation.id,
        variationName: variation.name,
        variationValue: variation.value,
        quantity: variation.quantity,
        isUniversal: false,
        inventoryId: variation.inventoryId // Include inventory ID for updates
      };
      
      this.inventoryCart.push(cartItem);
      
      // Reset the variation quantity after adding to cart
      variation.quantity = 0;
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

      // Execute bulk inventory addition
      this.warehouseInventoryService.addBulkInventory(addBulkInventoryRequest).subscribe({
        next: (responses) => {
          console.log('All inventory items added successfully:', responses);
          this.loading = false;
          this.router.navigate(['/inwarehouse']);
        },
        error: (error) => {
          console.error('Error adding inventory items:', error);
          this.loading = false;
        }
      });
    } else {
      console.log('Missing required selections or no items in cart');
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

