import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';
import { environment } from 'environment';

@Component({
  selector: 'app-variant-image-upload',
  templateUrl: './variant-image-upload.component.html',
  styleUrls: ['./variant-image-upload.component.css']
})
export class VariantImageUploadComponent implements OnDestroy {
  @Input() variantId: string = '';
  @Input() currentImageUrl: string = '';
  @Input() disabled: boolean = false;
  
  @Output() imageUploaded = new EventEmitter<string>();
  @Output() imageRemoved = new EventEmitter<void>();
  @Output() uploadStarted = new EventEmitter<void>();
  @Output() uploadErrorOccurred = new EventEmitter<string>();

  imageFile: File | null = null;
  imagePreview: string | null = null;
  isUploading: boolean = false;
  uploadError: string | null = null;

  constructor(
    private productService: ProductService,
    private toastService: ToastService
  ) {}

  // Helper method to convert relative image URLs to full backend URLs
  private getFullImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it's a relative URL, prepend the backend server URL
    if (imageUrl.startsWith('/')) {
      const backendUrl = environment.apiUrl.replace('/api', ''); // Remove /api suffix
      return `${backendUrl}${imageUrl}`;
    }
    
    return imageUrl;
  }

  ngOnInit(): void {
    // Set initial preview if currentImageUrl is provided
    if (this.currentImageUrl) {
      this.imagePreview = this.getFullImageUrl(this.currentImageUrl);
    }
  }

  ngOnDestroy(): void {
    // Clean up blob URLs to prevent memory leaks
    if (this.imagePreview && this.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(this.imagePreview);
    }
  }

  onImageSelected(event: any): void {
    if (this.disabled) return;

    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.uploadError = 'Invalid file type. Please select JPEG, PNG, GIF, or WebP.';
      this.toastService.error('Invalid File Type', this.uploadError);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.uploadError = 'File too large. Maximum size is 5MB.';
      this.toastService.error('File Too Large', this.uploadError);
      return;
    }

    this.imageFile = file;
    this.uploadError = null;
    this.isUploading = true;
    this.uploadStarted.emit(); // Emit upload started event

    // Create preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      // Clean up previous blob URL
      if (this.imagePreview && this.imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(this.imagePreview);
      }
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);

    // Upload image to server
    this.productService.uploadImage(file).subscribe({
      next: (response: { imageUrl: string }) => {
        this.isUploading = false;
        this.uploadError = null;
        
        // Clean up blob URL and set the actual uploaded image URL
        if (this.imagePreview && this.imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(this.imagePreview);
        }
        this.imagePreview = this.getFullImageUrl(response.imageUrl);
        
        this.imageUploaded.emit(response.imageUrl);
        this.toastService.success('Success', 'Image uploaded successfully');
      },
      error: (error) => {
        this.isUploading = false;
        const errorMessage = 'Upload failed. Please try again.';
        this.uploadError = errorMessage;
        this.uploadErrorOccurred.emit(errorMessage); // Emit error event
        console.error('Failed to upload image', error);
        this.toastService.error('Error', 'Failed to upload image. Please try again.');
        
        // Reset image state on upload failure
        this.imageFile = null;
        if (this.imagePreview && this.imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(this.imagePreview);
        }
        this.imagePreview = this.getFullImageUrl(this.currentImageUrl) || null;
      }
    });
  }

  removeImage(): void {
    if (this.disabled) return;

    // Clean up blob URL
    if (this.imagePreview && this.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(this.imagePreview);
    }

    this.imageFile = null;
    this.imagePreview = null;
    this.uploadError = null;
    this.imageRemoved.emit();
    this.toastService.info('Info', 'Image removed');
  }

  clearError(): void {
    this.uploadError = null;
  }

  retryUpload(): void {
    if (this.imageFile) {
      this.uploadError = null;
      this.isUploading = true;
      this.uploadStarted.emit(); // Emit upload started event

      this.productService.uploadImage(this.imageFile).subscribe({
        next: (response: { imageUrl: string }) => {
          this.isUploading = false;
          this.uploadError = null;
          
          // Clean up blob URL and set the actual uploaded image URL
          if (this.imagePreview && this.imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(this.imagePreview);
          }
          this.imagePreview = this.getFullImageUrl(response.imageUrl);
          
          this.imageUploaded.emit(response.imageUrl);
          this.toastService.success('Success', 'Image uploaded successfully');
        },
        error: (error) => {
          this.isUploading = false;
          const errorMessage = 'Upload failed. Please try again.';
          this.uploadError = errorMessage;
          this.uploadErrorOccurred.emit(errorMessage);
          console.error('Failed to upload image', error);
          this.toastService.error('Error', 'Failed to upload image. Please try again.');
        }
      });
    }
  }
}