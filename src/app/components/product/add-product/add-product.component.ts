import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, SidebarComponent, HeaderComponent, FormsModule, MatSlideToggleModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent {
  productForm: FormGroup;
  categories = ['Category 1', 'Category 2'];
  brands = ['Brand 1', 'Brand 2'];
  suppliers = ['John, Smith', 'Jane, Doe'];
  variations = ['Variation 1', 'Variation 2'];
  showInCatalogue = false;
  universal = false;
  imageFile: File | null = null;
  showSuccess = false;
  addVariation = false;
  variationNm: string = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.productForm = this.fb.group({
      productName: [''],
      description: [''],
      sku1: [''],
      sku2: [''],
      sku3: [''],
      sku4: [''],
      category: [''],
      brand: [''],
      supplier: [''],
      price: [''],
      showInCatalogue: [false],
      universal: [false],
      variation: ['']
    });
  }

  ngOnInit(): void { }

  onSubmit() {
    this.showSuccess = true;
    if (this.productForm.valid) {
      const formData = { ...this.productForm.value, image: this.imageFile };
      // Handle form submission (e.g., send to API)
      console.log('Form submitted:', formData);
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
    }
  }

  addVariationClick() {
    this.addVariation = true;
  }

  addAnotherProduct() {
    this.showSuccess = false;
    this.productForm.reset();
  }

  goToProductsList() {
    this.router.navigate(['/products']);
  }

  saveProductAvailability() {
    // Save logic here
    this.addVariation = false;
  }

  closeProductAvailability() {
    this.addVariation = false;
  }

  onUniversalToggle(event: any) {
    this.universal = !event.checked;
  }
}