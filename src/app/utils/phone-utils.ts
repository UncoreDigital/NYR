import { FormGroup } from '@angular/forms';

export function sanitizePhone(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value || '');
  return str.replace(/\D/g, '').slice(0, 10);
}

export function handlePhoneInput(form: FormGroup, controlName: string, event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input) return;
  const digits = input.value.replace(/\D/g, '').slice(0, 10);
  const control = form.get(controlName);
  if (control) {
    control.setValue(digits, { emitEvent: false });
  }
  input.value = digits;
}
