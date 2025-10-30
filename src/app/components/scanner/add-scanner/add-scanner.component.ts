import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WarehouseResponse } from 'src/app/models/warehouse.model';
import { ToastService } from 'src/app/services/toast.service';
import { Scanner } from '../scanner.component';

@Component({
  selector: 'app-add-scanner',
  templateUrl: './add-scanner.component.html',
  styleUrl: './add-scanner.component.css',
})
export class AddScannerComponent implements OnInit {
  scannerForm: FormGroup;
  showSuccess = false;
  startTime: string = '';
  endTime: string = '';
  isSaving = false;

  isEditMode = false;
  scannerId: number | null = null;
  isLoading = false;

  // Location dropdown properties
  locations: any[] = [];
  selectedLocation: any = null;
  showLocationDropdown = false;
  locationSearchTerm = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.scannerForm = this.fb.group({
      scannerName: ['', Validators.required],
      location: ['', Validators.required],
      scannerId: ['', Validators.required],
      scannerPin: ['0000'],
    });
  }

  ngOnInit(): void {
    this.loadLocations();
    
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.scannerId = +params['id'];
        this.loadScannerForEdit();
      } else {
        // In create mode, disable the PIN field and set default value
        this.scannerForm.get('scannerPin')?.disable();
      }
    });
  }

  loadScannerForEdit(): void {
    if (this.scannerId) {
      this.isLoading = true;
      
      // Simulate API call to load scanner data
      setTimeout(() => {
        // Mock scanner data for editing
        const mockScanner: Scanner = {
          scannerId: this.scannerId!,
          scannerName: `Scanner ${this.scannerId}`,
          location: 'Warehouse A'
        };
        
        this.populateForm(mockScanner);
        this.isLoading = false;
      }, 1000);
    }
  }

  populateForm(scanner: Scanner): void {
    // Enable PIN field in edit mode
    this.scannerForm.get('scannerPin')?.enable();
    
    this.scannerForm.patchValue({
      scannerId: scanner.scannerId,
      scannerName: scanner.scannerName,
      location: scanner.location,
      scannerPin: scanner.scannerPin || '0000',
    });
  }

  onSubmit() {
    if (this.scannerForm.valid) {
      this.isSaving = true;

      // Get raw value to include disabled fields
      const formValue = this.scannerForm.getRawValue();
      
      // Ensure PIN is included (default to "0000" if not set)
      if (!formValue.scannerPin) {
        formValue.scannerPin = '0000';
      }
      
      console.log('Form Submitted:', formValue);

      setTimeout(() => {
        this.isSaving = false;
        this.showSuccess = true;
      }, 1000);
    } else {
      this.scannerForm.markAllAsTouched();
    }
  }

  onCancel() {
    if (this.isEditMode) {
      this.router.navigate(['/scanner']);
      return;
    }
    this.scannerForm.reset();
  }

  addAnotherScanner() {
    this.showSuccess = false;
    this.scannerForm.reset();
  }

  goToScannersList() {
    this.router.navigate(['/scanner']);
  }

  // Location dropdown methods
  loadLocations(): void {
    // Simulate API call to load locations
    setTimeout(() => {
      this.locations = [
        { value: 1, name: 'Warehouse A', address: '123 Industrial St, City' },
        { value: 2, name: 'Warehouse B', address: '456 Storage Ave, City' },
        { value: 3, name: 'Distribution Center', address: '789 Logistics Blvd, City' },
        { value: 4, name: 'Store Location 1', address: '321 Retail St, City' },
        { value: 5, name: 'Store Location 2', address: '654 Commerce Dr, City' }
      ];
    }, 100);
  }

  selectLocation(location: any): void {
    this.selectedLocation = location;
    this.locationSearchTerm = location.name;
    this.showLocationDropdown = false;
    this.scannerForm.patchValue({ location: location.value });
  }

  clearLocation(): void {
    this.selectedLocation = null;
    this.locationSearchTerm = '';
    this.scannerForm.patchValue({ location: '' });
  }

  onLocationSearchInput(event: any): void {
    this.locationSearchTerm = event.target.value;
    if (!this.locationSearchTerm) {
      this.selectedLocation = null;
      this.scannerForm.patchValue({ location: '' });
    }
  }

  filterLocations(): void {
    // This method is called from the template to trigger change detection
  }

  getFilteredLocations(): any[] {
    if (!this.locationSearchTerm) {
      return this.locations;
    }
    return this.locations.filter(location =>
      location.name.toLowerCase().includes(this.locationSearchTerm.toLowerCase()) ||
      (location.address && location.address.toLowerCase().includes(this.locationSearchTerm.toLowerCase()))
    );
  }

  hideLocationDropdown(): void {
    setTimeout(() => {
      this.showLocationDropdown = false;
    }, 200);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.custom-select-container');
    if (!dropdown) {
      this.showLocationDropdown = false;
    }
  }
}