import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transfer-van',
  templateUrl: './transfer-van.component.html',
  styleUrl: './transfer-van.component.css'
})
export class TransferVanComponent {
  vanForm: FormGroup;
  showSuccess = false;
  startTime: string = '';
  endTime: string = '';
  selectedTransferOption: string = 'manual';

  constructor(private fb: FormBuilder, private router: Router) {
    this.selectedTransferOption = 'manual';
    this.vanForm = this.fb.group({
      van: ['', Validators.required],
      product: [''],
      // image: [''],
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

  onTransferChange(event: any) {
    this.selectedTransferOption = event.target.value;
  }
}

