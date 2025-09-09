import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';


@Component({
  selector: 'app-add-van',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, SidebarComponent, HeaderComponent, FormsModule],
  templateUrl: './add-van.component.html',
  styleUrl: './add-van.component.css'
})
export class AddVanComponent {
  vanForm: FormGroup;
  showSuccess = false;
  startTime: string = '';
  endTime: string = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.vanForm = this.fb.group({
      vanName: ['', Validators.required],
      driverName: [''],
      vanNumber: [''],
    });
  }

  onSubmit() {
    this.showSuccess = true;
    if (this.vanForm.valid) {
      // Handle form submission (e.g., send to API)
      console.log('Customer Data:', this.vanForm.value);
      this.showSuccess = true;
    } else {
      this.vanForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.vanForm.reset();
  }

  addAnotherVan() {
    this.showSuccess = false;
    this.vanForm.reset();
  }

  goToVansList() {
    this.router.navigate(['/van']);
  }
}
