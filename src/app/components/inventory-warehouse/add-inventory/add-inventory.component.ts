import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WarehouseInventoryService } from '../../../services/warehouse-inventory.service';
import { WarehouseService } from '../../../services/warehouse.service';
import { ProductService } from '../../../services/product.service';
import { AddInventoryRequest, AddBulkInventoryRequest, BulkInventoryItem } from '../../../models/warehouse-inventory.model';
import { WarehouseResponse } from '../../../models/warehouse.model';
import { ProductApiModel, ProductVariation } from '../../../models/product.model';

export interface Variation {
  id?: number;
  name: string;
  value: string;
  quantity?: number;
}

export interface InventoryCartItem {
  variationId?: number;
  variationName?: string;
  variationValue?: string;
  quantity: number;
  isUniversal?: boolean;
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

  constructor(
    private fb: FormBuilder, 
    private router: Router,
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
    this.loadWarehouses();
    this.loadProducts();
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
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  loadProductVariations(product: ProductApiModel): void {
    // Load variations from the selected product
    this.productVariations = product.variations || [];
    
    // Convert ProductVariation to Variation interface for the UI
    this.allVariations = this.productVariations.map(pv => ({
      id: pv.id,
      name: pv.variationType,
      value: pv.variationValue,
      quantity: 0
    }));
    
    this.filteredVariations = [...this.allVariations];
    
    // Clear cart and universal product when product changes
    this.clearInventoryData();
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
        isUniversal: false
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
    if (!this.productSearchTerm) {
      return this.products;
    }
    return this.products.filter(product => 
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
    
    // Load variations for the selected product
    this.loadProductVariations(product);
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
          this.router.navigate(['/warehouse']);
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

  onCancel() {
    this.inventoryForm.reset();
    this.selectedWarehouse = null;
    this.selectedProduct = null;
    this.warehouseSearchTerm = '';
    this.productSearchTerm = '';
    this.clearProductVariations();
  }

  addAnotherInventory() {
    this.inventoryForm.reset();
  }

  goToWarehousesList() {
    this.router.navigate(['/warehouse']);
  }
}

