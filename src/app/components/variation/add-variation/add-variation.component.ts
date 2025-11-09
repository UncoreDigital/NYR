import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { VariationService } from '../../../services/variation.service';
import { CreateVariationRequest, UpdateVariationRequest, Variation } from '../../../models/variation.model';

@Component({
  selector: 'app-add-variation',
  templateUrl: './add-variation.component.html',
  styleUrl: './add-variation.component.css'
})
export class AddVariationComponent implements OnInit {
  variationForm!: FormGroup;
  isLoading = false;
  selectedValueType: 'dropdown' | 'text' | '' = '';
  isSaving = false;
  isEditMode = false;
  variationId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private toastService: ToastService,
    private variationService: VariationService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.variationId = Number(idParam);
      this.loadVariation(this.variationId);
    }
  }

  private initializeForm(): void {
    this.variationForm = this.fb.group({
      variationName: ['', [Validators.required, Validators.minLength(2)]],
      valueType: ['dropdown', Validators.required],
      dropdownOptions: this.fb.array([this.createDropdownOption()]),
      textInputRequired: [false],
      textInputPlaceholder: [''],
      textInputValue: ['']
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

  private createDropdownOption(name: string = '', value: string = '', id?: number): FormGroup {
    return this.fb.group({
      id: [id || null],
      name: [name, Validators.required],
      value: [value, Validators.required],
      isActive: [true]
    });
  }

  private loadVariation(id: number): void {
    this.isLoading = true;
    this.variationService.getVariationById(id).subscribe({
      next: (variation: Variation) => {
        this.variationForm.patchValue({
          variationName: variation.name,
          valueType: variation.valueType
        });
        
        this.selectedValueType = variation.valueType === 'Dropdown' ? 'dropdown' : 'text';
        
        // Clear existing options
        while (this.dropdownOptions.length !== 0) {
          this.dropdownOptions.removeAt(0);
        }
        
        // Load options
        if (variation.valueType === 'Dropdown' && variation.options.length > 0) {
          variation.options.forEach(option => {
            this.dropdownOptions.push(this.createDropdownOption(option.name, option.value || '', option.id));
          });
        } else if (variation.valueType === 'TextInput' && variation.options.length > 0) {
          // For text input, load name and value from first option
          const firstOption = variation.options[0];
          this.variationForm.patchValue({
            textInputPlaceholder: firstOption.name,
            textInputValue: firstOption.value || ''
          });
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.error('Error', 'Failed to load variation');
        this.router.navigate(['/variation']);
      }
    });
  }

  get dropdownOptions(): FormArray {
    return this.variationForm.get('dropdownOptions') as FormArray;
  }

  addDropdownOption(): void {
    this.dropdownOptions.push(this.createDropdownOption('', ''));
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
    if (this.variationForm.invalid || this.isSaving) {
      this.markFormGroupTouched();
      return;
    }

    const formData = this.variationForm.value;
    this.isSaving = true;

    if (this.isEditMode && this.variationId !== null) {
      // Update existing variation
      const updatePayload: UpdateVariationRequest = {
        name: formData.variationName,
        valueType: this.selectedValueType === 'dropdown' ? 'Dropdown' : 'TextInput',
        isActive: true,
        options: this.selectedValueType === 'dropdown' 
          ? formData.dropdownOptions.map((opt: any) => ({
              id: opt.id || undefined,
              name: opt.name || opt.value,
              value: opt.value,
              isActive: opt.isActive !== false
            }))
          : [{
              name: formData.textInputPlaceholder || 'Value',
              value: formData.textInputValue || null,
              isActive: true
            }]
      };

      this.toastService.info('Saving', 'Updating variation...');
      this.variationService.updateVariation(this.variationId, updatePayload).subscribe({
        next: () => {
          this.isSaving = false;
          this.toastService.success('Success', 'Variation has been updated successfully');
          this.router.navigate(['/variation']);
        },
        error: (error) => {
          this.isSaving = false;
          const message = error?.error?.message || 'Failed to update variation';
          this.toastService.error('Error', message);
        }
      });
    } else {
      // Create new variation
      const createPayload: CreateVariationRequest = {
        name: formData.variationName,
        valueType: this.selectedValueType === 'dropdown' ? 'Dropdown' : 'TextInput',
        options: this.selectedValueType === 'dropdown'
          ? formData.dropdownOptions.map((opt: any) => ({
              name: opt.name || opt.value,
              value: opt.value
            }))
          : [{
              name: formData.textInputPlaceholder || 'Value',
              value: formData.textInputValue || null
            }]
      };

      this.toastService.info('Saving', 'Creating variation...');
      this.variationService.createVariation(createPayload).subscribe({
        next: () => {
          this.isSaving = false;
          this.toastService.success('Success', 'Variation has been created successfully');
          this.router.navigate(['/variation']);
        },
        error: (error) => {
          this.isSaving = false;
          const message = error?.error?.message || 'Failed to create variation';
          this.toastService.error('Error', message);
        }
      });
    }
  }

  onCancel(): void {
    if (this.isEditMode) {
      this.router.navigate(['/variation']);
      return;
    }
    this.variationForm.reset();
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
      this.dropdownOptions.push(this.createDropdownOption(optionValue, optionValue));
    });
  }
}
