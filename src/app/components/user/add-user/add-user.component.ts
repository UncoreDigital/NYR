import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { CustomerService, CustomerApiModel } from '../../../services/customer.service';
import { LocationService } from '../../../services/location.service';
import { CreateUserRequest, UserResponse, UpdateUserRequest } from '../../../models/user.model';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css'
})
export class AddUserComponent implements OnInit {
  userForm!: FormGroup;
  showSuccess = false;
  driverAvailability = false;
  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  driverDays: { [key: string]: boolean } = {};
  startTime: string = '';
  endTime: string = '';
  
  isEditMode = false;
  userId: number | null = null;
  currentUser: UserResponse | null = null;
  isLoading = false;
  isSaving = false;
  customers: CustomerApiModel[] = [];
  locations: any[] = [];
  isLoadingLocations = false;
  roles = [
    { id: 1, name: 'Administrators' },
    { id: 2, name: 'Warehouse and Inventory' },
    { id: 3, name: 'Drivers' },
    { id: 4, name: 'Location Staff' }
  ];

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private customerService: CustomerService,
    private locationService: LocationService,
    private toastService: ToastService
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      roleId: ['', Validators.required],
      customerId: [''],
      locationId: [''],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      password: ['', Validators.required], // Will be updated based on mode
      homeAddress: [''],
      startingPoint: ['']
    });
  }

  private updatePasswordValidation(): void {
    const passwordControl = this.userForm.get('password');
    if (passwordControl) {
      if (this.isEditMode) {
        // In edit mode, password is optional
        passwordControl.clearValidators();
        passwordControl.updateValueAndValidity();
      } else {
        // In add mode, password is required
        passwordControl.setValidators([Validators.required]);
        passwordControl.updateValueAndValidity();
      }
    }
  }

  ngOnInit(): void {
    this.loadCustomers();
    
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.userId = +params['id'];
        this.updatePasswordValidation();
        this.loadUserForEdit();
      }
    });
  }

  loadCustomers(): void {
    this.isLoading = true;
    
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading customers:', error);
        this.toastService.error('Error', 'Failed to load customers. Please try again.');
        this.isLoading = false;
      }
    });
  }

  loadLocations(): void {
    const customerId = this.userForm.get('customerId')?.value;
    if (customerId) {
      this.isLoadingLocations = true;
      this.locationService.getLocations().subscribe({
        next: (locations) => {
          // Filter locations by customerId
          this.locations = locations.filter(location => location.customerId == customerId);
          // Reset location selection when customer changes
          this.userForm.get('locationId')?.setValue('');
          this.isLoadingLocations = false;
        },
        error: (error: any) => {
          console.error('Error loading locations:', error);
          this.toastService.error('Error', 'Failed to load locations. Please try again.');
          this.isLoadingLocations = false;
        }
      });
    } else {
      this.locations = [];
      this.userForm.get('locationId')?.setValue('');
      this.isLoadingLocations = false;
    }
  }

  loadUserForEdit(): void {
    if (this.userId) {
      this.isLoading = true;
      this.userService.getUserById(this.userId).subscribe({
        next: (user: UserResponse) => {
          this.currentUser = user;
          this.populateForm(user);
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading user:', error);
          this.toastService.error('Error', 'Failed to load user data. Please try again.');
          this.isLoading = false;
        }
      });
    }
  }

  populateForm(user: UserResponse): void {
    this.userForm.patchValue({
      roleId: user.roleId,
      customerId: user.customerId || 0,
      locationId: user.locationId || 0,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      password: '', // Don't populate password for security
      homeAddress: '', // These fields might not be in the API response
      startingPoint: ''
    });
    
    // Load locations if customer is selected
    if (user.customerId && user.customerId > 0) {
      this.loadLocationsForEdit(user.customerId, user.locationId || 0);
    }
  }

  loadLocationsForEdit(customerId: number, locationId: number): void {
    this.isLoadingLocations = true;
    this.locationService.getLocations().subscribe({
      next: (locations) => {
        // Filter locations by customerId
        this.locations = locations.filter(location => location.customerId == customerId);
        // Don't reset location selection in edit mode - preserve the existing selection
        this.isLoadingLocations = false;
      },
      error: (error: any) => {
        console.error('Error loading locations:', error);
        this.toastService.error('Error', 'Failed to load locations. Please try again.');
        this.isLoadingLocations = false;
      }
    });
  }

  onCustomerChange(): void {
    this.loadLocations();
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.isSaving = true;
      
      const formValue = this.userForm.value;
      
      if (this.isEditMode && this.userId) {
        // Update existing user
        this.toastService.info('Saving', 'Updating user...');
        
        const updateData: UpdateUserRequest = {
          name: formValue.name,
          email: formValue.email,
          phoneNumber: formValue.phoneNumber,
          roleId: formValue.roleId,
          customerId: formValue.customerId || 0,
          locationId: formValue.locationId || 0,
          isActive: this.currentUser?.isActive ?? true
        };

        this.userService.updateUser(this.userId, updateData).subscribe({
          next: (response) => {
            console.log('User updated successfully:', response);
            this.isSaving = false;
            this.toastService.success('Success', 'User has been updated successfully');
            this.showSuccess = true;
          },
          error: (error: any) => {
            console.error('Error updating user:', error);
            const message = error.error?.message || 'Failed to update user. Please try again.';
            this.toastService.error('Error', message);
            this.isSaving = false;
          }
        });
      } else {
        // Create new user
        this.toastService.info('Saving', 'Creating user...');
        
        const userData: CreateUserRequest = {
          name: formValue.name,
          email: formValue.email,
          phoneNumber: formValue.phoneNumber,
          password: formValue.password,
          roleId: formValue.roleId,
          customerId: formValue.customerId || 0,
          locationId: formValue.locationId || 0
        };

        this.userService.createUser(userData).subscribe({
          next: (response) => {
            console.log('User created successfully:', response);
            this.isSaving = false;
            this.toastService.success('Success', 'User has been created successfully');
            this.showSuccess = true;
          },
          error: (error: any) => {
            console.error('Error creating user:', error);
            const message = error.error?.message || 'Failed to create user. Please try again.';
            this.toastService.error('Error', message);
            this.isSaving = false;
          }
        });
      }
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.userForm.reset();
  }

  addAnotherUser() {
    this.showSuccess = false;
    this.userForm.reset();
  }

  goToUsersList() {
    this.router.navigate(['/users']);
  }

  saveDriverAvailability() {
    // Save logic here
    this.driverAvailability = false;
  }

  closeDriverAvailability() {
    this.driverAvailability = false;
  }

  driverAvailabilityClick() {
    this.driverAvailability = true;
  }
}
