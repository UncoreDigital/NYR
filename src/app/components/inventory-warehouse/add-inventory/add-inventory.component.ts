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
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, SidebarComponent, HeaderComponent, FormsModule],
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

