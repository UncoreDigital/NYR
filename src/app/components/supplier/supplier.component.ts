import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SupplierService } from '../../services/supplier.service';
import { SupplierApiModel } from '../../models/supplier.model';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

export interface Supplier {
  id: number;
  supplierName: string;
  phoneNumber: string;
  status: string;
  email: string;
}

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrl: './supplier.component.css'
})
export class SupplierComponent implements OnInit {
  displayedColumns: string[] = ['supplierName', 'phoneNumber', 'email', 'status', 'actions'];
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  isLoading = false;
  selectedStatus = '';
  selectedSupplierName = '';
  pageSizeOptions: number[] = [25, 50, 75, 100];

  // Pagination state
  pageIndex: number = 0;
  pageSize: number = 25;
  totalCount: number = 0;
  sortBy: string = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';
  searchTerm: string = '';

  // Debounce subject for search
  private searchSubject = new Subject<string>();

  constructor(
    private router: Router,
    private supplierService: SupplierService,
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
      this.fetchSuppliers();
    });
  }

  ngOnInit(): void {
    this.fetchSuppliers();
  }

  fetchSuppliers(): void {
    this.isLoading = true;
    const params = {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      sortBy: this.mapColumnToSortField(this.sortBy),
      sortOrder: this.sortOrder,
      search: this.searchTerm || undefined
    };

    this.supplierService.getSuppliersPaged(params).subscribe({
      next: (result) => {
        const mapped: Supplier[] = result.data.map(s => ({
          id: s.id,
          supplierName: s.name,
          phoneNumber: s.phoneNumber,
          email: s.email,
          status: s.isActive ? 'Active' : 'Inactive'
        }));
        this.suppliers = mapped;
        this.applyFilters();
        this.totalCount = result.totalCount;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load suppliers', error);
        this.toastService.error('Error', 'Failed to load suppliers');
        this.isLoading = false;
      }
    });
  }

  private mapColumnToSortField(column: string): string {
    const columnMap: { [key: string]: string } = {
      'supplierName': 'name',
      'phoneNumber': 'phoneNumber',
      'email': 'email',
      'status': 'isActive'
    };
    return columnMap[column] || 'name';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue.trim());
  }

  applyFilters() {
    let filtered = [...this.suppliers];

    // Apply supplier name filter (client-side)
    if (this.selectedSupplierName) {
      filtered = filtered.filter(supplier => 
        supplier.supplierName === this.selectedSupplierName
      );
    }

    // Apply status filter (client-side)
    if (this.selectedStatus) {
      filtered = filtered.filter(supplier => 
        supplier.status.toLowerCase() === this.selectedStatus.toLowerCase()
      );
    }

    this.filteredSuppliers = filtered;
  }

  onSupplierNameFilterChange() {
    this.applyFilters();
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  getUniqueSupplierNames(): string[] {
    return [...new Set(this.suppliers.map(supplier => supplier.supplierName))].sort();
  }

  resetFilters() {
    this.selectedStatus = '';
    this.selectedSupplierName = '';
    this.searchTerm = '';
    this.pageIndex = 0;
    this.fetchSuppliers();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchSuppliers();
  }

  onSortChange(column: string) {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.pageIndex = 0;
    this.fetchSuppliers();
  }

  addSupplier() {
    this.router.navigate(['/supplier/add']);
  }

  viewSupplier(supplier: Supplier) {
    // placeholder for view action
  }

  editSupplier(supplier: Supplier) {
    this.router.navigate(['/supplier/edit', supplier.id]);
  }

  deleteSupplier(supplier: Supplier) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Supplier',
        message: `Are you sure you want to delete supplier "${supplier.supplierName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performDelete(supplier);
      }
    });
  }

  private performDelete(supplier: Supplier): void {
    this.supplierService.deleteSupplier(supplier.id).subscribe({
      next: () => {
        this.toastService.success('Success', 'Supplier has been deleted successfully');
        this.fetchSuppliers(); // Refresh the list
      },
      error: (error) => {
        console.error('Failed to delete supplier', error);
        const message = error?.error?.message || 'Failed to delete supplier. Please try again.';
        this.toastService.error('Error', message);
      }
    });
  }
}
