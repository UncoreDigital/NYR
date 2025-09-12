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
}
