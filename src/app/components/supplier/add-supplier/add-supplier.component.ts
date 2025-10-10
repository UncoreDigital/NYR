import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { SupplierService } from '../../../services/supplier.service';
import { CreateSupplierRequest, UpdateSupplierRequest, SupplierApiModel } from '../../../models/supplier.model';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-add-supplier',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, SidebarComponent, HeaderComponent, FormsModule],
  templateUrl: './add-supplier.component.html',
  styleUrl: './add-supplier.component.css'
})
export class AddSupplierComponent {
  supplierForm: FormGroup;
  showSuccess = false;
  isSaving = false;
  isEditMode = false;
  supplierId: number | null = null;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute,
    private supplierService: SupplierService,
    private toastService: ToastService
  ) {
    this.supplierForm = this.fb.group({
      supplierName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      address: [''],
      contactPerson: ['']
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.supplierId = Number(idParam);
      this.loadSupplier(this.supplierId);
    }
  }

  private loadSupplier(id: number): void {
    this.isSaving = true; // reuse as loader
    this.supplierService.getSupplierById(id).subscribe({
      next: (supplier: SupplierApiModel) => {
        this.supplierForm.patchValue({
          supplierName: supplier.name,
          email: supplier.email,
          phoneNumber: supplier.phoneNumber,
          address: supplier.address,
          contactPerson: supplier.contactPerson
        });
        this.isSaving = false;
      },
      error: (error) => {
        this.isSaving = false;
        this.toastService.error('Error', 'Failed to load supplier');
        this.router.navigate(['/supplier']);
      }
    });
  }

  onSubmit() {
    if (this.supplierForm.invalid || this.isSaving) {
      this.supplierForm.markAllAsTouched();
      return;
    }

    const form = this.supplierForm.value;

    this.isSaving = true;
    if (this.isEditMode && this.supplierId !== null) {
      const updatePayload: UpdateSupplierRequest = {
        name: form.supplierName || '',
        email: form.email || '',
        phoneNumber: form.phoneNumber || '',
        address: form.address || '',
        contactPerson: form.contactPerson || '',
        isActive: true
      };

      this.toastService.info('Saving', 'Updating supplier...');
      this.supplierService.updateSupplier(this.supplierId, updatePayload).subscribe({
        next: () => {
          this.isSaving = false;
          this.toastService.success('Success', 'Supplier has been updated');
          this.router.navigate(['/supplier']);
        },
        error: (error) => {
          this.isSaving = false;
          const message = error?.error?.message || 'Failed to update supplier';
          this.toastService.error('Error', message);
        }
      });
    } else {
      const createPayload: CreateSupplierRequest = {
        name: form.supplierName || '',
        email: form.email || '',
        phoneNumber: form.phoneNumber || '',
        address: form.address || '',
        contactPerson: form.contactPerson || ''
      };

      this.toastService.info('Saving', 'Creating supplier...');
      this.supplierService.createSupplier(createPayload).subscribe({
        next: () => {
          this.isSaving = false;
          this.showSuccess = true;
          this.toastService.success('Success', 'Supplier has been created');
        },
        error: (error) => {
          this.isSaving = false;
          const message = error?.error?.message || 'Failed to create supplier';
          this.toastService.error('Error', message);
        }
      });
    }
  }

  onCancel() {
    if (this.isEditMode) {
      this.router.navigate(['/supplier']);
      return;
    }
    this.supplierForm.reset();
  }

  addAnotherSupplier() {
    this.showSuccess = false;
    this.supplierForm.reset();
  }

  goToSuppliersList() {
    this.router.navigate(['/supplier']);
  }
}
