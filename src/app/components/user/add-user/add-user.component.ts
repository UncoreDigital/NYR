import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { CustomerService, CustomerApiModel } from '../../../services/customer.service';
import { LocationService } from '../../../services/location.service';
import { WarehouseService } from '../../../services/warehouse.service';
import { CreateUserRequest, UserResponse, UpdateUserRequest } from '../../../models/user.model';
import { sanitizePhone, handlePhoneInput } from 'src/app/utils/phone-utils';
import { DriverAvailability, DriverAvailabilityBulkRequest } from '../../../models/driver-availability.model';
import { WarehouseResponse } from '../../../models/warehouse.model';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  userForm!: FormGroup;
  showSuccess = false;
  driverAvailability = false;
  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  driverDays: { [key: string]: boolean } = {};
  startTime: string = '';
  endTime: string = '';
  existingDriverAvailabilities: DriverAvailability[] = [];
  pendingDriverAvailabilities: { days: { [key: string]: boolean }, startTime: string, endTime: string }[] = [];
  
  isEditMode = false;
  userId: number | null = null;
  currentUser: UserResponse | null = null;
  isLoading = false;
  isSaving = false;
  customers: CustomerApiModel[] = [];
  locations: any[] = [];
  warehouses: WarehouseResponse[] = [];
  isLoadingLocations = false;
  isLoadingWarehouses = false;
  roles = [
    { id: 1, name: 'Administrators' },
    { id: 2, name: 'Warehouse and Inventory' },
    { id: 3, name: 'Location Staff' },
    { id: 4, name: 'Drivers' }
  ];

  // Role dropdown properties
  roleSearchTerm: string = '';
  showRoleDropdown: boolean = false;
  selectedRole: any = null;

  // Customer dropdown properties
  customerSearchTerm: string = '';
  showCustomerDropdown: boolean = false;
  selectedCustomer: CustomerApiModel | any = null;

  // Location dropdown properties
  locationSearchTerm: string = '';
  showLocationDropdown: boolean = false;
  selectedLocation: any = null;

  // Starting Point dropdown properties
  startingPointSearchTerm: string = '';
  showStartingPointDropdown: boolean = false;
  selectedStartingPoint: any = null;
  startingPointOptions: any[] = [];

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private customerService: CustomerService,
    private locationService: LocationService,
    private warehouseService: WarehouseService,
    private toastService: ToastService
  ) {
    this.initializeForm();
  }

  onPhoneInput(controlName: string, event: Event): void {
    handlePhoneInput(this.userForm, controlName, event);
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      roleId: ['', Validators.required],
      customerId: [''],
      locationId: [''],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      password: ['', Validators.required], // Will be updated based on mode
      addressLine1: [''],
      addressLine2: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      contactName: [''],
      contactLastName: [''],
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
    this.loadWarehouses();
    
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

  loadWarehouses(): void {
    this.isLoadingWarehouses = true;
    
    this.warehouseService.getWarehouses().subscribe({
      next: (warehouses) => {
        this.warehouses = warehouses;
        this.buildStartingPointOptions();
        this.isLoadingWarehouses = false;
      },
      error: (error: any) => {
        console.error('Error loading warehouses:', error);
        this.toastService.error('Error', 'Failed to load warehouses. Please try again.');
        this.isLoadingWarehouses = false;
      }
    });
  }

  buildStartingPointOptions(): void {
    this.startingPointOptions = [
      {
        id: 'home',
        name: 'Home Address',
        type: 'home'
      }
    ];

    // Add warehouses to options
    this.warehouses.forEach(warehouse => {
      this.startingPointOptions.push({
        id: `warehouse_${warehouse.id}`,
        name: warehouse.name,
        type: 'warehouse',
        warehouseData: warehouse
      });
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
          
          // Load driver availability if user is a driver
          if (user.roleId === 4) {
            this.roleSearchTerm = this.roles.find(r => r.id === 4)?.name || '';
            this.loadDriverAvailability();
          }
          
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
      addressLine1: user.addressLine1 || '',
      addressLine2: user.addressLine2 || '',
      city: user.city || '',
      state: user.state || '',
      zipCode: user.zipCode || '',
      password: '', // Don't populate password for security
      homeAddress: '', // These fields might not be in the API response
      startingPoint: this.warehouses.find(c => c.id === user.warehouseId)?.name || ''
    });
    
    // Set starting point selection if available
    this.setSelectedStartingPoint(this.userForm.get('startingPoint')?.value || '');
    if (this.userForm.value.roleId === 4) {
      this.startingPointSearchTerm = this.userForm.get('startingPoint')?.value || '';
    }
    // Load locations if customer is selected
    if (user.customerId && user.customerId > 0) {
      this.loadLocationsForEdit(user.customerId, user.locationId || 0);
    }
  }

  setSelectedStartingPoint(startingPointValue: string): void {
    if (!startingPointValue) return;

    if (startingPointValue === 'home_address') {
      const homeOption = this.startingPointOptions.find(opt => opt.type === 'home');
      if (homeOption) {
        this.selectedStartingPoint = homeOption;
        this.startingPointSearchTerm = homeOption.name;
      }
    } else if (startingPointValue?.startsWith('warehouse_')) {
      const warehouseId = startingPointValue.replace('warehouse_', '');
      const warehouseOption = this.startingPointOptions.find(opt => 
        opt.type === 'warehouse' && opt.warehouseData?.id == warehouseId
      );
      if (warehouseOption) {
        this.selectedStartingPoint = warehouseOption;
        this.startingPointSearchTerm = warehouseOption.name;
      }
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

  loadDriverAvailability(): void {
    if (this.userId) {
      this.userService.getDriverAvailability(this.userId).subscribe({
        next: (availabilities: DriverAvailability[]) => {
          this.existingDriverAvailabilities = availabilities;
          this.populateDriverAvailabilityForm();
        },
        error: (error: any) => {
          console.error('Error loading driver availability:', error);
          this.toastService.error('Error', 'Failed to load driver availability. Please try again.');
        }
      });
    }
  }

  populateDriverAvailabilityForm(): void {
    // Reset form
    this.driverDays = {};
    this.startTime = '';
    this.endTime = '';

    if (this.existingDriverAvailabilities.length > 0) {
      // Set days based on existing availability
      this.existingDriverAvailabilities.forEach(availability => {
        this.driverDays[availability.dayOfWeek] = true;
      });

      // Set start and end times from first availability
      const firstAvailability = this.existingDriverAvailabilities[0];
      this.startTime = firstAvailability.startTime;
      this.endTime = firstAvailability.endTime;
    }
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
          phoneNumber: sanitizePhone(formValue.phoneNumber),
          addressLine1: formValue.addressLine1,
          addressLine2: formValue.addressLine2,
          city: formValue.city,
          state: formValue.state,
          zipCode: formValue.zipCode,
          roleId: formValue.roleId,
          customerId: formValue.customerId || null,
          locationId: formValue.roleId === 4 ? null : (formValue.locationId || 0),
          isActive: this.currentUser?.isActive ?? true,
          warehouseId: formValue.roleId === 4 ? this.selectedStartingPoint?.warehouseData?.id : 0,
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
          phoneNumber: sanitizePhone(formValue.phoneNumber),
          addressLine1: formValue.addressLine1,
          addressLine2: formValue.addressLine2,
          city: formValue.city,
          state: formValue.state,
          zipCode: formValue.zipCode,
          password: formValue.password,
          roleId: formValue.roleId,
          customerId: formValue.customerId || null,
          locationId: formValue.roleId === 4 ? null : (formValue.locationId || 0),
          warehouseId: formValue.roleId === 4 ? this.selectedStartingPoint?.warehouseData?.id : 0,
        };

        this.userService.createUser(userData).subscribe({
          next: (response) => {
            console.log('User created successfully:', response);
            
            // If user is a driver and has pending driver availability, save it
            if (formValue.roleId === 4 && this.pendingDriverAvailabilities.length > 0) {
              this.saveDriverAvailabilityForNewUser(response.id);
            } else {
              this.isSaving = false;
              this.toastService.success('Success', 'User has been created successfully');
              this.showSuccess = true;
            }
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
    if (this.isEditMode) {
      this.router.navigate(['/users']);
      return;
    }
    this.userForm.reset();
    this.selectedRole = null;
    this.selectedCustomer = null;
    this.selectedLocation = null;
    this.selectedStartingPoint = null;
    this.roleSearchTerm = '';
    this.customerSearchTerm = '';
    this.locationSearchTerm = '';
    this.startingPointSearchTerm = '';
    this.pendingDriverAvailabilities = [];
    this.resetDriverAvailabilityForm();
  }

  addAnotherUser() {
    this.showSuccess = false;
    this.userForm.reset();
    this.selectedRole = null;
    this.selectedCustomer = null;
    this.selectedLocation = null;
    this.selectedStartingPoint = null;
    this.roleSearchTerm = '';
    this.customerSearchTerm = '';
    this.locationSearchTerm = '';
    this.startingPointSearchTerm = '';
    this.pendingDriverAvailabilities = [];
    this.resetDriverAvailabilityForm();
  }

  goToUsersList() {
    this.router.navigate(['/users']);
  }

  saveDriverAvailability() {
    // Validate form
    if (!this.validateDriverAvailabilityForm()) {
      return;
    }

    if (this.isEditMode && this.userId) {
      // Edit mode - create individual availabilities for each selected day
      this.saveIndividualDriverAvailabilities();
    } else {
      // New user mode - add to pending array
      const newAvailability = {
        days: { ...this.driverDays },
        startTime: this.startTime,
        endTime: this.endTime
      };
      
      this.pendingDriverAvailabilities.push(newAvailability);
      this.toastService.success('Success', 'Driver availability added. You can add more or save the user.');
      this.driverAvailability = false;
      this.resetDriverAvailabilityForm();
    }
  }

  private saveIndividualDriverAvailabilities() {
    const selectedDays = Object.keys(this.driverDays).filter(day => this.driverDays[day]);

    if (selectedDays.length === 0) {
      this.toastService.error('Error', 'No days selected');
      return;
    }

    // Create a combined request that includes both existing and new availabilities
    const combinedDays: { [key: string]: boolean } = {};
    
    // Add existing availabilities (preserve them)
    this.existingDriverAvailabilities.forEach(availability => {
      combinedDays[availability.dayOfWeek] = true;
    });
    
    // Add new selected days
    selectedDays.forEach(day => {
      combinedDays[day] = true;
    });

    // Use the bulk endpoint with combined data
    const bulkRequest: DriverAvailabilityBulkRequest = {
      userId: this.userId!,
      days: combinedDays,
      startTime: this.startTime,
      endTime: this.endTime
    };

    this.userService.saveDriverAvailability(this.userId!, bulkRequest).subscribe({
      next: (response) => {
        console.log('Driver availability saved successfully:', response);
        this.toastService.success('Success', 'Driver availability has been saved successfully');
        this.driverAvailability = false;
        // Reload driver availability to reflect changes
        this.loadDriverAvailability();
      },
      error: (error: any) => {
        console.error('Error saving driver availability:', error);
        const message = error.error?.message || 'Failed to save driver availability. Please try again.';
        this.toastService.error('Error', message);
      }
    });
  }

  closeDriverAvailability() {
    this.driverAvailability = false;
  }

  validateDriverAvailabilityForm(): boolean {
    // Check if at least one day is selected
    const hasSelectedDays = Object.values(this.driverDays).some(selected => selected);
    if (!hasSelectedDays) {
      this.toastService.error('Validation Error', 'Please select at least one day');
      return false;
    }

    // Check if start time is provided
    if (!this.startTime) {
      this.toastService.error('Validation Error', 'Please select start time');
      return false;
    }

    // Check if end time is provided
    if (!this.endTime) {
      this.toastService.error('Validation Error', 'Please select end time');
      return false;
    }

    // Check if start time is before end time
    if (this.startTime >= this.endTime) {
      this.toastService.error('Validation Error', 'Start time must be before end time');
      return false;
    }

    // Check for minimum time duration (at least 1 hour)
    const startTimeMinutes = this.timeToMinutes(this.startTime);
    const endTimeMinutes = this.timeToMinutes(this.endTime);
    const durationMinutes = endTimeMinutes - startTimeMinutes;
    
    if (durationMinutes < 60) {
      this.toastService.error('Validation Error', 'Availability duration must be at least 1 hour');
      return false;
    }

    // Check for duplicate availability
    const isDuplicate = this.checkForDuplicateAvailability();
    if (isDuplicate) {
      this.toastService.error('Validation Error', 'This availability already exists. Please select different days or times.');
      return false;
    }

    // Check for overlapping time ranges on same days
    const hasOverlap = this.checkForOverlappingAvailability();
    if (hasOverlap) {
      this.toastService.error('Validation Error', 'This availability overlaps with existing availability on the same days.');
      return false;
    }

    // Check maximum number of availabilities (limit to 10 for performance)
    const totalAvailabilities = this.pendingDriverAvailabilities.length + 
                               (this.isEditMode ? this.existingDriverAvailabilities.length : 0);
    if (totalAvailabilities >= 10) {
      this.toastService.error('Validation Error', 'Maximum 10 availability entries allowed per driver.');
      return false;
    }

    // Check for reasonable time ranges (not too early or too late)
    const startHour = parseInt(this.startTime.split(':')[0]);
    const endHour = parseInt(this.endTime.split(':')[0]);
    
    if (startHour < 5 || startHour > 23) {
      this.toastService.error('Validation Error', 'Start time should be between 5:00 AM and 11:00 PM.');
      return false;
    }
    
    if (endHour < 6 || endHour > 24) {
      this.toastService.error('Validation Error', 'End time should be between 6:00 AM and 12:00 AM.');
      return false;
    }

    return true;
  }

  resetDriverAvailabilityForm(): void {
    this.driverDays = {};
    this.startTime = '';
    this.endTime = '';
  }

  removePendingAvailability(index: number): void {
    this.pendingDriverAvailabilities.splice(index, 1);
  }

  removeExistingAvailability(index: number): void {
    if (this.userId && this.existingDriverAvailabilities[index]) {
      const availability = this.existingDriverAvailabilities[index];
      
      // Call API to delete the availability
      this.userService.deleteDriverAvailability(this.userId, availability.id).subscribe({
        next: (response: any) => {
          console.log('Driver availability deleted successfully:', response);
          this.toastService.success('Success', 'Driver availability has been removed');
          // Reload driver availability to reflect changes
          this.loadDriverAvailability();
        },
        error: (error: any) => {
          console.error('Error deleting driver availability:', error);
          const message = error.error?.message || 'Failed to remove driver availability. Please try again.';
          this.toastService.error('Error', message);
        }
      });
    }
  }

  getSelectedDaysText(availability: { days: { [key: string]: boolean }, startTime: string, endTime: string }): string {
    const selectedDays = Object.keys(availability.days).filter(day => availability.days[day]);
    const startTime12h = this.convertTo12Hour(availability.startTime);
    const endTime12h = this.convertTo12Hour(availability.endTime);
    return `${selectedDays.join(', ')}: ${startTime12h} - ${endTime12h}`;
  }

  getExistingAvailabilityText(availability: DriverAvailability): string {
    const startTime12h = this.convertTo12Hour(availability.startTime);
    const endTime12h = this.convertTo12Hour(availability.endTime);
    return `${availability.dayOfWeek}: ${startTime12h} - ${endTime12h}`;
  }

  convertTo12Hour(time24: string): string {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const minutesStr = minutes.toString().padStart(2, '0');
    return `${hours12}:${minutesStr} ${period}`;
  }

  timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  checkForDuplicateAvailability(): boolean {
    const currentDays = Object.keys(this.driverDays).filter(day => this.driverDays[day]);
    
    // Check against pending availabilities
    const pendingDuplicate = this.pendingDriverAvailabilities.some(availability => {
      const existingDays = Object.keys(availability.days).filter(day => availability.days[day]);
      
      // Check if same days are selected
      const sameDays = currentDays.length === existingDays.length && 
                      currentDays.every(day => existingDays.includes(day));
      
      // Check if same time range
      const sameTime = availability.startTime === this.startTime && 
                       availability.endTime === this.endTime;
      
      return sameDays && sameTime;
    });

    if (pendingDuplicate) {
      return true;
    }

    // Check against existing driver availabilities (for edit mode)
    if (this.isEditMode && this.existingDriverAvailabilities.length > 0) {
      const existingDuplicate = this.existingDriverAvailabilities.some(availability => {
        const existingDays = [availability.dayOfWeek];
        
        // Check if same days are selected
        const sameDays = currentDays.length === existingDays.length && 
                        currentDays.every(day => existingDays.includes(day));
        
        // Check if same time range
        const sameTime = availability.startTime === this.startTime && 
                         availability.endTime === this.endTime;
        
        return sameDays && sameTime;
      });

      return existingDuplicate;
    }

    return false;
  }

  checkForOverlappingAvailability(): boolean {
    const currentDays = Object.keys(this.driverDays).filter(day => this.driverDays[day]);
    const currentStart = this.timeToMinutes(this.startTime);
    const currentEnd = this.timeToMinutes(this.endTime);
    
    // Check against pending availabilities
    const pendingOverlap = this.pendingDriverAvailabilities.some(availability => {
      const existingDays = Object.keys(availability.days).filter(day => availability.days[day]);
      
      // Check if there are any common days
      const hasCommonDays = currentDays.some(day => existingDays.includes(day));
      
      if (!hasCommonDays) {
        return false;
      }
      
      // Check for time overlap
      const existingStart = this.timeToMinutes(availability.startTime);
      const existingEnd = this.timeToMinutes(availability.endTime);
      
      // Two time ranges overlap if one starts before the other ends
      return currentStart < existingEnd && currentEnd > existingStart;
    });

    if (pendingOverlap) {
      return true;
    }

    // Check against existing driver availabilities (for edit mode)
    if (this.isEditMode && this.existingDriverAvailabilities.length > 0) {
      const existingOverlap = this.existingDriverAvailabilities.some(availability => {
        const existingDays = [availability.dayOfWeek];
        
        // Check if there are any common days
        const hasCommonDays = currentDays.some(day => existingDays.includes(day));
        
        if (!hasCommonDays) {
          return false;
        }
        
        // Check for time overlap
        const existingStart = this.timeToMinutes(availability.startTime);
        const existingEnd = this.timeToMinutes(availability.endTime);
        
        // Two time ranges overlap if one starts before the other ends
        return currentStart < existingEnd && currentEnd > existingStart;
      });

      return existingOverlap;
    }

    return false;
  }

  saveDriverAvailabilityForNewUser(userId: number) {
    if (this.pendingDriverAvailabilities.length > 0) {
      // Save all pending availabilities
      this.saveMultipleDriverAvailabilities(userId, 0);
    } else {
      this.isSaving = false;
      this.toastService.success('Success', 'User has been created successfully');
      this.showSuccess = true;
    }
  }

  saveMultipleDriverAvailabilities(userId: number, index: number) {
    if (index >= this.pendingDriverAvailabilities.length) {
      // All availabilities saved
      this.isSaving = false;
      this.pendingDriverAvailabilities = [];
      this.toastService.success('Success', 'User and driver availability have been created successfully');
      this.showSuccess = true;
      return;
    }

    const availability = this.pendingDriverAvailabilities[index];
    const bulkRequest: DriverAvailabilityBulkRequest = {
      userId: userId,
      days: availability.days,
      startTime: availability.startTime,
      endTime: availability.endTime
    };

    this.userService.saveDriverAvailability(userId, bulkRequest).subscribe({
      next: (response) => {
        console.log(`Driver availability ${index + 1} saved successfully:`, response);
        // Save next availability
        this.saveMultipleDriverAvailabilities(userId, index + 1);
      },
      error: (error: any) => {
        console.error(`Error saving driver availability ${index + 1}:`, error);
        // Continue with next availability even if one fails
        this.saveMultipleDriverAvailabilities(userId, index + 1);
      }
    });
  }

  driverAvailabilityClick() {
    // Check if maximum availabilities reached
    const totalAvailabilities = this.pendingDriverAvailabilities.length + 
                               (this.isEditMode ? this.existingDriverAvailabilities.length : 0);
    
    if (totalAvailabilities >= 10) {
      this.toastService.error('Validation Error', 'Maximum 10 availability entries allowed per driver. Please remove some entries before adding new ones.');
      return;
    }

    // Reset form to ensure clean state for adding new availability
    this.resetDriverAvailabilityForm();
    
    // No need to load existing data in edit mode since we already display it as chips
    // Just open the modal for adding new availability
    this.driverAvailability = true;
  }

  // Role dropdown methods
  getFilteredRoles() {
    if (!this.roleSearchTerm.trim()) {
      return this.roles;
    }
    return this.roles.filter(role => 
      role.name.toLowerCase().includes(this.roleSearchTerm.toLowerCase())
    );
  }

  filterRoles() {
    if (!this.showRoleDropdown) {
      this.showRoleDropdown = true;
    }
  }

  selectRole(role: any) {
    this.selectedRole = role;
    this.roleSearchTerm = role.name;
    this.userForm.patchValue({ roleId: role.id });
    this.showRoleDropdown = false;
  }

  hideRoleDropdown() {
    setTimeout(() => {
      this.showRoleDropdown = false;
    }, 150);
  }

  clearRole() {
    this.selectedRole = null;
    this.roleSearchTerm = '';
    this.userForm.patchValue({ roleId: '' });
    this.showRoleDropdown = false;
  }

  onRoleSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.roleSearchTerm = target.value;
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
    if (!this.showCustomerDropdown) {
      this.showCustomerDropdown = true;
    }
  }

  selectCustomer(customer: CustomerApiModel) {
    this.selectedCustomer = customer;
    this.customerSearchTerm = customer.companyName;
    this.userForm.patchValue({ customerId: customer.id });
    this.showCustomerDropdown = false;
    this.onCustomerChange();
  }

  hideCustomerDropdown() {
    setTimeout(() => {
      this.showCustomerDropdown = false;
    }, 150);
  }

  clearCustomer() {
    this.selectedCustomer = null;
    this.customerSearchTerm = '';
    this.userForm.patchValue({ customerId: '' });
    this.showCustomerDropdown = false;
    this.onCustomerChange();
  }

  onCustomerSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.customerSearchTerm = target.value;
  }

  // Location dropdown methods
  getFilteredLocations() {
    if (!this.locationSearchTerm.trim()) {
      return this.locations;
    }
    return this.locations.filter(location => 
      location.locationName.toLowerCase().includes(this.locationSearchTerm.toLowerCase())
    );
  }

  filterLocations() {
    if (!this.showLocationDropdown) {
      this.showLocationDropdown = true;
    }
  }

  selectLocation(location: any) {
    this.selectedLocation = location;
    this.locationSearchTerm = location.locationName;
    this.userForm.patchValue({ locationId: location.id });
    this.showLocationDropdown = false;
  }

  hideLocationDropdown() {
    setTimeout(() => {
      this.showLocationDropdown = false;
    }, 150);
  }

  clearLocation() {
    this.selectedLocation = null;
    this.locationSearchTerm = '';
    this.userForm.patchValue({ locationId: '' });
    this.showLocationDropdown = false;
  }

  onLocationSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.locationSearchTerm = target.value;
  }

  // Starting Point dropdown methods
  getFilteredStartingPoints() {
    if (!this.startingPointSearchTerm.trim()) {
      return this.startingPointOptions;
    }
    return this.startingPointOptions.filter(option => 
      option.name.toLowerCase().includes(this.startingPointSearchTerm.toLowerCase())
    );
  }

  filterStartingPoints() {
    if (!this.showStartingPointDropdown) {
      this.showStartingPointDropdown = true;
    }
  }

  selectStartingPoint(option: any) {
    this.selectedStartingPoint = option;
    this.startingPointSearchTerm = option.name;
    
    if (option.type === 'home') {
      this.userForm.patchValue({ startingPoint: 'home_address' });
    } else if (option.type === 'warehouse') {
      this.userForm.patchValue({ startingPoint: `warehouse_${option.warehouseData.id}` });
    }
    
    this.showStartingPointDropdown = false;
  }

  hideStartingPointDropdown() {
    setTimeout(() => {
      this.showStartingPointDropdown = false;
    }, 150);
  }

  clearStartingPoint() {
    this.selectedStartingPoint = null;
    this.startingPointSearchTerm = '';
    this.userForm.patchValue({ startingPoint: '' });
    this.showStartingPointDropdown = false;
  }

  onStartingPointSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.startingPointSearchTerm = target.value;
  }
}
