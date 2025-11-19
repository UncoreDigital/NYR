import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SupplierService } from '../../services/supplier.service';
import { SupplierApiModel } from '../../models/supplier.model';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { computePageSizeOptions } from 'src/app/utils/paginator-utils';

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
  dataSource = new MatTableDataSource<Supplier>();

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
  pageSizeOptions: number[] = [25, 50, 75, 100];

  isLoading = false;
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  selectedStatus = '';
  selectedSupplierName = '';
  searchTerm = '';

  constructor(
    private router: Router,
    private supplierService: SupplierService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.fetchSuppliers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  fetchSuppliers(): void {
    this.isLoading = true;
    this.supplierService.getSuppliers().subscribe({
      next: (suppliers: SupplierApiModel[]) => {
        const mapped: Supplier[] = suppliers.map(s => ({
          id: s.id,
          supplierName: s.name,
          phoneNumber: s.phoneNumber,
          email: s.email,
          status: s.isActive ? 'Active' : 'Inactive'
        }));
        this.suppliers = mapped;
        this.filteredSuppliers = [...this.suppliers];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load suppliers', error);
        this.toastService.error('Error', 'Failed to load suppliers');
        this.isLoading = false;
      }
    });
  }

  applyFilter(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.suppliers];

    // Apply supplier name filter
    if (this.selectedSupplierName) {
      filtered = filtered.filter(supplier => 
        supplier.supplierName === this.selectedSupplierName
      );
    }

    // Apply status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(supplier => 
        supplier.status.toLowerCase() === this.selectedStatus.toLowerCase()
      );
    }

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(supplier =>
        supplier.supplierName.toLowerCase().includes(searchLower) ||
        supplier.email.toLowerCase().includes(searchLower) ||
        supplier.phoneNumber.toLowerCase().includes(searchLower) ||
        supplier.status.toLowerCase().includes(searchLower)
      );
    }

    this.filteredSuppliers = filtered;
    this.dataSource.data = this.filteredSuppliers;
    const computedOptions = computePageSizeOptions(this.dataSource.data.length);
    this.pageSizeOptions = computedOptions.length ? computedOptions : [25];
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
    this.applyFilters();
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
