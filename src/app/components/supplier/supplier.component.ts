import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SupplierService } from '../../services/supplier.service';
import { SupplierApiModel } from '../../models/supplier.model';
import { ToastService } from '../../services/toast.service';

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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading = false;

  constructor(
    private router: Router,
    private supplierService: SupplierService,
    private toastService: ToastService
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
        this.dataSource.data = mapped;
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
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
    const confirmed = confirm(`Are you sure you want to delete "${supplier.supplierName}"? This action cannot be undone.`);
    if (!confirmed) return;

    this.supplierService.deleteSupplier(supplier.id).subscribe({
      next: () => {
        this.toastService.success('Success', 'Supplier deleted successfully');
        this.fetchSuppliers(); // Refresh the list
      },
      error: (error) => {
        console.error('Failed to delete supplier', error);
        const message = error?.error?.message || 'Failed to delete supplier';
        this.toastService.error('Error', message);
      }
    });
  }
}
