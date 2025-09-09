import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { HeaderComponent } from '../../header/header.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, SidebarComponent, HeaderComponent],
  templateUrl: './add-customer.component.html',
  styleUrl: './add-customer.component.css'
})
export class AddCustomerComponent {
  customerForm: FormGroup;
  showSuccess = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.customerForm = this.fb.group({
      companyName: ['', Validators.required],
      dba: [''],
      accountNumber: [''],
      address1: [''],
      address2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
      contactName: ['', Validators.required],
      contactLastName: [''],
      jobTitle: [''],
      businessPhone: [''],
      mobilePhone: [''],
      faxNumber: [''],
      email: ['', [Validators.required, Validators.email]],
      website: ['']
    });
  }

  onSubmit() {
    this.showSuccess = true;
    if (this.customerForm.valid) {
      // Handle form submission (e.g., send to API)
      console.log('Customer Data:', this.customerForm.value);
      this.showSuccess = true;
    } else {
      this.customerForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.customerForm.reset();
  }

  addAnotherCustomer() {
    this.showSuccess = false;
    this.customerForm.reset();
  }

  goToCustomersList() {
    this.router.navigate(['/customer']);
  }
}