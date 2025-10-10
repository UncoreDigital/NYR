import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <div mat-dialog-content>
        <p>{{ data.message }}</p>
      </div>
      <div mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">{{ data.cancelText }}</button>
        <button mat-button color="warn" (click)="onConfirm()">{{ data.confirmText }}</button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 20px;
    }
    h2 {
      margin: 0 0 16px 0;
      color: #333;
    }
    p {
      margin: 0 0 20px 0;
      color: #666;
      line-height: 1.5;
    }
    mat-dialog-actions {
      margin: 0;
      padding: 0;
    }
    button {
      margin-left: 8px;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
