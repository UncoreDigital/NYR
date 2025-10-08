import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { User } from '../../models/user.model';

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
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]]
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.isLoading = true;
      this.userService.getUserById(currentUser.id).subscribe({
        next: (user) => {
          this.user = user;
          this.profileForm.patchValue({
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber
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
        phoneNumber: this.user?.phoneNumber
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid && this.user) {
      this.isLoading = true;
      
      // Create updated user object with all existing fields plus the edited ones
      const updatedData: User = {
        ...this.user, // Keep all existing user data
        name: this.profileForm.value.name,
        email: this.profileForm.value.email,
        phoneNumber: this.profileForm.value.phoneNumber
      };

      this.userService.updateUser(this.user.id, updatedData).subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
          this.isEditing = false;
          this.isLoading = false;
          this.toastService.success('Success', 'Profile updated successfully');
          
          // Update the user in auth service if needed
          // You might want to refresh the auth state here
        },
        error: (error) => {
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
      phoneNumber: this.user?.phoneNumber
    });
  }
}
