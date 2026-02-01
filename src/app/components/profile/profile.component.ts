import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { User, UpdateUserRequest, UserResponse } from '../../models/user.model';
import { sanitizePhone, handlePhoneInput } from 'src/app/utils/phone-utils';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm: FormGroup;
  isEditing = false;
  isLoading = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private toastService: ToastService,
    private formBuilder: FormBuilder
  ) {
    this.profileForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      // Default fields from storage - read-only
      roleName: [''],
      customerName: [''],
      locationName: [''],
      createdAt: [''],
      isActive: ['']
    });
  }

  onPhoneInput(controlName: string, event: Event): void {
    handlePhoneInput(this.profileForm, controlName, event);
  }

  getImageUrl(): string {
    if (this.user?.imageUrl) {
      // If it's a full URL, return as is
      if (this.user.imageUrl.startsWith('http')) {
        return this.user.imageUrl;
      }
      // If it's a relative path, combine with API base URL
      const apiBase = environment.apiUrl.replace('/api', ''); // Remove '/api' to get base URL
      return `${apiBase}${this.user.imageUrl}`;
    }
    return './assets/loginImg.png';
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        this.toastService.error('Invalid File', 'Please select a valid image file');
        return;
      }
      
      // Check file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.toastService.error('File Too Large', 'Image size must be less than 5MB');
        return;
      }
      
      // Upload the image
      this.isLoading = true;
      const userId = this.user?.id;
      
      if (userId) {
        this.userService.uploadProfileImage(userId, file).subscribe({
          next: (response) => {
            this.toastService.success('Success', 'Profile image updated successfully');
            this.isLoading = false;
            this.loadUserProfile();
            // Notify header component to update the profile image
            this.authService.notifyImageUpdated();
          },
          error: (error) => {
            this.toastService.error('Error', 'Failed to upload image');
            this.isLoading = false;
            console.error('Image upload error:', error);
          }
        });
      } else {
        this.toastService.error('Error', 'User ID not found');
        this.isLoading = false;
      }
    }
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.isLoading = true;
      this.userService.getUserById(currentUser.id).subscribe({
        next: (userResponse) => {
          // Map UserResponse to User
          this.user = {
            id: userResponse.id,
            name: userResponse.name,
            email: userResponse.email,
            phoneNumber: userResponse.phoneNumber,
            role: userResponse.roleName,
            roleName: userResponse.roleName,
            roleId: userResponse.roleId,
            customerId: userResponse.customerId && userResponse.customerId > 0 ? userResponse.customerId : null,
            customerName: userResponse.customerName,
            locationId: userResponse.locationId && userResponse.locationId > 0 ? userResponse.locationId : null,
            locationName: userResponse.locationName,
            createdAt: userResponse.createdAt,
            isActive: userResponse.isActive,
            imageUrl: userResponse.imageUrl
          };
          this.profileForm.patchValue({
            name: userResponse.name,
            email: userResponse.email,
            phoneNumber: userResponse.phoneNumber,
            roleName: userResponse.roleName,
            customerName: userResponse.customerName,
            locationName: userResponse.locationName,
            createdAt: userResponse.createdAt,
            isActive: userResponse.isActive
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.toastService.error('Error', 'Failed to load user profile');
          this.isLoading = false;
        }
      });
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset form to original values when canceling edit
      this.profileForm.patchValue({
        name: this.user?.name,
        email: this.user?.email,
        phoneNumber: this.user?.phoneNumber,
        roleName: this.user?.roleName,
        customerName: this.user?.customerName,
        locationName: this.user?.locationName,
        createdAt: this.user?.createdAt,
        isActive: this.user?.isActive
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid && this.user) {
      this.isLoading = true;
      
      // Create updated user object with all existing fields plus the edited ones
      const updatedData: UpdateUserRequest = {
        name: this.profileForm.value.name,
        email: this.profileForm.value.email,
        phoneNumber: sanitizePhone(this.profileForm.value.phoneNumber),
        roleId: this.user.roleId || 0,
        customerId: this.user.customerId && this.user.customerId > 0 ? this.user.customerId : null,
        locationId: this.user.locationId && this.user.locationId > 0 ? this.user.locationId : null,
        isActive: this.user.isActive ?? true,
        warehouseId: this.user.warehouseId ?? null
      };

      this.userService.updateUser(this.user.id, updatedData).subscribe({
        next: (updatedUser: UserResponse) => {
          // Map UserResponse back to User interface
          this.user = {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            phoneNumber: updatedUser.phoneNumber,
            role: updatedUser.roleName,
            roleName: updatedUser.roleName,
            roleId: updatedUser.roleId,
            customerId: updatedUser.customerId && updatedUser.customerId > 0 ? updatedUser.customerId : null,
            customerName: updatedUser.customerName,
            locationId: updatedUser.locationId && updatedUser.locationId > 0 ? updatedUser.locationId : null,
            locationName: updatedUser.locationName,
            createdAt: updatedUser.createdAt,
            isActive: updatedUser.isActive
          };
          this.isEditing = false;
          this.isLoading = false;
          this.toastService.success('Success', 'Profile updated successfully');
          
          // Update the user in auth service if needed
          // You might want to refresh the auth state here
        },
        error: (error: any) => {
          console.error('Error updating profile:', error);
          this.toastService.error('Error', 'Failed to update profile');
          this.isLoading = false;
        }
      });
    } else {
      this.toastService.warning('Validation Error', 'Please fill in all required fields correctly');
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.profileForm.patchValue({
      name: this.user?.name,
      email: this.user?.email,
      phoneNumber: this.user?.phoneNumber,
      roleName: this.user?.roleName,
      customerName: this.user?.customerName,
      locationName: this.user?.locationName,
      createdAt: this.user?.createdAt,
      isActive: this.user?.isActive
    });
  }
}
