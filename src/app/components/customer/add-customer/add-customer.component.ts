import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { HeaderComponent } from '../../header/header.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomerService } from '../../../services/customer.service';
import { CreateCustomerRequest, CustomerResponse } from '../../../models/customer.model';
import { sanitizePhone, handlePhoneInput } from 'src/app/utils/phone-utils';
import { sanitizeDigits, handleDigitsInput } from 'src/app/utils/phone-utils';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, SidebarComponent, HeaderComponent, RouterModule],
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.css']
})
export class AddCustomerComponent {
  customerForm: FormGroup;
  showSuccess = false;
  isSaving = false;
  isEditMode = false;
  customerId: number | null = null;
  showValidation = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private customerService: CustomerService,
    private toastService: ToastService
  ) {
    this.customerForm = this.fb.group({
      companyName: ['', Validators.required],
      dba: [''],
      accountNumber: [''],
      address1: [''],
      address2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
      contactName: ['', Validators.required],
      contactLastName: [''],
      jobTitle: [''],
      businessPhone: ['', Validators.pattern(/^\d{10}$/)],
      mobilePhone: ['', Validators.pattern(/^\d{10}$/)],
      faxNumber: ['', Validators.pattern(/^\d{10}$/)],
      email: ['', [Validators.required, Validators.email]],
      website: ['']
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.customerId = Number(idParam);
      this.loadCustomer(this.customerId);
    }
  }

  onPhoneInput(controlName: string, event: Event): void {
    handlePhoneInput(this.customerForm, controlName, event);
  }

  onDigitsInput(controlName: string, event: Event): void {
    handleDigitsInput(this.customerForm, controlName, event, 10);
  }

  private loadCustomer(id: number): void {
    this.isSaving = true; // reuse as loader
    this.customerService.getCustomerById(id).subscribe({
      next: (c: CustomerResponse) => {
        // Split contactName into first/last if possible (UI has two fields)
        const [firstName, ...rest] = (c.contactName || '').split(' ');
        const lastName = rest.join(' ').trim();
        this.customerForm.patchValue({
          companyName: c.companyName,
          dba: c.dba,
          accountNumber: c.accountNumber,
          address1: c.addressLine1,
          address2: c.addressLine2,
          city: c.city,
          state: c.state,
          zip: c.zipCode,
          contactName: firstName,
          contactLastName: lastName,
          jobTitle: c.jobTitle,
          businessPhone: c.businessPhone,
          mobilePhone: c.mobilePhone,
          faxNumber: c.faxNumber,
          email: c.email,
          website: c.website
        });
        this.isSaving = false;
      },
      error: (error) => {
        this.isSaving = false;
        this.toastService.error('Error', 'Failed to load customer');
        this.router.navigate(['/customer']);
      }
    });
  }

  onSubmit() {
    if (this.customerForm.invalid || this.isSaving) {
      this.showValidation = true;
      this.customerForm.markAllAsTouched();
      return;
    }

    const form = this.customerForm.value;

    const basePayload: CreateCustomerRequest = {
      companyName: form.companyName || '',
      dba: form.dba || '',
      accountNumber: form.accountNumber || '',
      addressLine1: form.address1 || '',
      addressLine2: form.address2 || '',
      city: form.city || '',
      state: form.state || '',
      zipCode: form.zip || '',
      contactName: [form.contactName, form.contactLastName].filter(Boolean).join(' ').trim(),
      jobTitle: form.jobTitle || '',
      businessPhone: sanitizePhone(form.businessPhone),
      mobilePhone: sanitizePhone(form.mobilePhone),
      faxNumber: sanitizePhone(form.faxNumber),
      email: form.email || '',
      website: form.website || ''
    };

    this.isSaving = true;
    if (this.isEditMode && this.customerId !== null) {
      const updatePayload: CustomerResponse = {
        id: this.customerId,
        ...basePayload,
        isActive: true,
        createdAt: new Date().toISOString()
      } as unknown as CustomerResponse;

      this.toastService.info('Saving', 'Updating customer...');
      this.customerService.updateCustomer(this.customerId, updatePayload).subscribe({
        next: () => {
          this.isSaving = false;
          this.showValidation = false;
          this.toastService.success('Success', 'Customer has been updated');
          this.router.navigate(['/customer']);
        },
        error: (error) => {
          this.isSaving = false;
          const message = error?.error?.message || 'Failed to update customer';
          this.toastService.error('Error', message);
        }
      });
    } else {
      this.toastService.info('Saving', 'Creating customer...');
      this.customerService.createCustomer(basePayload).subscribe({
        next: () => {
          this.isSaving = false;
          this.showSuccess = true;
          this.showValidation = false;
          this.toastService.success('Success', 'Customer has been created');
        },
        error: (error) => {
          this.isSaving = false;
          const message = error?.error?.message || 'Failed to create customer';
          this.toastService.error('Error', message);
        }
      });
    }
  }

  onCancel() {
    if (this.isEditMode) {
      this.router.navigate(['/customer']);
      return;
    }
    this.customerForm.reset();
    this.showValidation = false;
  }

  addAnotherCustomer() {
    this.showSuccess = false;
    this.customerForm.reset();
    this.showValidation = false;
  }

  goToCustomersList() {
    this.router.navigate(['/customer']);
  }
}