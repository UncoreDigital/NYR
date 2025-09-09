import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { HeaderComponent } from '../../header/header.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-location',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, SidebarComponent, HeaderComponent],
  templateUrl: './add-location.component.html',
  styleUrl: './add-location.component.css'
})
export class AddLocationComponent {
  locationForm: FormGroup;
  showSuccess = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.locationForm = this.fb.group({
      customerName: ['', Validators.required],
      locationName: [''],
      contactPerson: [''],
      address1: [''],
      address2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
      title: ['', Validators.required],
      locationPhone: [''],
      mobilePhone: [''],
      faxNumber: [''],
      email: [''],
      comments: [''],
    });
  }

  onSubmit() {
    this.showSuccess = true;
    if (this.locationForm.valid) {
      // Handle form submission (e.g., send to API)
      console.log('Customer Data:', this.locationForm.value);
      this.showSuccess = true;
    } else {
      this.locationForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.locationForm.reset();
  }

  addAnotherLocation() {
    this.showSuccess = false;
    this.locationForm.reset();
  }

  goToLocationsList() {
    this.router.navigate(['/location']);
  }
}