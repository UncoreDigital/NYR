import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-add-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, SidebarComponent, HeaderComponent, FormsModule],
  templateUrl: './add-inventory.component.html',
  styleUrl: './add-inventory.component.css'
})
export class AddInventoryComponent {
  inventoryForm: FormGroup;
  startTime: string = '';
  endTime: string = '';
  variations: { name: string; value: string }[] = [];
  currentVariationName: string = '';
  currentVariationValue: string = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.inventoryForm = this.fb.group({
      warehouseName: ['', Validators.required],
      prodcut: [''],
      quantity: [''],
    });
  }

  onSubmit() {
    this.router.navigate(['/inwarehouse']);
    if (this.inventoryForm.valid) {
      // Handle form submission (e.g., send to API)
      console.log('Customer Data:', this.inventoryForm.value);
    } else {
      this.inventoryForm.markAllAsTouched();
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

  addVariation() {
    if (this.currentVariationName && this.currentVariationValue) {
      this.variations.push({
        name: this.currentVariationName,
        value: this.currentVariationValue
      });
      this.currentVariationName = '';
      this.currentVariationValue = '';
    }
  }

  removeVariation(index: number) {
    this.variations.splice(index, 1);
  }

  onVariationNameChange(value: string) {
    this.currentVariationName = value;
  }

  onVariationValueChange(value: string) {
    this.currentVariationValue = value;
  }
}

