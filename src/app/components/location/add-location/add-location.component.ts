import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LocationService } from '../../../services/location.service';
import { CustomerService, CustomerApiModel } from '../../../services/customer.service';
import { UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';
import { CreateLocationRequest, LocationResponse } from '../../../models/location.model';
import { sanitizePhone, handlePhoneInput, sanitizeDigits, handleDigitsInput } from 'src/app/utils/phone-utils';
import { UserResponse } from '../../../models/user.model';

@Component({
  selector: 'app-add-location',
  templateUrl: './add-location.component.html',
  styleUrls: ['./add-location.component.css']
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

  // Customer dropdown properties
  customerSearchTerm: string = '';
  showCustomerDropdown: boolean = false;
  selectedCustomer: CustomerApiModel | any = null;

  // Driver dropdown properties
  driverSearchTerm: string = '';
  showDriverDropdown: boolean = false;
  selectedDriver: UserResponse | any = null;
  drivers: UserResponse[] = [];
  showValidation = false;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute,
    private locationService: LocationService,
    private customerService: CustomerService,
    private userService: UserService,
    private toastService: ToastService
  ) {
    this.locationForm = this.fb.group({
      userId: ['', Validators.required],
      customerId: ['', Validators.required],
      locationName: ['', Validators.required],
      contactPerson: [''],
      address1: [''],
      address2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
      title: ['', Validators.required],
      locationPhone: ['', Validators.pattern(/^\d{10}$/)],
      mobilePhone: ['', Validators.pattern(/^\d{10}$/)],
      faxNumber: ['', Validators.pattern(/^\d{10}$/)],
      email: [''],
      comments: [''],
      followUpDays: ['']
    });
  }

  onPhoneInput(controlName: string, event: Event): void {
    handlePhoneInput(this.locationForm, controlName, event);
  }

  onDigitsInput(controlName: string, event: Event): void {
    handleDigitsInput(this.locationForm, controlName, event, 10);
  }

  ngOnInit(): void {
    this.loadCustomers();
    this.loadDrivers();
    
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
      comments: location.comments,
      userId: location.userId || '',
      followUpDays: location.followUpDays || 0
    });
    this.driverSearchTerm = location.userName || '';
    // Set selected customer for dropdown
    const customer = this.customers.find(c => c.id === location.customerId);
    if (customer) {
      this.selectedCustomer = customer;
      this.customerSearchTerm = customer.companyName;
    } else {
      this.selectedCustomer = location.customerId;
      this.customerSearchTerm = location.customerName || '';
    }
  }

  onSubmit() {
    if (this.locationForm.invalid || this.isSaving) {
      this.showValidation = true;
      this.locationForm.markAllAsTouched();
      return;
    }

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
        locationPhone: sanitizePhone(formValue.locationPhone),
        mobilePhone: sanitizePhone(formValue.mobilePhone),
        faxNumber: sanitizePhone(formValue.faxNumber),
        email: formValue?.email?.trim() == "" ? formValue?.email?.trim() : null,
        comments: formValue.comments,
        userId: formValue.userId,
        followUpDays: formValue?.followUpDays || 0
      };
      if (locationData?.followUpDays && locationData?.followUpDays > 60) {
        this.toastService.error('Error', 'Add follow-up days restriction: must be under 60 days');
        this.isSaving = false;
        return;
      }
      if (this.isEditMode && this.locationId) {
        // Update existing location
        const updateData = { ...locationData, isActive: this.currentLocation?.isActive ?? true };
        this.locationService.updateLocation(this.locationId, updateData).subscribe({
          next: (response) => {
            console.log('Location updated successfully:', response);
              this.isSaving = false;
              this.showSuccess = true;
              this.showValidation = false;
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
            this.showValidation = false;
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
    if (this.isEditMode) {
      this.router.navigate(['/location']);
      return;
    }
    this.locationForm.reset();
    this.showValidation = false;
    this.selectedCustomer = null;
    this.customerSearchTerm = '';
    this.selectedDriver = null;
    this.driverSearchTerm = '';
  }

  addAnotherLocation() {
    this.showSuccess = false;
    this.locationForm.reset();
    this.showValidation = false;
    this.selectedCustomer = null;
    this.customerSearchTerm = '';
    this.selectedDriver = null;
    this.driverSearchTerm = '';
  }

  goToLocationsList() {
    this.router.navigate(['/location']);
  }

  // Customer dropdown methods
  getFilteredCustomers(): CustomerApiModel[] {
    if (!this.customerSearchTerm.trim()) {
      return this.customers;
    }
    return this.customers.filter(customer => 
      customer.companyName.toLowerCase().includes(this.customerSearchTerm.toLowerCase())
    );
  }

  filterCustomers() {
    // Automatically show dropdown when user starts typing
    if (!this.showCustomerDropdown) {
      this.showCustomerDropdown = true;
    }
  }

  selectCustomer(customer: CustomerApiModel) {
    this.selectedCustomer = customer;
    this.customerSearchTerm = customer.companyName;
    this.locationForm.patchValue({ customerId: customer.id });
    this.showCustomerDropdown = false;
  }

  hideCustomerDropdown() {
    setTimeout(() => {
      this.showCustomerDropdown = false;
    }, 150);
  }

  clearCustomer() {
    this.selectedCustomer = null;
    this.customerSearchTerm = '';
    this.locationForm.patchValue({ customerId: '' });
    this.showCustomerDropdown = false;
  }

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.customerSearchTerm = target.value;
  }

  // Driver dropdown methods
  loadDrivers(): void {
    this.userService.getDrivers().subscribe({
      next: (drivers) => {
        this.drivers = drivers;
      },
      error: (error) => {
        console.error('Error loading drivers:', error);
        this.toastService.error('Error', 'Failed to load drivers');
      }
    });
  }

  getFilteredDrivers(): UserResponse[] {
    if (!this.driverSearchTerm.trim()) {
      return this.drivers;
    }
    return this.drivers.filter(driver => 
      driver.name.toLowerCase().includes(this.driverSearchTerm.toLowerCase())
    );
  }

  filterDrivers() {
    if (!this.showDriverDropdown) {
      this.showDriverDropdown = true;
    }
  }

  selectDriver(driver: UserResponse) {
    this.selectedDriver = driver;
    this.driverSearchTerm = driver.name;
    this.locationForm.patchValue({ userId: driver.id });
    this.showDriverDropdown = false;
  }

  hideDriverDropdown() {
    setTimeout(() => {
      this.showDriverDropdown = false;
    }, 150);
  }

  clearDriver() {
    this.selectedDriver = null;
    this.driverSearchTerm = '';
    this.showDriverDropdown = false;
    this.locationForm.patchValue({ userId: '' });
  }

  onDriverSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.driverSearchTerm = target.value;
  }
}