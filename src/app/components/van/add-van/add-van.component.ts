import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { VanService } from '../../../services/van.service';
import { CreateVanRequest, VanResponse, UpdateVanRequest } from '../../../models/van.model';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-add-van',
  templateUrl: './add-van.component.html',
  styleUrl: './add-van.component.css'
})
export class AddVanComponent implements OnInit {
  vanForm: FormGroup;
  showSuccess = false;
  startTime: string = '';
  endTime: string = '';
  
  isEditMode = false;
  vanId: number | null = null;
  currentVan: VanResponse | null = null;
  isSaving = false;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute,
    private vanService: VanService,
    private toastService: ToastService
  ) {
    this.vanForm = this.fb.group({
      vanName: ['', Validators.required],
      driverName: [''],
      vanNumber: [''],
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.vanId = +params['id'];
        this.loadVanForEdit();
      }
    });
  }

  loadVanForEdit(): void {
    if (this.vanId) {
      this.vanService.getVanById(this.vanId).subscribe({
        next: (van: VanResponse) => {
          this.currentVan = van;
          this.populateForm(van);
        },
        error: (error: any) => {
          console.error('Error loading van:', error);
          this.toastService.error('Error', 'Failed to load van data. Please try again.');
        }
      });
    }
  }

  populateForm(van: VanResponse): void {
    this.vanForm.patchValue({
      vanName: van.vanName,
      driverName: van.defaultDriverName,
      vanNumber: van.vanNumber
    });
  }

  onSubmit() {
    if (this.vanForm.valid) {
      this.isSaving = true;
      
      const formValue = this.vanForm.value;
      
      if (this.isEditMode && this.vanId) {
        // Update existing van
        this.toastService.info('Saving', 'Updating van...');
        
        const updateData: UpdateVanRequest = {
          defaultDriverName: formValue.driverName,
          vanName: formValue.vanName,
          vanNumber: formValue.vanNumber,
          isActive: this.currentVan?.isActive ?? true
        };

        this.vanService.updateVan(this.vanId, updateData).subscribe({
          next: (response) => {
            console.log('Van updated successfully:', response);
            this.isSaving = false;
            this.toastService.success('Success', 'Van has been updated successfully');
            this.showSuccess = true;
          },
          error: (error: any) => {
            console.error('Error updating van:', error);
            const message = error.error?.message || 'Failed to update van. Please try again.';
            this.toastService.error('Error', message);
            this.isSaving = false;
          }
        });
      } else {
        // Create new van
        this.toastService.info('Saving', 'Creating van...');
        
        const vanData: CreateVanRequest = {
          defaultDriverName: formValue.driverName,
          vanName: formValue.vanName,
          vanNumber: formValue.vanNumber
        };

        this.vanService.createVan(vanData).subscribe({
          next: (response) => {
            console.log('Van created successfully:', response);
            this.isSaving = false;
            this.toastService.success('Success', 'Van has been created successfully');
            this.showSuccess = true;
          },
          error: (error: any) => {
            console.error('Error creating van:', error);
            const message = error.error?.message || 'Failed to create van. Please try again.';
            this.toastService.error('Error', message);
            this.isSaving = false;
          }
        });
      }
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
