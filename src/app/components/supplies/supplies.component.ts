import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-supplies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, SidebarComponent, HeaderComponent, FormsModule,
    MatFormFieldModule, MatSelectModule],
  templateUrl: './supplies.component.html',
  styleUrl: './supplies.component.css'
})
export class SuppliesComponent {
  suppliesForm: FormGroup;
  showSuccess = false;
  startTime: string = '';
  endTime: string = '';
  
  // Multiselect dropdown properties
  isDropdownOpen = false;
  selectedSupplies: string[] = [];
  supplies = [
    { id: 'supplier1', name: 'Supplier 1' },
    { id: 'supplier2', name: 'Supplier 2' },
    { id: 'supplier3', name: 'Supplier 3' }
  ];
  fruits: string[] = ['Apple', 'Banana', 'Mango', 'Orange', 'Grapes'];
  fruitsControl = new FormControl([]);

  // Product variations data
  productVariations = [
    {
      id: 1,
      productName: 'Pneumatic Walking Boot',
      size: 'L',
      side: 'Universal',
      colour: 'Black',
      inStock: 50,
      quantity: 12
    },
    {
      id: 2,
      productName: 'Pneumatic Walking Boot',
      size: 'M',
      side: 'Universal',
      colour: 'White',
      inStock: 30,
      quantity: 0
    },
    {
      id: 3,
      productName: 'Pneumatic Walking Boot',
      size: 'S',
      side: 'Universal',
      colour: 'Grey',
      inStock: 10,
      quantity: 0
    }
  ];

  // Selected products data
  selectedProducts: any[] = [];

  constructor(private fb: FormBuilder, private router: Router) {
    this.suppliesForm = this.fb.group({
      suppliesProduct: ['', Validators.required],
      suppliesName: [[]], // Changed to array for multiselect
      email: [''],
      emailTemplate: [''],
    });
  }

  onSubmit() {
    this.showSuccess = true;
    if (this.suppliesForm.valid) {
      // Handle form submission (e.g., send to API)
      console.log('Customer Data:', this.suppliesForm.value);
      this.showSuccess = true;
    } else {
      this.suppliesForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.suppliesForm.reset();
  }

  addAnotherSupplies() {
    this.showSuccess = false;
    this.suppliesForm.reset();
  }

  // Variation table methods
  updateQuantity(variationId: number, quantity: number) {
    const variation = this.productVariations.find(v => v.id === variationId);
    if (variation) {
      variation.quantity = quantity;
    }
  }

  addVariation(variationId: number) {
    const variation = this.productVariations.find(v => v.id === variationId);
    if (variation && variation.quantity > 0) {
      // Check if this variation is already in selected products
      const existingIndex = this.selectedProducts.findIndex(sp => sp.id === variation.id);
      
      if (existingIndex > -1) {
        // Update existing selected product quantity
        this.selectedProducts[existingIndex].quantity = variation.quantity;
      } else {
        // Add new selected product
        this.selectedProducts.push({
          id: variation.id,
          productName: variation.productName,
          size: variation.size,
          side: variation.side,
          colour: variation.colour,
          quantity: variation.quantity
        });
      }
      
      // Reset the quantity in the variation table
      variation.quantity = 0;
    }
  }

  getQuantity(variationId: number): number {
    const variation = this.productVariations.find(v => v.id === variationId);
    return variation ? variation.quantity : 0;
  }

  // Selected products methods
  removeSelectedProduct(selectedProductId: number) {
    this.selectedProducts = this.selectedProducts.filter(sp => sp.id !== selectedProductId);
  }

  getSelectedProductsCount(): number {
    return this.selectedProducts.length;
  }
}
