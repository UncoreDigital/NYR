import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ProductService } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';
import { ProductApiModel } from '../../../models/product.model';
import { BrandService } from '../../../services/brand.service';
import { CategoryService } from '../../../services/category.service';
import { SupplierService } from '../../../services/supplier.service';
import { Brand } from '../../../models/brand.model';
import { Category } from '../../../models/category.model';
import { SupplierApiModel } from '../../../models/supplier.model';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup;
  categories: Category[] = [];
  brands: Brand[] = [];
  suppliers: SupplierApiModel[] = [];
  variations = ['Variation 1', 'Variation 2'];
  availableVariations = ['Size', 'Color', 'Material', 'Weight', 'Brand', 'Style', 'Pattern', 'Texture'];
  selectedVariations: any[] = [];
  showVariationDropdown = false;
  showInCatalogue = false;
  universal = false;
  imageFile: File | null = null;
  imagePreview: string | null = null;
  imageUrl: string = '';
  showSuccess = false;
  addVariation = false;
  variationNm: string = '';
  isLoading = false;
  productVariations: any[] = [];
  isLoadingDropdowns = false;
  isUploadingImage = false;
  isEditMode = false;
  productId: number | null = null;
  isLoadingProduct = false;

  // Category dropdown properties
  categorySearchTerm: string = '';
  showCategoryDropdown: boolean = false;
  selectedCategory: Category | any = null;

  // Brand dropdown properties
  brandSearchTerm: string = '';
  showBrandDropdown: boolean = false;
  selectedBrand: Brand | any = null;

  // Supplier dropdown properties
  supplierSearchTerm: string = '';
  showSupplierDropdown: boolean = false;
  selectedSupplier: SupplierApiModel | any = null;

  // Variation modal properties
  selectedValueType: 'dropdown' | 'text' | '' = '';
  variationOptions: { value: string }[] = [{ value: '' }];
  textInputConfig = {
    required: false,
    placeholder: '',
    maxLength: null as number | null
  };

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private toastService: ToastService,
    private brandService: BrandService,
    private categoryService: CategoryService,
    private supplierService: SupplierService
  ) {
    this.productForm = this.fb.group({
      productName: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required]],
      sku1: [''],
      sku2: [''],
      sku3: [''],
      sku4: [''],
      category: ['', [Validators.required]],
      brand: ['', [Validators.required]],
      supplier: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      showInCatalogue: [false],
      universal: [false],
      variation: ['']
    });
  }

  ngOnInit(): void {
    this.loadDropdownData();
    
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = +params['id'];
        this.loadProductForEdit();
      }
    });
  }

  loadDropdownData(): void {
    this.isLoadingDropdowns = true;
    
    // Load categories
    this.categoryService.getCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories = categories.filter(c => c.isActive);
      },
      error: (error) => {
        console.error('Failed to load categories', error);
        this.toastService.error('Error', 'Failed to load categories');
      }
    });

    // Load brands
    this.brandService.getBrands().subscribe({
      next: (brands: Brand[]) => {
        this.brands = brands.filter(b => b.isActive);
      },
      error: (error) => {
        console.error('Failed to load brands', error);
        this.toastService.error('Error', 'Failed to load brands');
      }
    });

    // Load suppliers
    this.supplierService.getSuppliers().subscribe({
      next: (suppliers: SupplierApiModel[]) => {
        this.suppliers = suppliers.filter(s => s.isActive);
        this.isLoadingDropdowns = false;
      },
      error: (error) => {
        console.error('Failed to load suppliers', error);
        this.toastService.error('Error', 'Failed to load suppliers');
        this.isLoadingDropdowns = false;
      }
    });
  }

  loadProductForEdit(): void {
    if (!this.productId) return;
    
    this.isLoadingProduct = true;
    this.productService.getProductById(this.productId).subscribe({
      next: (product: ProductApiModel) => {
        this.populateFormWithProduct(product);
        this.isLoadingProduct = false;
      },
      error: (error) => {
        this.isLoadingProduct = false;
        console.error('Failed to load product', error);
        this.toastService.error('Error', 'Failed to load product for editing');
        this.router.navigate(['/product']);
      }
    });
  }

  populateFormWithProduct(product: ProductApiModel): void {
    this.productForm.patchValue({
      productName: product.name,
      description: product.description,
      sku1: product.barcodeSKU,
      sku2: product.barcodeSKU2,
      sku3: product.barcodeSKU3,
      sku4: product.barcodeSKU4,
      price: product.price,
      showInCatalogue: product.showInCatalogue,
      universal: product.isUniversal
    });

    // Set selected dropdown items
    const category = this.categories.find(c => c.id === product.categoryId);
    if (category) {
      this.selectedCategory = category;
      this.categorySearchTerm = category.name;
      this.productForm.patchValue({ category: category.name });
    }

    const brand = this.brands.find(b => b.id === product.brandId);
    if (brand) {
      this.selectedBrand = brand;
      this.brandSearchTerm = brand.name;
      this.productForm.patchValue({ brand: brand.name });
    }

    const supplier = this.suppliers.find(s => s.id === product.supplierId);
    if (supplier) {
      this.selectedSupplier = supplier;
      this.supplierSearchTerm = supplier.name;
      this.productForm.patchValue({ supplier: supplier.name });
    }

    // Set image URL and preview
    if (product.imageUrl) {
      this.imageUrl = product.imageUrl;
      this.imagePreview = product.imageUrl;
    }

    // Set category, brand, and supplier after dropdowns are loaded
    setTimeout(() => {
      const category = this.categories.find(c => c.id === product.categoryId);
      const brand = this.brands.find(b => b.id === product.brandId);
      const supplier = this.suppliers.find(s => s.id === product.supplierId);

      if (category) {
        this.productForm.patchValue({ category: category.name });
      }
      if (brand) {
        this.productForm.patchValue({ brand: brand.name });
      }
      if (supplier) {
        this.productForm.patchValue({ supplier: supplier.name });
      }
    }, 1000); // Wait for dropdowns to load

    // Set variations
    this.productVariations = product.variations.map(v => ({
      variationType: v.variationType,
      variationValue: v.variationValue,
      sku: v.sku,
      priceAdjustment: v.priceAdjustment,
      stockQuantity: v.stockQuantity
    }));
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.isLoading = true;
      const formData = this.productForm.value;
      
      // Map form data to API payload
      const payload = {
        name: formData.productName,
        description: formData.description,
        imageUrl: this.imageUrl || '', // Use the server-returned URL
        barcodeSKU: formData.sku1 || '',
        barcodeSKU2: formData.sku2 || '',
        barcodeSKU3: formData.sku3 || '',
        barcodeSKU4: formData.sku4 || '',
        categoryId: this.getCategoryId(formData.category),
        brandId: this.getBrandId(formData.brand),
        supplierId: this.getSupplierId(formData.supplier),
        price: parseFloat(formData.price) || 0,
        showInCatalogue: formData.showInCatalogue,
        isUniversal: formData.universal,
        variations: this.productVariations.map(v => ({
          productId: 0, // Will be set by backend
          variationType: v.variationType,
          variationValue: v.variationValue,
          sku: v.sku || '',
          priceAdjustment: v.priceAdjustment || 0,
          stockQuantity: v.stockQuantity || 0
        }))
      };

      if (this.isEditMode && this.productId) {
        // Update existing product
        this.productService.updateProduct(this.productId, payload).subscribe({
          next: (response: ProductApiModel) => {
            this.isLoading = false;
            this.showSuccess = true;
            this.toastService.success('Success', 'Product has been successfully updated.');
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Failed to update product', error);
            const message = error?.error?.message || 'Failed to update product. Please try again.';
            this.toastService.error('Error', message);
          }
        });
      } else {
        // Create new product
        this.productService.createProduct(payload).subscribe({
          next: (response: ProductApiModel) => {
            this.isLoading = false;
            this.showSuccess = true;
            this.toastService.success('Success', 'Product has been successfully added.');
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Failed to create product', error);
            const message = error?.error?.message || 'Failed to create product. Please try again.';
            this.toastService.error('Error', message);
          }
        });
      }
    } else {
      this.productForm.markAllAsTouched();
      this.toastService.warning('Validation Error', 'Please fill in all required fields.');
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.toastService.error('Invalid File Type', 'Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.toastService.error('File Too Large', 'Please select an image smaller than 5MB');
        return;
      }

      this.imageFile = file;
      this.isUploadingImage = true;

      // Create preview first
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);

      // Upload image to server
      this.productService.uploadImage(file).subscribe({
        next: (response: { imageUrl: string }) => {
          this.imageUrl = response.imageUrl;
          this.isUploadingImage = false;
          this.toastService.success('Success', 'Image uploaded successfully');
        },
        error: (error) => {
          this.isUploadingImage = false;
          console.error('Failed to upload image', error);
          this.toastService.error('Error', 'Failed to upload image. Please try again.');
          // Reset image state on upload failure
          this.imageFile = null;
          this.imagePreview = null;
          this.imageUrl = '';
        }
      });
    }
  }

  removeImage() {
    this.imageFile = null;
    this.imagePreview = null;
    this.imageUrl = '';
    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    this.toastService.info('Info', 'Image removed');
  }

  addVariationClick() {
    this.addVariation = true;
  }

  addAnotherProduct() {
    this.showSuccess = false;
    this.productForm.reset();
  }

  goToProductsList() {
    this.router.navigate(['/product']);
  }

  saveProductAvailability() {
    if (this.variationNm.trim()) {
      this.productVariations.push({
        variationType: this.productForm.get('variation')?.value,
        variationValue: this.variationNm,
        sku: '',
        priceAdjustment: 0,
        stockQuantity: 0
      });
      this.variationNm = '';
      this.addVariation = false;
      this.toastService.info('Info', 'Variation added successfully.');
    } else {
      this.toastService.warning('Validation Error', 'Please enter a variation name.');
    }
  }

  closeProductAvailability() {
    this.addVariation = false;
    this.resetVariationModal();
  }

  // New dynamic variation methods
  selectValueType(type: 'dropdown' | 'text') {
    this.selectedValueType = type;
    if (type === 'dropdown' && this.variationOptions.length === 0) {
      this.variationOptions = [{ value: '' }];
    }
  }

  addVariationOption() {
    this.variationOptions.push({ value: '' });
  }

  removeVariationOption(index: number) {
    if (this.variationOptions.length > 1) {
      this.variationOptions.splice(index, 1);
    }
  }

  applyTemplate(templateType: string) {
    switch (templateType) {
      case 'size':
        this.variationOptions = [
          { value: 'XS' },
          { value: 'S' },
          { value: 'M' },
          { value: 'L' },
          { value: 'XL' }
        ];
        break;
      case 'color':
        this.variationOptions = [
          { value: 'Red' },
          { value: 'Blue' },
          { value: 'Green' },
          { value: 'Black' },
          { value: 'White' }
        ];
        break;
      case 'material':
        this.variationOptions = [
          { value: 'Cotton' },
          { value: 'Polyester' },
          { value: 'Silk' },
          { value: 'Wool' }
        ];
        break;
    }
  }

  getValidOptions() {
    return this.variationOptions.filter(option => option.value.trim() !== '');
  }

  isVariationValid(): boolean {
    if (!this.variationNm.trim() || !this.selectedValueType) {
      return false;
    }
    
    if (this.selectedValueType === 'dropdown') {
      return this.getValidOptions().length > 0;
    }
    
    return true;
  }

  saveProductVariation() {
    if (!this.isVariationValid()) {
      this.toastService.warning('Validation Error', 'Please fill in all required fields.');
      return;
    }

    const variationData = {
      name: this.variationNm,
      type: this.selectedValueType,
      options: this.selectedValueType === 'dropdown' ? this.getValidOptions().map(opt => opt.value) : null,
      config: this.selectedValueType === 'text' ? this.textInputConfig : null
    };

    this.productVariations.push(variationData);
    this.toastService.success('Success', `Variation "${this.variationNm}" created successfully.`);
    this.closeProductAvailability();
  }

  resetVariationModal() {
    this.variationNm = '';
    this.selectedValueType = '';
    this.variationOptions = [{ value: '' }];
    this.textInputConfig = {
      required: false,
      placeholder: '',
      maxLength: null
    };
  }

  onUniversalToggle(event: any) {
    this.universal = !event.checked;
  }

  // Helper methods for mapping form values to IDs
  private getCategoryId(categoryName: string): number {
    const category = this.categories.find(c => c.name === categoryName);
    return category ? category.id : 1;
  }

  private getBrandId(brandName: string): number {
    const brand = this.brands.find(b => b.name === brandName);
    return brand ? brand.id : 1;
  }

  private getSupplierId(supplierName: string): number {
    const supplier = this.suppliers.find(s => s.name === supplierName);
    return supplier ? supplier.id : 1;
  }

  // Category dropdown methods
  getFilteredCategories(): Category[] {
    if (!this.categorySearchTerm.trim()) {
      return this.categories;
    }
    return this.categories.filter(category => 
      category.name.toLowerCase().includes(this.categorySearchTerm.toLowerCase())
    );
  }

  filterCategories() {
    if (!this.showCategoryDropdown) {
      this.showCategoryDropdown = true;
    }
  }

  selectCategory(category: Category) {
    this.selectedCategory = category;
    this.categorySearchTerm = category.name;
    this.productForm.patchValue({ category: category.name });
    this.showCategoryDropdown = false;
  }

  hideCategoryDropdown() {
    setTimeout(() => {
      this.showCategoryDropdown = false;
    }, 150);
  }

  clearCategory() {
    this.selectedCategory = null;
    this.categorySearchTerm = '';
    this.productForm.patchValue({ category: '' });
    this.showCategoryDropdown = false;
  }

  onCategorySearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.categorySearchTerm = target.value;
  }

  // Brand dropdown methods
  getFilteredBrands(): Brand[] {
    if (!this.brandSearchTerm.trim()) {
      return this.brands;
    }
    return this.brands.filter(brand => 
      brand.name.toLowerCase().includes(this.brandSearchTerm.toLowerCase())
    );
  }

  filterBrands() {
    if (!this.showBrandDropdown) {
      this.showBrandDropdown = true;
    }
  }

  selectBrand(brand: Brand) {
    this.selectedBrand = brand;
    this.brandSearchTerm = brand.name;
    this.productForm.patchValue({ brand: brand.name });
    this.showBrandDropdown = false;
  }

  hideBrandDropdown() {
    setTimeout(() => {
      this.showBrandDropdown = false;
    }, 150);
  }

  clearBrand() {
    this.selectedBrand = null;
    this.brandSearchTerm = '';
    this.productForm.patchValue({ brand: '' });
    this.showBrandDropdown = false;
  }

  onBrandSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.brandSearchTerm = target.value;
  }

  // Supplier dropdown methods
  getFilteredSuppliers(): SupplierApiModel[] {
    if (!this.supplierSearchTerm.trim()) {
      return this.suppliers;
    }
    return this.suppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(this.supplierSearchTerm.toLowerCase())
    );
  }

  filterSuppliers() {
    if (!this.showSupplierDropdown) {
      this.showSupplierDropdown = true;
    }
  }

  selectSupplier(supplier: SupplierApiModel) {
    this.selectedSupplier = supplier;
    this.supplierSearchTerm = supplier.name;
    this.productForm.patchValue({ supplier: supplier.name });
    this.showSupplierDropdown = false;
  }

  hideSupplierDropdown() {
    setTimeout(() => {
      this.showSupplierDropdown = false;
    }, 150);
  }

  clearSupplier() {
    this.selectedSupplier = null;
    this.supplierSearchTerm = '';
    this.productForm.patchValue({ supplier: '' });
    this.showSupplierDropdown = false;
  }

  onSupplierSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.supplierSearchTerm = target.value;
  }

  // Multi-select variation methods
  toggleVariationDropdown() {
    this.showVariationDropdown = !this.showVariationDropdown;
  }

  toggleVariationSelection(variation: string) {
    const existingIndex = this.selectedVariations.findIndex(v => v.name === variation);
    if (existingIndex > -1) {
      this.selectedVariations.splice(existingIndex, 1);
    } else {
      this.selectedVariations.push({
        name: variation,
        mandatory: false
      });
    }
    this.updateVariationFormControl();
  }

  isVariationSelected(variation: string): boolean {
    return this.selectedVariations.some(v => v.name === variation);
  }

  removeSelectedVariation(index: number) {
    this.selectedVariations.splice(index, 1);
    this.updateVariationFormControl();
  }

  updateVariationMandatory(index: number, event: any) {
    if (this.selectedVariations[index]) {
      this.selectedVariations[index].mandatory = event.target.checked;
      this.updateVariationFormControl();
    }
  }

  updateVariationFormControl() {
    const variationString = this.selectedVariations.map(v => 
      `${v.name}${v.mandatory ? ' (Required)' : ''}`
    ).join(', ');
    this.productForm.patchValue({ variation: variationString });
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any) {
    if (!event.target.closest('.multi-select-dropdown')) {
      this.showVariationDropdown = false;
    }
  }

  onCancel() {
    if (this.isEditMode) {
      this.router.navigate(['/product']);
      return;
    }
    this.productForm.reset();
    this.imageFile = null;
    this.imagePreview = null;
    this.imageUrl = '';
    this.productVariations = [];
    this.selectedCategory = null;
    this.selectedBrand = null;
    this.selectedSupplier = null;
    this.categorySearchTerm = '';
    this.brandSearchTerm = '';
    this.supplierSearchTerm = '';
    this.selectedVariations = [];
  }
}