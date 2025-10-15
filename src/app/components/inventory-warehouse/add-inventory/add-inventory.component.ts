import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';

export interface Variation {
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
  allVariations: Variation[] = [
    { name: 'Size', value: '' },
    { name: 'Color', value: '' },
    { name: 'Material', value: '' },
    { name: 'Weight', value: '' },
    { name: 'Style', value: '' },
    { name: 'Brand', value: '' },
    { name: 'Model', value: '' },
    { name: 'Category', value: '' }
  ];

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
  selectedWarehouse: any = null;
  selectedProduct: any = null;
  
  // Data arrays for dropdowns
  warehouses = [
    { value: 'warehouse1', name: 'WareHouse 1' },
    { value: 'avetis', name: 'Avetis' },
    { value: 'uncore', name: 'Uncore' },
    { value: 'warehouse2', name: 'WareHouse 2' },
    { value: 'warehouse3', name: 'WareHouse 3' }
  ];
  
  products = [
    { value: 'product1', name: 'Product 1' },
    { value: 'product2', name: 'Product 2' },
    { value: 'product3', name: 'Product 3' },
    { value: 'product4', name: 'Product 4' },
    { value: 'product5', name: 'Product 5' }
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    this.inventoryForm = this.fb.group({
      warehouseName: ['', Validators.required],
      prodcut: ['', Validators.required],
      quantity: ['', Validators.required]
    });
  }

  ngOnInit(): void {
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
  
  selectWarehouse(warehouse: any) {
    this.selectedWarehouse = warehouse;
    this.warehouseSearchTerm = warehouse.name;
    this.inventoryForm.patchValue({ warehouseName: warehouse.value });
    this.showWarehouseDropdown = false;
  }
  
  selectProduct(product: any) {
    this.selectedProduct = product;
    this.productSearchTerm = product.name;
    this.inventoryForm.patchValue({ prodcut: product.value });
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
    if (this.inventoryForm.valid && this.selectedVariations.length > 0) {
      const formData = {
        ...this.inventoryForm.value,
        variations: this.selectedVariations
      };
      console.log('Form submitted:', formData);
      // Add your submission logic here
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

