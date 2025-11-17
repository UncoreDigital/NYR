import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ProductService } from '../../services/product.service';
import { SupplierService } from '../../services/supplier.service';
import { SuppliesService, SuppliesRequest } from '../../services/supplies.service';
import { ProductApiModel, ProductVariationDetail } from '../../models/product.model';
import { SupplierApiModel } from '../../models/supplier.model';

// Interface for Product-Variation Type table
interface ProductVariationTypeData {
  productId: number;
  productName: string;
  variations: {
    productName: string;
    variationType: string;
    variationValue: string;
    id: number;
    quantity: number;
  }[];
}

@Component({
  selector: 'app-supplies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, SidebarComponent, HeaderComponent, FormsModule,
    MatFormFieldModule, MatSelectModule],
  templateUrl: './supplies.component.html',
  styleUrl: './supplies.component.css'
})
export class SuppliesComponent implements OnInit {
  suppliesForm: FormGroup;
  showSuccess = false;
  startTime: string = '';
  endTime: string = '';
  
  // API data
  apiProducts: ProductApiModel[] = [];
  apiSuppliers: SupplierApiModel[] = [];
  loading = false;
  loadingVariations = false;
  saving = false;
  saveError = '';

  // Product-Variation Type table data
  productVariationTypeData: ProductVariationTypeData[] = [];
  // Backup of full variation type data to allow resetting/filtered views
  allProductVariationTypeData: ProductVariationTypeData[] = [];
  showVariationTypeTable = false;
  
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

  // Searchable supplier dropdown properties
  supplierSearchTerm: string = '';
  showSupplierDropdown: boolean = false;
  selectedSupplier: any = null;
  
  // Supplier data array
  suppliers = [
    { value: 'supplier1', name: 'Supplier 1' },
    { value: 'supplier2', name: 'Supplier 2' },
    { value: 'supplier3', name: 'Supplier 3' },
    { value: 'supplier4', name: 'Supplier 4' },
    { value: 'supplier5', name: 'Supplier 5' }
  ];

  // Product variations data (fallback/mock data)
  allProductVariations: ProductVariationDetail[] = [
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
  productVariations: ProductVariationDetail[] = [];

  // Selected products data
  selectedProducts: any[] = [];

  // Product multiselect dropdown properties
  isProductDropdownOpen = false;
  selectedProductsList: string[] = [];
  productSearchTerm: string = '';
  products = [
    { id: 'pneumatic-walking-boot', name: 'Pneumatic Walking Boot' },
    { id: 'other-product', name: 'Other Product' },
    { id: 'product-3', name: 'Product 3' },
    { id: 'product-4', name: 'Product 4' }
  ];

  // Rich Text Editor properties
  emailTemplateContent: string = '';
  editorFocused: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private productService: ProductService,
    private supplierService: SupplierService,
    private suppliesService: SuppliesService
  ) {
    this.suppliesForm = this.fb.group({
      suppliesProduct: ['', Validators.required],
      suppliesName: [[]], // Changed to array for multiselect
      email: [''],
      emailTemplate: [''],
    });
    
    // Initialize with all variations (no filter applied initially)
    this.productVariations = [...this.allProductVariations];
  }

  ngOnInit() {
    this.loadProducts();
    this.loadSuppliers();
    // this.loadProductVariations();
  }

  // Service methods to load data from API
  loadProducts() {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (products: ProductApiModel[]) => {
        this.apiProducts = products;
        // Update the products array for dropdown
        this.products = products.map(product => ({
          id: product.id.toString(),
          name: product.name
        }));
        
        // Extract variations from products and update allProductVariations
        this.extractVariationsFromProducts(products);
        
        // Show variation type table if we have data
        if (this.productVariationTypeData.length > 0) {
          this.showVariationTypeTable = true;
        }
        
        this.loading = false;
        console.log('Products loaded successfully:', products.length);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
        // Keep the mock data if API fails
        console.log('Using fallback product data');
      }
    });
  }

  extractVariationsFromProducts(products: ProductApiModel[]) {
    const extractedVariations: ProductVariationDetail[] = [];
    const variationTypeData: ProductVariationTypeData[] = [];
    
    products.forEach(product => {
      if (product.variations && product.variations.length > 0) {
        // Create product variation type data for table
        const productVariationTypeEntry: ProductVariationTypeData = {
          productId: product.id,
          productName: product.name,
          variations: product.variations.map(variation => ({
            productName: product.name,
            variationType: variation.variationType,
            variationValue: variation.variationValue,
            id: variation.id,
            quantity: 0 // Initialize quantity to 0
          }))
        };
        variationTypeData.push(productVariationTypeEntry);

        product.variations.forEach(variation => {
          // Create a variation detail object
          const variationDetail: ProductVariationDetail = {
            id: variation.id,
            productId: product.id,
            productName: product.name,
            size: this.extractVariationByType(product.variations, 'Size') || 'N/A',
            side: this.extractVariationByType(product.variations, 'Side') || 'Universal',
            colour: this.extractVariationByType(product.variations, 'Color') || 
                   this.extractVariationByType(product.variations, 'Colour') || 'N/A',
            inStock: Math.floor(Math.random() * 100), // Random stock for demo
            quantity: 0,
            status: 'available',
            variationType: variation.variationType,
            variationValue: variation.variationValue
          };
          extractedVariations.push(variationDetail);
        });
      }
    });
    console.log('Extracted variations from products:', extractedVariations);
    // Update both variation arrays
    this.productVariationTypeData = variationTypeData;
    // keep a full backup to restore later when no filters applied
    this.allProductVariationTypeData = variationTypeData.map(d => ({
      productId: d.productId,
      productName: d.productName,
      variations: d.variations.map(v => ({ ...v }))
    }));
    
    if (extractedVariations.length > 0) {
      this.allProductVariations = extractedVariations;
      this.productVariations = [...this.allProductVariations];
      console.log('Variations extracted from products:', extractedVariations.length);
      console.log('Product-Variation Type table created:', variationTypeData.length);
    }
  }

  extractVariationByType(variations: any[], type: string): string {
    const variation = variations.find(v => 
      v.variationType.toLowerCase() === type.toLowerCase()
    );
    return variation ? variation.variationValue : '';
  }

  loadSuppliers() {
    this.loading = true;
    this.supplierService.getSuppliers().subscribe({
      next: (suppliers: SupplierApiModel[]) => {
        this.apiSuppliers = suppliers;
        // Update the suppliers array for dropdown
        this.suppliers = suppliers.map(supplier => ({
          value: supplier.id.toString(),
          name: supplier.name
        }));
        this.loading = false;
        console.log('Suppliers loaded successfully:', suppliers.length);
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
        this.loading = false;
        // Keep the mock data if API fails
        console.log('Using fallback supplier data');
      }
    });
  }

  loadProductVariations() {
    this.loadingVariations = true;
    this.productService.getAllProductVariations().subscribe({
      next: (variations: any[]) => {
        // Transform API variations to match our interface
        this.allProductVariations = variations.map(variation => ({
          id: variation.id,
          productId: variation.productId,
          productName: variation.productName || 'Unknown Product',
          size: variation.size || 'N/A',
          side: variation.side || 'Universal',
          colour: variation.colour || variation.color || 'N/A',
          inStock: variation.inStock || 0,
          quantity: 0, // Default quantity for selection
          status: variation.status || 'available',
          variationType: variation.variationType,
          variationValue: variation.variationValue
        }));
        
        // Initialize filtered variations
        this.productVariations = [...this.allProductVariations];
        this.loadingVariations = false;
        console.log('Product variations loaded successfully:', variations.length);
      },
      error: (error) => {
        console.error('Error loading product variations:', error);
        this.loadingVariations = false;
        // Keep the mock data if API fails
        console.log('Using fallback variation data');
      }
    });
  }

  onSubmit() {
    if (this.suppliesForm.valid && this.selectedSupplier) {
      this.saving = true;
      this.saveError = '';
      
      // Collect all requested product variations from the variation type table
      const requestedProducts = this.selectedProducts?.length > 0 ? this.selectedProducts.map(variation => ({
        variationId: variation.variationId,
        quantity: variation.quantity,
      })) : [];

      // Check if there are any items to save
      if (this.selectedProducts.length === 0) {
        this.saveError = 'Please add at least one product variation with quantity greater than 0.';
        this.saving = false;
        return;
      }

      // Prepare the supplies request payload
      const suppliesRequest: SuppliesRequest = {
        emailAddress: this.suppliesForm.value.email || '',
        emailTemplate: this.suppliesForm.value.emailTemplate || '',
        productId: Number(this.suppliesForm.value.suppliesProduct[0]),
        supplierId: parseInt(this.selectedSupplier.value),
        // supplierName: this.selectedSupplier.name,
        items: requestedProducts
      };

      console.log('Submitting Supplies Request:', suppliesRequest);

      // Submit to the API
      this.suppliesService.createSuppliesRequest(suppliesRequest).subscribe({
        next: (response) => {
          console.log('Supplies Request Created Successfully:', response);
          this.saving = false;
          this.showSuccess = true;
          
          // Reset form and data
          this.resetForm();
        },
        error: (error) => {
          console.error('Error creating supplies request:', error);
          this.saving = false;
          this.saveError = error.error?.message || 'Failed to save supplies request. Please try again.';
        }
      });
      
    } else {
      this.suppliesForm.markAllAsTouched();
      if (!this.selectedSupplier) {
        this.saveError = 'Please select a supplier before submitting.';
      }
    }
  }

  resetForm() {
    // Reset the form
    this.suppliesForm.reset();
    
    // Clear supplier selection
    this.selectedSupplier = null;
    this.supplierSearchTerm = '';
    
    // Clear product selections
    this.selectedProducts = [];
    this.selectedProductsList = [];
    this.productSearchTerm = '';
    
    // Clear variation type table data
    this.productVariationTypeData = [];
    
    // Reset all quantities to 0
    this.productVariationTypeData.forEach(productData => {
      productData.variations.forEach(variation => {
        variation.quantity = 0;
      });
    });
    
    // Clear error states
    this.saveError = '';
    // Reset dropdowns
    this.isProductDropdownOpen = false;
    this.showSupplierDropdown = false;
    this.showVariationTypeTable = false;

    // Clear email template content and update editor DOM + form control
    this.emailTemplateContent = '';
    try {
      const editorElement = document.querySelector('.editor-content') as HTMLElement | null;
      if (editorElement) {
        editorElement.innerHTML = '';
      }
    } catch (e) {
      console.warn('Failed to clear editor DOM', e);
    }
    this.suppliesForm.patchValue({ emailTemplate: '' });
  }

  onCancel() {
    // Use the full reset routine to clear editor DOM and related state
    this.resetForm();
  }

  addAnotherSupplies() {
    this.showSuccess = false;
    this.resetForm();
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
    
    // Optionally load specific variations for selected products
    if (this.selectedProductsList.length > 0) {
      this.loadVariationsForSelectedProducts();
    }
  }

  filterVariationsBySelectedProducts() {
    if (this.selectedProductsList.length === 0) {
      // If no products selected, show all variations
      this.productVariations = [...this.allProductVariations];
      // restore full variation type table
      this.productVariationTypeData = [...this.allProductVariationTypeData];
    } else {
      // Filter variations to only show those for selected products
      this.productVariations = this.allProductVariations.filter(variation => 
        this.selectedProductsList.includes(variation.productId.toString())
      );
      // Also filter the variation type table to only selected products
      this.productVariationTypeData = this.allProductVariationTypeData.filter(pt => 
        this.selectedProductsList.includes(pt.productId.toString())
      ).map(d => ({ productId: d.productId, productName: d.productName, variations: d.variations.map(v => ({ ...v })) }));
    }
  }

  loadVariationsForSelectedProducts() {
    // Load variations specifically for selected products
    if (this.selectedProductsList.length === 0) return;
    
    this.loadingVariations = true;
    
    // Create an array of observables for each selected product
    const variationRequests = this.selectedProductsList.map(productId => 
      this.productService.getProductVariations(parseInt(productId))
    );
    
    // Execute all requests simultaneously
    // Note: You might want to use forkJoin from rxjs for this
    // For now, we'll just filter the existing data
    this.filterVariationsBySelectedProducts();
    this.loadingVariations = false;
  }

  // Product-Variation Type table methods
  toggleVariationTypeTable() {
    this.showVariationTypeTable = !this.showVariationTypeTable;
  }

  getUniqueVariationTypes(): string[] {
    const variationTypes = new Set<string>();
    this.productVariationTypeData.forEach(product => {
      product.variations.forEach(variation => {
        variationTypes.add(variation.variationType);
      });
    });
    return Array.from(variationTypes).sort();
  }

  getVariationValuesByType(product: ProductVariationTypeData, variationType: string): string {
    const variations = product.variations.filter(v => v.variationType === variationType);
    return variations.map(v => v.variationValue).join(', ');
  }

  getVariationCountByType(product: ProductVariationTypeData, variationType: string): number {
    return product.variations.filter(v => v.variationType === variationType).length;
  }

  getTotalVariationCount(): number {
    return this.productVariationTypeData.reduce((total, product) => total + product.variations.length, 0);
  }

  getTotalRequestedItems(): number {
    return this.productVariationTypeData.reduce((total, product) => {
      return total + product.variations.reduce((productTotal, variation) => {
        return productTotal + (variation.quantity || 0);
      }, 0);
    }, 0);
  }

  // New methods for the updated table structure
  getUniqueProducts(): string[] {
    const products = this.productVariationTypeData.map(product => product.productName);
    return [...new Set(products)];
  }

  updateVariationQuantity(productId: number, variationId: number, quantity: number) {
    const productData = this.productVariationTypeData.find(p => p.productId === productId);
    if (productData) {
      const variation = productData.variations.find(v => v.id === variationId);
      if (variation) {
        variation.quantity = quantity;
      }
    }
  }

  addVariationToSelected(productId: number, variation: any) {
    if (variation.quantity > 0) {
      // Find the product
      const product = this.apiProducts.find(p => p.id === productId);
      if (product) {
        // Check if this variation is already in selected products
        const existingIndex = this.selectedProducts.findIndex(sp => 
          sp.productId === productId && sp.variationId === variation.id);
        
        if (existingIndex > -1) {
          // Update existing selected product quantity
          this.selectedProducts[existingIndex].quantity += variation.quantity;
        } else {
          // Add new selected product
          this.selectedProducts.push({
            id: Date.now(), // Generate unique ID for the selected item
            productId: productId,
            variationId: variation.id,
            productName: product.name,
            variationType: variation.variationType,
            variationValue: variation.variationValue,
            quantity: variation.quantity,
            status: 'pending' // Default status
          });
        }
        
        // Reset the quantity in the variation table
        variation.quantity = 0;
        
        console.log('Added variation to selected products:', this.selectedProducts);
      }
    }
  }

  exportVariationTypeData() {
    // Method to export the variation type data (could be CSV, JSON, etc.)
    const data = {
      products: this.productVariationTypeData,
      statistics: {
        totalProducts: this.productVariationTypeData.length,
        totalVariationTypes: this.getUniqueVariationTypes().length,
        totalVariations: this.getTotalVariationCount(),
        variationTypes: this.getUniqueVariationTypes()
      }
    };
    
    console.log('Product-Variation Type Data:', data);
    // Here you could implement actual export functionality
    return data;
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

  // Supplier dropdown methods
  getFilteredSuppliers() {
    if (!this.supplierSearchTerm) {
      return this.suppliers;
    }
    return this.suppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(this.supplierSearchTerm.toLowerCase())
    );
  }
  
  filterSuppliers() {
    // Trigger filtering when user types
  }
  
  selectSupplier(supplier: any) {
    this.selectedSupplier = supplier;
    this.supplierSearchTerm = supplier.name;
    this.suppliesForm.patchValue({ suppliesName: supplier.value });
    this.showSupplierDropdown = false;
  }
  
  hideSupplierDropdown() {
    setTimeout(() => {
      this.showSupplierDropdown = false;
    }, 200);
  }
  
  clearSupplier() {
    this.selectedSupplier = null;
    this.supplierSearchTerm = '';
    this.suppliesForm.patchValue({ suppliesName: '' });
    this.showSupplierDropdown = false;
  }

  // Product filtering methods
  getFilteredProducts() {
    if (!this.productSearchTerm.trim()) {
      return this.products;
    }
    return this.products.filter(product => 
      product.name.toLowerCase().includes(this.productSearchTerm.toLowerCase())
    );
  }

  filterProducts() {
    // Automatically show dropdown when user starts typing
    if (!this.isProductDropdownOpen) {
      this.isProductDropdownOpen = true;
    }
  }

  clearProductSearch() {
    this.productSearchTerm = '';
  }

  onProductSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.productSearchTerm = target.value;
  }

  onSupplierSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.supplierSearchTerm = target.value;
  }

  // Rich Text Editor Methods
  formatText(command: string, value?: string): void {
    // Focus the editor first to ensure commands work
    const editorElement = document.querySelector('.editor-content') as HTMLElement;
    if (editorElement) {
      editorElement.focus();
      document.execCommand(command, false, value);
      // Don't call updateEditorContent here to avoid cursor reset
      this.emailTemplateContent = editorElement.innerHTML;
      this.updateFormControl();
    }
  }

  isFormatActive(command: string): boolean {
    return document.queryCommandState(command);
  }

  insertLink(): void {
    const editorElement = document.querySelector('.editor-content') as HTMLElement;
    if (editorElement) {
      editorElement.focus();
      const url = prompt('Enter URL:');
      if (url) {
        document.execCommand('createLink', false, url);
        this.emailTemplateContent = editorElement.innerHTML;
        this.updateFormControl();
      }
    }
  }

  onEditorInput(event: any): void {
    // Save cursor position before updating content
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    
    this.emailTemplateContent = event.target.innerHTML;
    this.updateFormControl();
    
    // Restore cursor position
    if (range && selection) {
      setTimeout(() => {
        try {
          selection.removeAllRanges();
          selection.addRange(range);
        } catch (e) {
          // Ignore errors if range is invalid
        }
      }, 0);
    }
  }

  onEditorFocus(): void {
    this.editorFocused = true;
  }

  onEditorBlur(): void {
    this.editorFocused = false;
    this.updateFormControl();
  }

  updateToolbarState(): void {
    // Update toolbar button states based on current selection
    setTimeout(() => {
      // This timeout ensures the command state is updated after the DOM changes
    }, 10);
  }

  private saveSelection(): Range | null {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    return null;
  }

  private restoreSelection(range: Range | null): void {
    if (range) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }

  private updateFormControl(): void {
    // Update the form control with the editor content without affecting cursor
    this.suppliesForm.patchValue({
      emailTemplate: this.emailTemplateContent
    });
  }
}
