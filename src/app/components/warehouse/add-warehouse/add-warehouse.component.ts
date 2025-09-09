import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-add-warehouse',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, SidebarComponent, HeaderComponent, FormsModule],
  templateUrl: './add-warehouse.component.html',
  styleUrl: './add-warehouse.component.css'
})
export class AddWarehouseComponent {
  warehouseForm: FormGroup;
  showSuccess = false;
  startTime: string = '';
  endTime: string = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.warehouseForm = this.fb.group({
      warehouseName: ['', Validators.required],
      address1: [''],
      address2: [''],
      city: [''],
      state: [''],
      zipCode: [''],
    });
  }

  onSubmit() {
    this.showSuccess = true;
    if (this.warehouseForm.valid) {
      // Handle form submission (e.g., send to API)
      console.log('Customer Data:', this.warehouseForm.value);
      this.showSuccess = true;
    } else {
      this.warehouseForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.warehouseForm.reset();
  }

  addAnotherWarehouse() {
    this.showSuccess = false;
    this.warehouseForm.reset();
  }

  goToWarehousesList() {
    this.router.navigate(['/warehouse']);
  }
}

