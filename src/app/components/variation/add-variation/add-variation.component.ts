import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-add-variation',
  templateUrl: './add-variation.component.html',
  styleUrl: './add-variation.component.css'
})
export class AddVariationComponent implements OnInit {
  variationForm!: FormGroup;
  isLoading = false;
  // Variation modal properties
  selectedValueType: 'dropdown' | 'text' | '' = '';

  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.variationForm = this.fb.group({
      variationName: ['', [Validators.required, Validators.minLength(2)]],
      valueType: ['dropdown', Validators.required],
      dropdownOptions: this.fb.array([this.createDropdownOption()]),
      textInputRequired: [false],
      textInputPlaceholder: [''],
      textInputMaxLength: [null]
    });

    // Watch for value type changes
    this.variationForm.get('valueType')?.valueChanges.subscribe(value => {
      this.selectedValueType = value;
      if (value === 'dropdown' && this.dropdownOptions.length === 0) {
        this.addDropdownOption();
      }
    });

    // Initialize selectedValueType
    this.selectedValueType = 'dropdown';
  }

  private createDropdownOption(): FormGroup {
    return this.fb.group({
      value: ['', Validators.required]
    });
  }

  get dropdownOptions(): FormArray {
    return this.variationForm.get('dropdownOptions') as FormArray;
  }

  addDropdownOption(): void {
    this.dropdownOptions.push(this.createDropdownOption());
  }

  removeDropdownOption(index: number): void {
    if (this.dropdownOptions.length > 1) {
      this.dropdownOptions.removeAt(index);
    }
  }

  selectValueType(type: 'dropdown' | 'text'): void {
    this.selectedValueType = type;
    this.variationForm.patchValue({ valueType: type });
  }

  onSubmit(): void {
    if (this.variationForm.valid) {
      this.isSaving = true;

      const formData = this.variationForm.value;
      const variationData = {
        variationName: formData.variationName,
        valueType: formData.valueType,
        options: formData.valueType === 'dropdown' ? formData.dropdownOptions.map((opt: any) => opt.value) : [],
        textConfig: formData.valueType === 'text' ? {
          required: formData.textInputRequired,
          placeholder: formData.textInputPlaceholder,
          maxLength: formData.textInputMaxLength
        } : null
      };

      console.log('Creating variation:', variationData);

      // Simulate API call
      setTimeout(() => {
        this.isSaving = false;
        this.toastService.success('Success', 'Variation created successfully!');
        this.router.navigate(['/variation']);
      }, 1000);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/variation']);
  }

  goBack(): void {
    this.location.back();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.variationForm.controls).forEach(key => {
      const control = this.variationForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          arrayControl.markAsTouched();
        });
      }
    });
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.variationForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.variationForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  applyTemplate(templateType: string) {
    // Clear existing options
    while (this.dropdownOptions.length !== 0) {
      this.dropdownOptions.removeAt(0);
    }

    let templateOptions: string[] = [];
    
    switch (templateType) {
      case 'size':
        templateOptions = ['XS', 'S', 'M', 'L', 'XL'];
        break;
      case 'color':
        templateOptions = ['Red', 'Blue', 'Green', 'Black', 'White'];
        break;
      case 'material':
        templateOptions = ['Cotton', 'Polyester', 'Silk', 'Wool'];
        break;
    }

    // Add new options to FormArray
    templateOptions.forEach(optionValue => {
      const optionGroup = this.fb.group({
        value: [optionValue, Validators.required]
      });
      this.dropdownOptions.push(optionGroup);
    });
  }


}
