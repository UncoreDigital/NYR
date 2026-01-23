import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { ProductApiModel } from '../../models/product.model';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

export interface ProductDisplay {
  id: number;
  category: string;
  productName: string;
  description: string;
  lastUpdated: string;
}

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent implements OnInit {
  displayedColumns: string[] = ['category', 'productName', 'description', 'lastUpdated', 'actions'];
  products: ProductDisplay[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isLoading = false;
  isDeleting = false;
  deletingProductId: number | null = null;
  pageSizeOptions: number[] = [25, 50, 75, 100];

  // Pagination state
  pageIndex: number = 0;
  pageSize: number = 25;
  totalCount: number = 0;
  sortBy: string = 'productName';
  sortOrder: 'asc' | 'desc' = 'asc';
  searchTerm: string = '';

  // Debounce subject for search
  private searchSubject = new Subject<string>();

  constructor(
    private router: Router,
    private productService: ProductService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {
    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.pageIndex = 0;
      this.fetchProducts();
    });
  }

  ngOnInit(): void {
    this.fetchProducts();
  }
  fetchProducts(): void {
    this.isLoading = true;
    const params = {
      pageNumber: this.pageIndex + 1, // Backend uses 1-based indexing
      pageSize: this.pageSize,
      sortBy: this.mapColumnToSortField(this.sortBy),
      sortOrder: this.sortOrder,
      search: this.searchTerm || undefined
    };

    this.productService.getProductsPaged(params).subscribe({
      next: (result) => {
        this.products = result.data.map(p => ({
          id: p.id,
          category: p.categoryName,
          productName: p.name,
          description: p.variants && p.variants.length > 0 ? p.variants[0].description : '',
          lastUpdated: this.formatDate(p.createdAt)
        }));
        this.totalCount = result.totalCount;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load products', error);
        this.toastService.error('Error', 'Failed to load products');
        this.isLoading = false;
      }
    });
  }

  private mapColumnToSortField(column: string): string {
    const columnMap: { [key: string]: string } = {
      'productName': 'name',
      'category': 'categoryName',
      'lastUpdated': 'createdAt'
    };
    return columnMap[column] || 'name';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue.trim());
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchProducts();
  }

  onSortChange(column: string) {
    if (this.sortBy === column) {
      // Toggle sort order if same column
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, default to ascending
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.pageIndex = 0;
    this.fetchProducts();
  }

  addProduct() {
    this.router.navigate(['/product/add']);
  }

  viewProduct(product: ProductDisplay) {
    // For now, we'll use edit functionality as view
    // In a real app, you might have a separate view component
    this.editProduct(product);
  }

  editProduct(product: ProductDisplay) {
    this.router.navigate(['/product/edit', product.id]);
  }

  deleteProduct(product: ProductDisplay) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Product',
        message: `Are you sure you want to delete product "${product.productName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performDelete(product);
      }
    });
  }

  private performDelete(product: ProductDisplay): void {
    this.isDeleting = true;
    this.deletingProductId = product.id;

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.deletingProductId = null;
        this.toastService.success('Success', 'Product has been deleted successfully');
        this.fetchProducts(); // Refresh the list
      },
      error: (error) => {
        this.isDeleting = false;
        this.deletingProductId = null;
        console.error('Failed to delete product', error);
        const message = error?.error?.message || 'Failed to delete product. Please try again.';
        this.toastService.error('Error', message);
      }
    });
  }
}
