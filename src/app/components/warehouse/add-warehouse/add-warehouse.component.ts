import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { WarehouseService } from '../../../services/warehouse.service';
import { CreateWarehouseRequest, UpdateWarehouseRequest, WarehouseResponse } from '../../../models/warehouse.model';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-add-warehouse',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule, SidebarComponent, HeaderComponent, FormsModule],
  templateUrl: './add-warehouse.component.html',
  styleUrl: './add-warehouse.component.css'
})
export class AddWarehouseComponent implements OnInit {
  warehouseForm: FormGroup;
  showSuccess = false;
  startTime: string = '';
  endTime: string = '';
  isSaving = false;
  
  isEditMode = false;
  warehouseId: number | null = null;
  currentWarehouse: WarehouseResponse | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute,
    private warehouseService: WarehouseService,
    private toastService: ToastService
  ) {
    this.warehouseForm = this.fb.group({
      warehouseName: ['', Validators.required],
      address1: ['', Validators.required],
      address2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.warehouseId = +params['id'];
        this.loadWarehouseForEdit();
      }
    });
  }

  loadWarehouseForEdit(): void {
    if (this.warehouseId) {
      this.isLoading = true;
      this.warehouseService.getWarehouseById(this.warehouseId).subscribe({
        next: (warehouse: WarehouseResponse) => {
          this.currentWarehouse = warehouse;
          this.populateForm(warehouse);
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading warehouse:', error);
          this.toastService.error('Error', 'Failed to load warehouse data. Please try again.');
          this.isLoading = false;
        }
      });
    }
  }

  populateForm(warehouse: WarehouseResponse): void {
    this.warehouseForm.patchValue({
      warehouseName: warehouse.name,
      address1: warehouse.addressLine1,
      address2: warehouse.addressLine2,
      city: warehouse.city,
      state: warehouse.state,
      zipCode: warehouse.zipCode
    });
  }

  onSubmit() {
    if (this.warehouseForm.valid) {
      this.isSaving = true;
      
      const formValue = this.warehouseForm.value;
      
      if (this.isEditMode && this.warehouseId) {
        // Update existing warehouse
        this.toastService.info('Saving', 'Updating warehouse...');
        
        const updateData: UpdateWarehouseRequest = {
          name: formValue.warehouseName,
          addressLine1: formValue.address1,
          addressLine2: formValue.address2 || '',
          city: formValue.city,
          state: formValue.state,
          zipCode: formValue.zipCode,
          isActive: this.currentWarehouse?.isActive ?? true
        };

        this.warehouseService.updateWarehouse(this.warehouseId, updateData).subscribe({
          next: (response) => {
            console.log('Warehouse updated successfully:', response);
            this.isSaving = false;
            this.toastService.success('Success', 'Warehouse has been updated successfully');
            this.showSuccess = true;
          },
          error: (error: any) => {
            console.error('Error updating warehouse:', error);
            const message = error.error?.message || 'Failed to update warehouse. Please try again.';
            this.toastService.error('Error', message);
            this.isSaving = false;
          }
        });
      } else {
        // Create new warehouse
        this.toastService.info('Saving', 'Creating warehouse...');
        
        const warehouseData: CreateWarehouseRequest = {
          name: formValue.warehouseName,
          addressLine1: formValue.address1,
          addressLine2: formValue.address2 || '',
          city: formValue.city,
          state: formValue.state,
          zipCode: formValue.zipCode
        };

        this.warehouseService.createWarehouse(warehouseData).subscribe({
          next: (response) => {
            console.log('Warehouse created successfully:', response);
            this.isSaving = false;
            this.toastService.success('Success', 'Warehouse has been created successfully');
            this.showSuccess = true;
          },
          error: (error: any) => {
            console.error('Error creating warehouse:', error);
            const message = error.error?.message || 'Failed to create warehouse. Please try again.';
            this.toastService.error('Error', message);
            this.isSaving = false;
          }
        });
      }
    } else {
      this.warehouseForm.markAllAsTouched();
    }
  }

  onCancel() {
    if (this.isEditMode) {
      this.router.navigate(['/warehouse']);
      return;
    }
    this.warehouseForm.reset();
  }

  addAnotherWarehouse() {
    this.showSuccess = false;
    this.warehouseForm.reset();
  }

  goToWarehousesList() {
    this.router.navigate(['/warehouse']);
  }
}

