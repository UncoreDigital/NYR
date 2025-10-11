import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ProductApiModel } from '../../models/product.model';
import { ToastService } from '../../services/toast.service';
import { Product } from '../../models/product.model';

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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading = false;
  isDeleting = false;
  deletingProductId: number | null = null;

  constructor(
    private router: Router,
    private productService: ProductService,
    private toastService: ToastService
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
    const confirmed = confirm(`Are you sure you want to delete "${product.productName}"? This action cannot be undone.`);
    if (!confirmed) return;

    this.isDeleting = true;
    this.deletingProductId = product.id;

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.deletingProductId = null;
        this.toastService.success('Success', 'Product deleted successfully');
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
