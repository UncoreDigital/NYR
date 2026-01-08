import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';
import { ProductApiModel } from '../../../models/product.model';
import { BrandService } from '../../../services/brand.service';
import { CategoryService } from '../../../services/category.service';
import { SupplierService } from '../../../services/supplier.service';
import { VariationService } from '../../../services/variation.service';
import { Brand } from '../../../models/brand.model';
import { Category } from '../../../models/category.model';
import { SupplierApiModel } from '../../../models/supplier.model';
import { Variation } from '../../../models/variation.model';

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
  masterVariations: Variation[] = []; // From Variation Master
  availableVariations: Variation[] = []; // Filtered active variations
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
  
  // Variation combinations (like Amazon)
  variationCombinations: any[] = [];
  selectedOptions: Map<string, string[]> = new Map();

  // Universal product fields (when universal mode is enabled)
  universalDescription: string = '';
  universalPrice: number | null = null;
  universalBarcodeSKU: string = '';
  universalBarcodeSKU2: string = '';
  universalBarcodeSKU3: string = '';
  universalBarcodeSKU4: string = '';

  // Validation methods
  validateBarcodeUniqueness(barcode: string, excludeComboIndex?: number): boolean {
    if (!barcode.trim()) return true; // Empty barcodes are allowed
    
    // Check against universal barcodes
    if (this.universal) {
      const universalBarcodes = [
        this.universalBarcodeSKU,
        this.universalBarcodeSKU2,
        this.universalBarcodeSKU3,
        this.universalBarcodeSKU4
      ].filter(b => b.trim());
      
      if (universalBarcodes.includes(barcode)) return false;
    }
    
    // Check against other variant combinations
    for (let i = 0; i < this.variationCombinations.length; i++) {
      if (excludeComboIndex !== undefined && i === excludeComboIndex) continue;
      
      const combo = this.variationCombinations[i];
      if (!combo.enabled) continue;
      
      const comboBarcodes = [
        combo.barcodeSKU,
        combo.barcodeSKU2,
        combo.barcodeSKU3,
        combo.barcodeSKU4
      ].filter(b => b && b.trim());
      
      if (comboBarcodes.includes(barcode)) return false;
    }
    
    return true;
  }

  validateDescriptionLength(description: string): boolean {
    if (!description || !description.trim()) return false;
    const length = description.trim().length;
    return length >= 10 && length <= 1000;
  }

  validateImageUrl(imageUrl: string): boolean {
    if (!imageUrl.trim()) return true; // Empty URLs are allowed
    
    try {
      new URL(imageUrl);
      return true;
    } catch {
      return false;
    }
  }

  validatePrice(price: number | null): boolean {
    return price !== null && price > 0;
  }

  // Validation error messages
  getBarcodeValidationError(barcode: string, excludeComboIndex?: number): string | null {
    if (!barcode.trim()) return null;
    
    if (!this.validateBarcodeUniqueness(barcode, excludeComboIndex)) {
      return 'This barcode is already used by another variant';
    }
    
    return null;
  }

  getDescriptionValidationError(description: string): string | null {
    if (!description || !description.trim()) {
      return 'Description is required';
    }
    
    if (!this.validateDescriptionLength(description)) {
      return 'Description must be between 10 and 1000 characters';
    }
    
    return null;
  }

  getImageUrlValidationError(imageUrl: string): string | null {
    if (!imageUrl.trim()) return null;
    
    if (!this.validateImageUrl(imageUrl)) {
      return 'Please enter a valid image URL';
    }
    
    return null;
  }

  getPriceValidationError(price: number | null): string | null {
    if (!this.validatePrice(price)) {
      return 'Price must be greater than 0';
    }
    
    return null;
  }

  // Helper method for template
  hasEnabledCombinations(): boolean {
    return this.variationCombinations.some(c => c.enabled);
  }

  // Store original variants for edit mode
  originalVariants: any[] = [];

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
    value: ''
  };

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private toastService: ToastService,
    private brandService: BrandService,
    private categoryService: CategoryService,
    private supplierService: SupplierService,
    private variationService: VariationService
  ) {
    this.productForm = this.fb.group({
      productName: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', [Validators.required]],
      brand: ['', [Validators.required]],
      supplier: ['', [Validators.required]],
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

    // Load variations from Variation Master
    this.variationService.getActiveVariations().subscribe({
      next: (variations: Variation[]) => {
        this.masterVariations = variations;
        this.availableVariations = variations;
      },
      error: (error) => {
        console.error('Failed to load variations', error);
        this.toastService.error('Error', 'Failed to load variations');
      }
    });
  }

  loadProductForEdit(): void {
    if (!this.productId) return;
    
    this.isLoadingProduct = true;
    
    // Wait for master variations to load first
    const checkVariationsLoaded = setInterval(() => {
      if (this.masterVariations.length > 0 || this.isLoadingDropdowns === false) {
        clearInterval(checkVariationsLoaded);
        
        this.productService.getProductById(this.productId!).subscribe({
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
    }, 100);
    
    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkVariationsLoaded);
      if (this.isLoadingProduct) {
        this.productService.getProductById(this.productId!).subscribe({
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
    }, 5000);
  }

  populateFormWithProduct(product: ProductApiModel): void {
    this.productForm.patchValue({
      productName: product.name,
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

    // Set universal flag
    this.universal = product.isUniversal;

    // Handle universal product fields
    if (product.isUniversal && product.variants && product.variants.length > 0) {
      // Store original variants for edit mode
      this.originalVariants = [...product.variants];
      
      const firstVariant = product.variants[0];
      this.universalDescription = firstVariant.description || '';
      this.universalPrice = firstVariant.price || null;
      this.universalBarcodeSKU = firstVariant.barcodeSKU || '';
      this.universalBarcodeSKU2 = firstVariant.barcodeSKU2 || '';
      this.universalBarcodeSKU3 = firstVariant.barcodeSKU3 || '';
      this.universalBarcodeSKU4 = firstVariant.barcodeSKU4 || '';
      
      // Set image URL and preview from first variant
      if (firstVariant.imageUrl) {
        this.imageUrl = firstVariant.imageUrl;
        this.imagePreview = firstVariant.imageUrl;
      }
    }

    // Set variants - load from new ProductVariants system
    if (product.variants && product.variants.length > 0 && !product.isUniversal) {
      // Store original variants for edit mode
      this.originalVariants = [...product.variants];
      
      // Extract unique variations from variants
      const variationGroups = new Map<string, any>();
      const variationValuesByType = new Map<string, Set<string>>();
      
      // Process each variant and its attributes
      product.variants.forEach((variant: any) => {
        variant.attributes.forEach((attr: any) => {
          if (!variationValuesByType.has(attr.variationName)) {
            variationValuesByType.set(attr.variationName, new Set());
          }
          variationValuesByType.get(attr.variationName)!.add(attr.variationOptionName);
          
          if (!variationGroups.has(attr.variationName)) {
            // Find the master variation
            const masterVar = this.masterVariations.find(mv => mv.name === attr.variationName);
            if (masterVar) {
              variationGroups.set(attr.variationName, {
                id: masterVar.id,
                name: masterVar.name,
                valueType: masterVar.valueType,
                options: masterVar.options,
                mandatory: false,
                selectedValues: []
              });
            }
          }
        });
      });
      
      this.selectedVariations = Array.from(variationGroups.values());
      
      // Set selected options for each variation type
      variationValuesByType.forEach((values, typeName) => {
        this.selectedOptions.set(typeName, Array.from(values));
      });
      
      this.updateVariationFormControl();
      
      // Generate combinations based on the loaded variants
      this.generateVariationCombinations();
      
      // Map existing variant data to combinations
      if (this.variationCombinations.length > 0) {
        this.variationCombinations.forEach(combo => {
          // Find matching variant
          const matchingVariant = product.variants.find((v: any) => v.variantName === this.getCombinationName(combo));
          if (matchingVariant) {
            combo.id = matchingVariant.id; // Store variant ID for updates
            combo.sku = matchingVariant.sku || '';
            combo.price = matchingVariant.price || 0;
            combo.description = matchingVariant.description || '';
            combo.imageUrl = matchingVariant.imageUrl || '';
            combo.barcodeSKU = matchingVariant.barcodeSKU || '';
            combo.barcodeSKU2 = matchingVariant.barcodeSKU2 || '';
            combo.barcodeSKU3 = matchingVariant.barcodeSKU3 || '';
            combo.barcodeSKU4 = matchingVariant.barcodeSKU4 || '';
            combo.enabled = matchingVariant.isEnabled;
          } else {
            combo.id = null; // New variant
            combo.sku = '';
            combo.price = 0;
            combo.description = '';
            combo.imageUrl = '';
            combo.barcodeSKU = '';
            combo.barcodeSKU2 = '';
            combo.barcodeSKU3 = '';
            combo.barcodeSKU4 = '';
            combo.enabled = true;
          }
        });
      }
      
      console.log('Loaded variants for edit:', this.selectedVariations);
      console.log('Loaded combinations for edit:', this.variationCombinations);
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
  }

  onSubmit() {
    // Validate form
    if (!this.productForm.valid) {
      this.productForm.markAllAsTouched();
      this.toastService.warning('Validation Error', 'Please fill in all required fields.');
      return;
    }

    // Validate universal product fields
    if (this.universal) {
      const descError = this.getDescriptionValidationError(this.universalDescription);
      if (descError) {
        this.toastService.warning('Validation Error', descError);
        return;
      }
      
      const priceError = this.getPriceValidationError(this.universalPrice);
      if (priceError) {
        this.toastService.warning('Validation Error', priceError);
        return;
      }
      
      // Validate universal barcodes uniqueness
      const universalBarcodes = [
        { value: this.universalBarcodeSKU, name: 'Barcode SKU' },
        { value: this.universalBarcodeSKU2, name: 'Barcode SKU #2' },
        { value: this.universalBarcodeSKU3, name: 'Barcode SKU #3' },
        { value: this.universalBarcodeSKU4, name: 'Barcode SKU #4' }
      ].filter(b => b.value.trim());
      
      const uniqueBarcodes = new Set();
      for (const barcode of universalBarcodes) {
        if (uniqueBarcodes.has(barcode.value)) {
          this.toastService.warning('Validation Error', `Duplicate barcode found: ${barcode.value}`);
          return;
        }
        uniqueBarcodes.add(barcode.value);
      }
    }

    // Validate variations for non-universal products
    if (!this.universal && this.selectedVariations.length === 0) {
      this.toastService.warning('Validation Error', 'Please select at least one variation for non-universal products.');
      return;
    }

    // Validate variant combinations for non-universal products
    if (!this.universal && this.variationCombinations.length === 0) {
      this.toastService.warning('Validation Error', 'Please generate at least one variant combination.');
      return;
    }

    // Validate enabled combinations have required fields
    if (!this.universal) {
      const enabledCombos = this.variationCombinations.filter(combo => combo.enabled);
      if (enabledCombos.length === 0) {
        this.toastService.warning('Validation Error', 'Please enable at least one variant combination.');
        return;
      }

      for (const combo of enabledCombos) {
        const descError = this.getDescriptionValidationError(combo.description);
        if (descError) {
          this.toastService.warning('Validation Error', `${descError} for variant: ${this.getCombinationName(combo)}`);
          return;
        }
        
        const priceError = this.getPriceValidationError(combo.price);
        if (priceError) {
          this.toastService.warning('Validation Error', `${priceError} for variant: ${this.getCombinationName(combo)}`);
          return;
        }
        
        // Validate image URL if provided
        if (combo.imageUrl) {
          const imageError = this.getImageUrlValidationError(combo.imageUrl);
          if (imageError) {
            this.toastService.warning('Validation Error', `${imageError} for variant: ${this.getCombinationName(combo)}`);
            return;
          }
        }
      }
      
      // Validate barcode uniqueness across all variants
      const allBarcodes = new Map<string, string>(); // barcode -> variant name
      for (const combo of enabledCombos) {
        const comboBarcodes = [
          { value: combo.barcodeSKU, name: 'Barcode SKU' },
          { value: combo.barcodeSKU2, name: 'Barcode SKU #2' },
          { value: combo.barcodeSKU3, name: 'Barcode SKU #3' },
          { value: combo.barcodeSKU4, name: 'Barcode SKU #4' }
        ].filter(b => b.value && b.value.trim());
        
        for (const barcode of comboBarcodes) {
          if (allBarcodes.has(barcode.value)) {
            this.toastService.warning('Validation Error', 
              `Duplicate barcode "${barcode.value}" found in variants: ${allBarcodes.get(barcode.value)} and ${this.getCombinationName(combo)}`);
            return;
          }
          allBarcodes.set(barcode.value, this.getCombinationName(combo));
        }
      }
    }

    if (this.productForm.valid) {
      this.isLoading = true;
      const formData = this.productForm.value;
      
      // Generate variants from combinations or universal product
      const generatedVariants: any[] = [];
      
      if (this.universal) {
        // Create single variant for universal product
        const universalVariant: any = {
          variantName: 'Universal',
          sku: null,
          price: this.universalPrice,
          description: this.universalDescription,
          imageUrl: this.imageUrl || '',
          barcodeSKU: this.universalBarcodeSKU || '',
          barcodeSKU2: this.universalBarcodeSKU2 || '',
          barcodeSKU3: this.universalBarcodeSKU3 || '',
          barcodeSKU4: this.universalBarcodeSKU4 || '',
          isEnabled: true,
          attributes: []
        };
        
        // Include variant ID if in edit mode
        if (this.isEditMode && this.originalVariants.length > 0) {
          universalVariant.id = this.originalVariants[0].id;
        }
        
        generatedVariants.push(universalVariant);
      } else if (this.variationCombinations.length > 0) {
        // Use enabled combinations only and create variants for each combination
        const enabledCombos = this.variationCombinations.filter(combo => combo.enabled);
        
        enabledCombos.forEach(combo => {
          // Create variant with attributes
          const variant: any = {
            variantName: this.getCombinationName(combo),
            sku: combo.sku || null,
            price: parseFloat(combo.price) || 0,
            description: combo.description || '',
            imageUrl: combo.imageUrl || '',
            barcodeSKU: combo.barcodeSKU || '',
            barcodeSKU2: combo.barcodeSKU2 || '',
            barcodeSKU3: combo.barcodeSKU3 || '',
            barcodeSKU4: combo.barcodeSKU4 || '',
            isEnabled: combo.enabled,
            attributes: combo.values.map((val: any) => {
              // Find the variation and option IDs
              const variation = this.selectedVariations.find(v => v.name === val.name);
              const option = variation?.options.find((opt: any) => opt.name === val.value);
              
              return {
                variationId: variation?.id || 0,
                variationOptionId: option?.id || 0
              };
            })
          };
          
          // Include variant ID if in edit mode and combo has an ID
          if (this.isEditMode && combo.id) {
            variant.id = combo.id;
          }
          
          generatedVariants.push(variant);
        });
        
        console.log('Generated variants from combinations:', generatedVariants);
      }

      const payload = {
        name: formData.productName,
        categoryId: this.getCategoryId(formData.category),
        brandId: this.getBrandId(formData.brand),
        supplierId: this.getSupplierId(formData.supplier),
        showInCatalogue: formData.showInCatalogue,
        isUniversal: formData.universal,
        variants: generatedVariants
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
    // Open quick add variation modal
    this.addVariation = true;
    this.resetVariationModal();
  }

  closeProductAvailability() {
    this.addVariation = false;
    this.resetVariationModal();
  }

  // Quick add variation methods
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
    
    if (this.selectedValueType === 'text') {
      return this.textInputConfig.placeholder.trim() !== '';
    }
    
    return true;
  }

  saveProductVariation() {
    if (!this.isVariationValid()) {
      this.toastService.warning('Validation Error', 'Please fill in all required fields.');
      return;
    }

    this.toastService.info('Saving', 'Creating variation...');

    // Create variation via API
    const createPayload = {
      name: this.variationNm,
      valueType: this.selectedValueType === 'dropdown' ? 'Dropdown' : 'TextInput',
      options: this.selectedValueType === 'dropdown'
        ? this.getValidOptions().map(opt => ({
            name: opt.value,
            value: opt.value
          }))
        : [{
            name: this.textInputConfig.placeholder || 'Value',
            value: this.textInputConfig.value || null
          }]
    };

    this.variationService.createVariation(createPayload).subscribe({
      next: (newVariation: Variation) => {
        this.toastService.success('Success', `Variation "${this.variationNm}" created successfully.`);
        
        // Add to master variations list
        this.masterVariations.push(newVariation);
        this.availableVariations = [...this.masterVariations];
        
        // Auto-select the newly created variation
        this.selectedVariations.push({
          id: newVariation.id,
          name: newVariation.name,
          valueType: newVariation.valueType,
          options: newVariation.options,
          mandatory: false,
          selectedValues: []
        });
        this.updateVariationFormControl();
        
        this.closeProductAvailability();
      },
      error: (error) => {
        const message = error?.error?.message || 'Failed to create variation';
        this.toastService.error('Error', message);
      }
    });
  }

  resetVariationModal() {
    this.variationNm = '';
    this.selectedValueType = '';
    this.variationOptions = [{ value: '' }];
    this.textInputConfig = {
      required: false,
      placeholder: '',
      value: ''
    };
  }

  addAnotherProduct() {
    this.showSuccess = false;
    this.productForm.reset();
    this.selectedVariations = [];
    this.variationCombinations = [];
    this.imageFile = null;
    this.imagePreview = null;
    this.imageUrl = '';
    this.universalDescription = '';
    this.universalPrice = null;
    this.universalBarcodeSKU = '';
    this.universalBarcodeSKU2 = '';
    this.universalBarcodeSKU3 = '';
    this.universalBarcodeSKU4 = '';
  }

  goToProductsList() {
    this.router.navigate(['/product']);
  }

  onUniversalToggle(event: any) {
    this.universal = !event.checked;
    
    // Clear variant-specific data when switching to universal
    if (this.universal) {
      this.selectedVariations = [];
      this.variationCombinations = [];
      this.selectedOptions.clear();
      this.updateVariationFormControl();
    } else {
      // Clear universal data when switching to variants
      this.universalDescription = '';
      this.universalPrice = null;
      this.universalBarcodeSKU = '';
      this.universalBarcodeSKU2 = '';
      this.universalBarcodeSKU3 = '';
      this.universalBarcodeSKU4 = '';
      this.imageUrl = '';
      this.imagePreview = null;
    }
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
  toggleVariationDropdown(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.showVariationDropdown = !this.showVariationDropdown;
  }

  toggleVariationSelection(variation: Variation) {
    const existingIndex = this.selectedVariations.findIndex(v => v.id === variation.id);
    if (existingIndex > -1) {
      this.selectedVariations.splice(existingIndex, 1);
      this.selectedOptions.delete(variation.name);
      this.toastService.info('Info', `Variation "${variation.name}" removed`);
    } else {
      this.selectedVariations.push({
        id: variation.id,
        name: variation.name,
        valueType: variation.valueType,
        options: variation.options,
        mandatory: false,
        selectedValues: [] // For storing user selections
      });
      // Initialize with all options selected by default
      this.selectedOptions.set(variation.name, variation.options.map((opt: any) => opt.name));
      this.toastService.success('Success', `Variation "${variation.name}" added`);
    }
    this.updateVariationFormControl();
    this.generateVariationCombinations();
    // Keep dropdown open for multiple selections
  }

  // Toggle individual option selection for a variation
  toggleOptionSelection(variationName: string, optionName: string) {
    const currentOptions = this.selectedOptions.get(variationName) || [];
    const index = currentOptions.indexOf(optionName);
    
    if (index > -1) {
      currentOptions.splice(index, 1);
    } else {
      currentOptions.push(optionName);
    }
    
    this.selectedOptions.set(variationName, currentOptions);
    this.generateVariationCombinations();
  }

  // Check if an option is selected
  isOptionSelected(variationName: string, optionName: string): boolean {
    const options = this.selectedOptions.get(variationName) || [];
    return options.includes(optionName);
  }

  // Generate all combinations of selected variations
  generateVariationCombinations() {
    if (this.selectedVariations.length === 0) {
      this.variationCombinations = [];
      return;
    }

    // Get all selected options for each variation
    const variationArrays: any[] = [];
    this.selectedVariations.forEach(variation => {
      const selectedOpts = this.selectedOptions.get(variation.name) || [];
      if (selectedOpts.length > 0) {
        variationArrays.push({
          name: variation.name,
          options: selectedOpts
        });
      }
    });

    if (variationArrays.length === 0) {
      this.variationCombinations = [];
      return;
    }

    // Generate cartesian product of all options
    const combinations = this.cartesianProduct(variationArrays);
    
    // Create combination objects with default values
    this.variationCombinations = combinations.map((combo, index) => {
      // Check if this combination already exists (preserve user data)
      const existing = this.variationCombinations.find(c => 
        JSON.stringify(c.values) === JSON.stringify(combo)
      );
      
      return existing || {
        id: index + 1,
        values: combo,
        sku: '',
        price: 0,
        description: '',
        imageUrl: '',
        barcodeSKU: '',
        barcodeSKU2: '',
        barcodeSKU3: '',
        barcodeSKU4: '',
        enabled: true
      };
    });
  }

  // Helper function to generate cartesian product
  private cartesianProduct(arrays: any[]): any[] {
    if (arrays.length === 0) return [[]];
    if (arrays.length === 1) {
      return arrays[0].options.map((opt: string) => [{ name: arrays[0].name, value: opt }]);
    }

    const result: any[] = [];
    const [first, ...rest] = arrays;
    const restProduct = this.cartesianProduct(rest);

    first.options.forEach((opt: string) => {
      restProduct.forEach((prod: any) => {
        result.push([{ name: first.name, value: opt }, ...prod]);
      });
    });

    return result;
  }

  // Get combination display name
  getCombinationName(combination: any): string {
    return combination.values.map((v: any) => v.value).join(' / ');
  }

  // Toggle combination enabled/disabled
  toggleCombination(index: number) {
    this.variationCombinations[index].enabled = !this.variationCombinations[index].enabled;
  }

  // Update combination field
  updateCombinationField(index: number, field: string, value: any) {
    this.variationCombinations[index][field] = value;
  }

  isVariationSelected(variation: Variation): boolean {
    return this.selectedVariations.some(v => v.id === variation.id);
  }

  removeSelectedVariation(index: number) {
    const variation = this.selectedVariations[index];
    this.selectedOptions.delete(variation.name);
    this.selectedVariations.splice(index, 1);
    this.updateVariationFormControl();
    this.generateVariationCombinations();
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
    this.variationCombinations = [];
    this.universalDescription = '';
    this.universalPrice = null;
    this.universalBarcodeSKU = '';
    this.universalBarcodeSKU2 = '';
    this.universalBarcodeSKU3 = '';
    this.universalBarcodeSKU4 = '';
  }
}