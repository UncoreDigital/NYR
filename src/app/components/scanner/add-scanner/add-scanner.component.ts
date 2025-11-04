import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastService } from 'src/app/services/toast.service';
import { ScannerService } from '../../../services/scanner.service';
import { LocationService } from '../../../services/location.service';
import { ScannerResponse, CreateScannerRequest, UpdateScannerRequest } from '../../../models/scanner.model';
import { LocationResponse } from '../../../models/location.model';

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
  locations: LocationResponse[] = [];
  selectedLocation: LocationResponse | null = null;
  showLocationDropdown = false;
  locationSearchTerm = '';
  isLoadingLocations = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private scannerService: ScannerService,
    private locationService: LocationService
  ) {
    this.scannerForm = this.fb.group({
      scannerName: ['', Validators.required],
      location: ['', Validators.required],
      scannerId: ['', Validators.required],
      scannerPin: ['0000'],
      scannerUrl: ['']
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.scannerId = +params['id'];
        // Load locations first, then load scanner data
        this.loadLocations(() => {
          this.loadScannerForEdit();
        });
      } else {
        // In create mode, disable the PIN field and set default value
        this.scannerForm.get('scannerPin')?.disable();
        this.loadLocations();
      }
    });
  }

  loadScannerForEdit(): void {
    if (this.scannerId) {
      this.isLoading = true;
      
      this.scannerService.getScannerById(this.scannerId).subscribe({
        next: (scanner: ScannerResponse) => {
          this.populateForm(scanner);
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading scanner:', error);
          this.toastService.error('Error', 'Failed to load scanner data. Please try again.');
          this.isLoading = false;
          this.router.navigate(['/scanner']);
        }
      });
    }
  }

  populateForm(scanner: ScannerResponse): void {
    // Enable PIN field in edit mode
    this.scannerForm.get('scannerPin')?.enable();
    
    // Find and select the location
    const location = this.locations.find(loc => loc.id === scanner.locationId);
    if (location) {
      this.selectedLocation = location;
      this.locationSearchTerm = location.locationName;
    }
    
    this.scannerForm.patchValue({
      scannerId: scanner.scannerId,
      scannerName: scanner.scannerName,
      location: scanner.locationId,
      scannerPin: scanner.scannerPIN || '0000',
    });
  }

  onSubmit() {
    if (this.scannerForm.valid && !this.isSaving) {
      this.isSaving = true;

      // Get raw value to include disabled fields
      const formValue = this.scannerForm.getRawValue();
      
      // Ensure PIN is included (default to "0000" if not set)
      if (!formValue.scannerPin) {
        formValue.scannerPin = '0000';
      }
      
      if (this.isEditMode && this.scannerId) {
        // Update existing scanner
        this.toastService.info('Saving', 'Updating scanner...');
        
        const updateData: UpdateScannerRequest = {
          scannerId: formValue.scannerId,
          scannerName: formValue.scannerName,
          scannerPIN: formValue.scannerPin,
          locationId: formValue.location,
          isActive: true
        };

        this.scannerService.updateScanner(this.scannerId, updateData).subscribe({
          next: (response: ScannerResponse) => {
            console.log('Scanner updated successfully:', response);
            this.isSaving = false;
            this.toastService.success('Success', 'Scanner has been updated successfully');
            this.showSuccess = true;
          },
          error: (error: any) => {
            console.error('Error updating scanner:', error);
            const message = error.error?.message || 'Failed to update scanner. Please try again.';
            this.toastService.error('Error', message);
            this.isSaving = false;
          }
        });
      } else {
        // Create new scanner
        this.toastService.info('Saving', 'Creating scanner...');
        
        const createData: CreateScannerRequest = {
          scannerId: formValue.scannerId,
          scannerName: formValue.scannerName,
          scannerPIN: formValue.scannerPin,
          locationId: formValue.location
        };

        this.scannerService.createScanner(createData).subscribe({
          next: (response: ScannerResponse) => {
            console.log('Scanner created successfully:', response);
            this.isSaving = false;
            this.toastService.success('Success', 'Scanner has been created successfully');
            this.showSuccess = true;
          },
          error: (error: any) => {
            console.error('Error creating scanner:', error);
            const message = error.error?.message || 'Failed to create scanner. Please try again.';
            this.toastService.error('Error', message);
            this.isSaving = false;
          }
        });
      }
    } else {
      this.scannerForm.markAllAsTouched();
      if (this.scannerForm.invalid) {
        this.toastService.warning('Validation Error', 'Please fill in all required fields.');
      }
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
  loadLocations(callback?: () => void): void {
    this.isLoadingLocations = true;
    this.locationService.getLocations().subscribe({
      next: (locations: LocationResponse[]) => {
        this.locations = locations;
        this.isLoadingLocations = false;
        if (callback) {
          callback();
        }
      },
      error: (error: any) => {
        console.error('Error loading locations:', error);
        this.toastService.error('Error', 'Failed to load locations. Please try again.');
        this.isLoadingLocations = false;
        if (callback) {
          callback();
        }
      }
    });
  }

  selectLocation(location: LocationResponse): void {
    this.selectedLocation = location;
    this.locationSearchTerm = location.locationName;
    this.showLocationDropdown = false;
    this.scannerForm.patchValue({ location: location.id });
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

  getFilteredLocations(): LocationResponse[] {
    if (!this.locationSearchTerm) {
      return this.locations;
    }
    return this.locations.filter(location =>
      location.locationName.toLowerCase().includes(this.locationSearchTerm.toLowerCase()) ||
      (location.addressLine1 && location.addressLine1.toLowerCase().includes(this.locationSearchTerm.toLowerCase())) ||
      (location.city && location.city.toLowerCase().includes(this.locationSearchTerm.toLowerCase()))
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