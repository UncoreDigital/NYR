import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-add-supplier',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, SidebarComponent, HeaderComponent, FormsModule],
  templateUrl: './add-supplier.component.html',
  styleUrl: './add-supplier.component.css'
})
export class AddSupplierComponent {
  supplierForm: FormGroup;
  showSuccess = false;
  startTime: string = '';
  endTime: string = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.supplierForm = this.fb.group({
      supplierName: ['', Validators.required],
      email: [''],
      phoneNumber: [''],
    });
  }

  onSubmit() {
    this.showSuccess = true;
    if (this.supplierForm.valid) {
      // Handle form submission (e.g., send to API)
      console.log('Customer Data:', this.supplierForm.value);
      this.showSuccess = true;
    } else {
      this.supplierForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.supplierForm.reset();
  }

  addAnotherSupplier() {
    this.showSuccess = false;
    this.supplierForm.reset();
  }

  goToSuppliersList() {
    this.router.navigate(['/supplier']);
  }
}
