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
  allProductVariations = [
    // Pneumatic Walking Boot variations
    {
      id: 1,
      productId: 'pneumatic-walking-boot',
      productName: 'Pneumatic Walking Boot',
      size: 'L',
      side: 'Universal',
      colour: 'Black',
      inStock: 50,
      quantity: 12,
      status: 'delivered'
    },
    {
      id: 2,
      productId: 'pneumatic-walking-boot',
      productName: 'Pneumatic Walking Boot',
      size: 'M',
      side: 'Universal',
      colour: 'White',
      inStock: 30,
      quantity: 0,
      status: 'in-transit'
    },
    {
      id: 3,
      productId: 'pneumatic-walking-boot',
      productName: 'Pneumatic Walking Boot',
      size: 'S',
      side: 'Universal',
      colour: 'Grey',
      inStock: 10,
      quantity: 0,
      status: 'follow-up'
    },
    // Other Product variations
    {
      id: 4,
      productId: 'other-product',
      productName: 'Other Product',
      size: 'XL',
      side: 'Left',
      colour: 'Blue',
      inStock: 25,
      quantity: 0,
      status: 'follow-up-completed'
    },
    {
      id: 5,
      productId: 'other-product',
      productName: 'Other Product',
      size: 'L',
      side: 'Right',
      colour: 'Red',
      inStock: 15,
      quantity: 0,
      status: 'follow-up-completed'
    },
    // Product 3 variations
    {
      id: 6,
      productId: 'product-3',
      productName: 'Product 3',
      size: 'M',
      side: 'Universal',
      colour: 'Green',
      inStock: 40,
      quantity: 0,
      status: 'driver-assigned'
    },
    {
      id: 7,
      productId: 'product-3',
      productName: 'Product 3',
      size: 'S',
      side: 'Universal',
      colour: 'Yellow',
      inStock: 20,
      quantity: 0,
      status: 'delivered'
    },
    // Product 4 variations
    {
      id: 8,
      productId: 'product-4',
      productName: 'Product 4',
      size: 'L',
      side: 'Universal',
      colour: 'Purple',
      inStock: 35,
      quantity: 0,
      status: 'delivered'
    }
  ];

  // Filtered variations based on selected products
  productVariations: any[] = [];

  // Selected products data
  selectedProducts: any[] = [];

  // Product multiselect dropdown properties
  isProductDropdownOpen = false;
  selectedProductsList: string[] = [];
  products = [
    { id: 'pneumatic-walking-boot', name: 'Pneumatic Walking Boot' },
    { id: 'other-product', name: 'Other Product' },
    { id: 'product-3', name: 'Product 3' },
    { id: 'product-4', name: 'Product 4' }
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    this.suppliesForm = this.fb.group({
      suppliesProduct: ['', Validators.required],
      suppliesName: [[]], // Changed to array for multiselect
      email: [''],
      emailTemplate: [''],
    });
    
    // Initialize with all variations (no filter applied initially)
    this.productVariations = [...this.allProductVariations];
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
          quantity: variation.quantity,
          status: variation.status
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

  // Variation multiselect dropdown methods
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  toggleSupplier(supplierId: string) {
    const index = this.selectedSupplies.indexOf(supplierId);
    if (index > -1) {
      this.selectedSupplies.splice(index, 1);
    } else {
      this.selectedSupplies.push(supplierId);
    }
    
    // Update form control
    this.suppliesForm.patchValue({
      suppliesName: this.selectedSupplies
    });
  }

  isSupplierSelected(supplierId: string): boolean {
    return this.selectedSupplies.includes(supplierId);
  }

  getSelectedSuppliersText(): string {
    if (this.selectedSupplies.length === 0) {
      return 'Request Supplier';
    }
    if (this.selectedSupplies.length === 1) {
      const supplier = this.supplies.find(s => s.id === this.selectedSupplies[0]);
      return supplier ? supplier.name : 'Request Supplier';
    }
    return `${this.selectedSupplies.length} suppliers selected`;
  }

  // Product multiselect dropdown methods
  toggleProductDropdown() {
    this.isProductDropdownOpen = !this.isProductDropdownOpen;
  }

  closeProductDropdown() {
    this.isProductDropdownOpen = false;
  }

  toggleProduct(productId: string) {
    const index = this.selectedProductsList.indexOf(productId);
    if (index > -1) {
      this.selectedProductsList.splice(index, 1);
    } else {
      this.selectedProductsList.push(productId);
    }
    
    // Update form control
    this.suppliesForm.patchValue({
      suppliesProduct: this.selectedProductsList
    });
    
    // Filter variations based on selected products
    this.filterVariationsBySelectedProducts();
  }

  filterVariationsBySelectedProducts() {
    if (this.selectedProductsList.length === 0) {
      // If no products selected, show all variations
      this.productVariations = [...this.allProductVariations];
    } else {
      // Filter variations to only show those for selected products
      this.productVariations = this.allProductVariations.filter(variation => 
        this.selectedProductsList.includes(variation.productId)
      );
    }
  }

  isProductSelected(productId: string): boolean {
    return this.selectedProductsList.includes(productId);
  }

  getSelectedProductsText(): string {
    if (this.selectedProductsList.length === 0) {
      return 'Select Product';
    }
    if (this.selectedProductsList.length === 1) {
      const product = this.products.find(p => p.id === this.selectedProductsList[0]);
      return product ? product.name : 'Select Product';
    }
    return `${this.selectedProductsList.length} products selected`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const productDropdown = target.closest('.product-multiselect-dropdown');
    const variationDropdown = target.closest('.multiselect-dropdown');
    
    if (!productDropdown && this.isProductDropdownOpen) {
      this.closeProductDropdown();
    }
    
    if (!variationDropdown && this.isDropdownOpen) {
      this.closeDropdown();
    }
  }

  // Status methods
  getStatusDisplayText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'delivered': 'Delivered',
      'in-transit': 'In transit',
      'follow-up': 'Follow up',
      'follow-up-completed': 'Follow up completed',
      'driver-assigned': 'Driver Assigned'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'delivered': 'status-delivered',
      'in-transit': 'status-in-transit',
      'follow-up': 'status-follow-up',
      'follow-up-completed': 'status-follow-up-completed',
      'driver-assigned': 'status-driver-assigned'
    };
    return classMap[status] || 'status-default';
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'delivered': 'visibility',
      'in-transit': 'visibility',
      'follow-up': '',
      'follow-up-completed': 'chat_bubble',
      'driver-assigned': 'visibility'
    };
    return iconMap[status] || '';
  }

  updateStatus(variationId: number, newStatus: string) {
    const variation = this.productVariations.find(v => v.id === variationId);
    if (variation) {
      variation.status = newStatus;
    }
    
    // Also update in selected products if it exists there
    const selectedProduct = this.selectedProducts.find(sp => sp.id === variationId);
    if (selectedProduct) {
      selectedProduct.status = newStatus;
    }
  }
}
