import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { HeaderComponent } from '../../header/header.component';
import { Router } from '@angular/router';
import { LocationService } from '../../../services/location.service';
import { CustomerService, CustomerApiModel } from '../../../services/customer.service';
import { CreateLocationRequest } from '../../../models/location.model';

@Component({
  selector: 'app-add-location',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule, SidebarComponent, HeaderComponent],
  templateUrl: './add-location.component.html',
  styleUrl: './add-location.component.css'
})
export class AddLocationComponent implements OnInit {
  locationForm: FormGroup;
  showSuccess = false;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  customers: CustomerApiModel[] = [];

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private locationService: LocationService,
    private customerService: CustomerService
  ) {
    this.locationForm = this.fb.group({
      customerId: ['', Validators.required],
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

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.errorMessage = 'Failed to load customers. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.locationForm.valid) {
      this.isSaving = true;
      this.errorMessage = '';
      
      const formValue = this.locationForm.value;
      const locationData: CreateLocationRequest = {
        customerId: formValue.customerId,
        locationName: formValue.locationName,
        addressLine1: formValue.address1,
        addressLine2: formValue.address2,
        city: formValue.city,
        state: formValue.state,
        zipCode: formValue.zip,
        contactPerson: formValue.contactPerson,
        title: formValue.title,
        locationPhone: formValue.locationPhone,
        mobilePhone: formValue.mobilePhone,
        faxNumber: formValue.faxNumber,
        email: formValue.email,
        comments: formValue.comments
      };

      this.locationService.createLocation(locationData).subscribe({
        next: (response) => {
          console.log('Location created successfully:', response);
          this.isSaving = false;
          this.showSuccess = true;
        },
        error: (error) => {
          console.error('Error creating location:', error);
          this.errorMessage = 'Failed to create location. Please try again.';
          this.isSaving = false;
        }
      });
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