import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { HeaderComponent } from '../../header/header.component';
import { Router, ActivatedRoute } from '@angular/router';
import { LocationService } from '../../../services/location.service';
import { CustomerService, CustomerApiModel } from '../../../services/customer.service';
import { ToastService } from '../../../services/toast.service';
import { CreateLocationRequest, LocationResponse } from '../../../models/location.model';

@Component({
  selector: 'app-add-location',
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
  isEditMode = false;
  locationId: number | null = null;
  currentLocation: LocationResponse | null = null;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute,
    private locationService: LocationService,
    private customerService: CustomerService,
    private toastService: ToastService
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
    
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.locationId = +params['id'];
        this.loadLocationForEdit();
      }
    });
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
        this.toastService.error('Error', 'Failed to load customers');
        this.isLoading = false;
      }
    });
  }

  loadLocationForEdit(): void {
    if (!this.locationId) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.locationService.getLocationById(this.locationId).subscribe({
      next: (location) => {
        this.currentLocation = location;
        this.populateForm(location);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading location:', error);
        this.errorMessage = 'Failed to load location. Please try again.';
        this.toastService.error('Error', 'Failed to load location');
        this.isLoading = false;
      }
    });
  }

  populateForm(location: LocationResponse): void {
    this.locationForm.patchValue({
      customerId: location.customerId,
      locationName: location.locationName,
      address1: location.addressLine1,
      address2: location.addressLine2,
      city: location.city,
      state: location.state,
      zip: location.zipCode,
      contactPerson: location.contactPerson,
      title: location.title,
      locationPhone: location.locationPhone,
      mobilePhone: location.mobilePhone,
      faxNumber: location.faxNumber,
      email: location.email,
      comments: location.comments
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

      if (this.isEditMode && this.locationId) {
        // Update existing location
        const updateData = { ...locationData, isActive: this.currentLocation?.isActive ?? true };
        this.locationService.updateLocation(this.locationId, updateData).subscribe({
          next: (response) => {
            console.log('Location updated successfully:', response);
            this.isSaving = false;
            this.showSuccess = true;
            this.toastService.success('Success', 'Location updated successfully');
          },
          error: (error) => {
            console.error('Error updating location:', error);
            this.errorMessage = 'Failed to update location. Please try again.';
            this.toastService.error('Error', 'Failed to update location');
            this.isSaving = false;
          }
        });
      } else {
        // Create new location
        this.locationService.createLocation(locationData).subscribe({
          next: (response) => {
            console.log('Location created successfully:', response);
            this.isSaving = false;
            this.showSuccess = true;
            this.toastService.success('Success', 'Location created successfully');
          },
          error: (error) => {
            console.error('Error creating location:', error);
            this.errorMessage = 'Failed to create location. Please try again.';
            this.toastService.error('Error', 'Failed to create location');
            this.isSaving = false;
          }
        });
      }
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