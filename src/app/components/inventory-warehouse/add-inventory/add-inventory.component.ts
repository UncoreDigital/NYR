import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { WarehouseInventoryService } from '../../../services/warehouse-inventory.service';
import { WarehouseService } from '../../../services/warehouse.service';
import { ProductService } from '../../../services/product.service';
import { AddInventoryRequest } from '../../../models/warehouse-inventory.model';
import { WarehouseResponse } from '../../../models/warehouse.model';
import { ProductApiModel } from '../../../models/product.model';

export interface Variation {
  id?: number;
  name: string;
  value: string;
}

@Component({
  selector: 'app-add-inventory',
  templateUrl: './add-inventory.component.html',
  styleUrl: './add-inventory.component.css'
})
export class AddInventoryComponent implements OnInit {
  inventoryForm: FormGroup;
  
  // All available variations (mock data) - now with empty values for user input
  allVariations: Variation[] = [];
  filteredVariations: Variation[] = [];
  selectedVariations: Variation[] = [];
  searchTerm: string = '';
  
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
      prodcut: ['', Validators.required],
      quantity: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadWarehouses();
    this.loadProducts();
    this.loadProductVariations();
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

  loadProductVariations(): void {
    // Mock variations for now - in real implementation, this would come from ProductVariation API
    this.allVariations = [
      { name: 'Size', value: '' },
      { name: 'Color', value: '' },
      { name: 'Material', value: '' },
      { name: 'Weight', value: '' },
      { name: 'Style', value: '' },
      { name: 'Brand', value: '' },
      { name: 'Model', value: '' },
      { name: 'Category', value: '' }
    ];
    this.filteredVariations = [...this.allVariations];
  }

  applyFilter(event: any): void {
    const filterValue = event.target.value.toLowerCase();
    this.filteredVariations = this.allVariations.filter(variation =>
      variation.name.toLowerCase().includes(filterValue) ||
      variation.value.toLowerCase().includes(filterValue)
    );
  }

  updateVariationValue(index: number, newValue: string): void {
    // Update the value in the original array
    const originalIndex = this.allVariations.findIndex(v => v.name === this.filteredVariations[index].name);
    if (originalIndex !== -1) {
      this.allVariations[originalIndex].value = newValue;
    }
  }

  addVariationToSelected(variation: Variation): void {
    if (!this.isVariationSelected(variation) && variation.value?.trim()) {
      this.selectedVariations.push({ 
        name: variation.name, 
        value: variation.value.trim() 
      });
    }
  }

  removeSelectedVariation(index: number): void {
    this.selectedVariations.splice(index, 1);
  }

  isVariationSelected(variation: Variation): boolean {
    return this.selectedVariations.some(selected => 
      selected.name === variation.name && selected.value === variation.value
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
  }

  onSubmit(): void {
    if (this.inventoryForm.valid && this.selectedVariations.length > 0 && this.selectedWarehouse && this.selectedProduct) {
      this.loading = true;
      
      // For now, we'll use the first selected variation as the product variation
      // In a real implementation, you'd need to create or find the product variation
      const firstVariation = this.selectedVariations[0];
      
      const addInventoryRequest: AddInventoryRequest = {
        warehouseId: this.selectedWarehouse.id,
        productId: this.selectedProduct.id,
        productVariationId: 1, // This should be the actual variation ID from the API
        quantity: parseInt(this.inventoryForm.value.quantity),
        notes: `Variations: ${this.selectedVariations.map(v => `${v.name}: ${v.value}`).join(', ')}`
      };

      this.warehouseInventoryService.addInventory(addInventoryRequest).subscribe({
        next: (response) => {
          console.log('Inventory added successfully:', response);
          this.loading = false;
          this.router.navigate(['/warehouse']);
        },
        error: (error) => {
          console.error('Error adding inventory:', error);
          this.loading = false;
        }
      });
    } else {
      console.log('Form is invalid or no variations selected');
    }
  }

  onCancel() {
    this.inventoryForm.reset();
  }

  addAnotherInventory() {
    this.inventoryForm.reset();
  }

  goToWarehousesList() {
    this.router.navigate(['/warehouse']);
  }
}

