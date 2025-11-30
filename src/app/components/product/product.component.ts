import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ProductApiModel } from '../../models/product.model';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { computePageSizeOptions } from 'src/app/utils/paginator-utils';

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
  dataSource = new MatTableDataSource<ProductDisplay>();

  private _paginator!: MatPaginator;
  private _sort!: MatSort;

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator) {
      this._paginator = paginator;
      this.dataSource.paginator = this._paginator;
    }
  }

  @ViewChild(MatSort) set sort(sort: MatSort) {
    if (sort) {
      this._sort = sort;
      this.dataSource.sort = this._sort;
    }
  }

  isLoading = false;
  isDeleting = false;
  deletingProductId: number | null = null;
  pageSizeOptions: number[] = [25, 50, 75, 100];

  constructor(
    private router: Router,
    private productService: ProductService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.fetchProducts();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  fetchProducts(): void {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (products: ProductApiModel[]) => {
        const mapped: ProductDisplay[] = products.map(p => ({
          id: p.id,
          category: p.categoryName,
          productName: p.name,
          description: p.description,
          lastUpdated: this.formatDate(p.createdAt)
        }));
        this.dataSource.data = mapped;
        const computedOptions = computePageSizeOptions(this.dataSource.data.length);
        this.pageSizeOptions = computedOptions.length ? computedOptions : [25];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load products', error);
        this.toastService.error('Error', 'Failed to load products');
        this.isLoading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
