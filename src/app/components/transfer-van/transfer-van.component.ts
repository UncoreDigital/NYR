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
  showScanPopup: boolean = false;
  scannedItems: Array<{ index: number; productName: string; sku: string } > = [];
  manualAdjustmentCount: number = 1;
  scanReason: string = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.selectedTransferOption = 'manual';
    this.vanForm = this.fb.group({
      van: ['', Validators.required],
      product: [''],
      // image: [''],
    });

    // Seed example scanned items; replace with real scan results later
    this.scannedItems = [
      { index: 1, productName: 'Cervical Collar', sku: 'MD-001' },
      { index: 2, productName: 'Cervical Collar', sku: 'MD-001' },
      { index: 3, productName: 'Cervical Collar', sku: 'MD-001' }
    ];
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

  openScanPopup(): void {
    this.showScanPopup = true;
  }

  closeScanPopup(): void {
    this.showScanPopup = false;
    this.router.navigate(['/invans']);
  }

  removeScannedItem(index: number): void {
    this.scannedItems.splice(index, 1);
  }

  incrementAdjustment(): void {
    this.manualAdjustmentCount = this.manualAdjustmentCount + 1;
  }

  decrementAdjustment(): void {
    if (this.manualAdjustmentCount > 0) {
      this.manualAdjustmentCount = this.manualAdjustmentCount - 1;
    }
  }
}

