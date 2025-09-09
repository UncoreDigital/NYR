import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { HeaderComponent } from '../../header/header.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, SidebarComponent, HeaderComponent, FormsModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css'
})
export class AddUserComponent {
  userForm: FormGroup;
  showSuccess = false;
  driverAvailability = false;
  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  driverDays: { [key: string]: boolean } = {};
  startTime: string = '';
  endTime: string = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.userForm = this.fb.group({
      role: ['', Validators.required],
      customer: [''],
      locationName: [''],
      name: [''],
      email: [''],
      phoneNumber: [''],
      homeAddress: [''],
      startingPoint: ['']
    });
  }

  onSubmit() {
    this.showSuccess = true;
    if (this.userForm.valid) {
      // Handle form submission (e.g., send to API)
      console.log('Customer Data:', this.userForm.value);
      this.showSuccess = true;
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
