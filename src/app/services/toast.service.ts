import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastSubject.asObservable();

  private showToast(type: ToastMessage['type'], title: string, message: string, duration: number = 5000): void {
    const toast: ToastMessage = {
      id: this.generateId(),
      type,
      title,
      message,
      duration
    };

    const currentToasts = this.toastSubject.value;
    this.toastSubject.next([...currentToasts, toast]);

    // Auto remove toast after duration
    setTimeout(() => {
      this.removeToast(toast.id);
    }, duration);
  }

  success(title: string, message: string, duration?: number): void {
    this.showToast('success', title, message, duration);
  }

  error(title: string, message: string, duration?: number): void {
    this.showToast('error', title, message, duration);
  }

  warning(title: string, message: string, duration?: number): void {
    this.showToast('warning', title, message, duration);
  }

  info(title: string, message: string, duration?: number): void {
    this.showToast('info', title, message, duration);
  }

  removeToast(id: string): void {
    const currentToasts = this.toastSubject.value;
    this.toastSubject.next(currentToasts.filter(toast => toast.id !== id));
  }

  clearAll(): void {
    this.toastSubject.next([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
