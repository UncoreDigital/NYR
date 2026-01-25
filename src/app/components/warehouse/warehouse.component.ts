import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { WarehouseService } from '../../services/warehouse.service';
import { WarehouseResponse } from '../../models/warehouse.model';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

export interface Warehouse {
  id: number;
  warehouseName: string;
  warehouseAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrl: './warehouse.component.css'
})
export class WarehouseComponent implements OnInit {
  displayedColumns: string[] = ['warehouseName', 'warehouseAddress', 'city', 'state', 'zipCode', 'actions'];
  warehouses: Warehouse[] = [];
  deletingWarehouseId: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  isLoading = false;
  errorMessage = '';
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
    private warehouseService: WarehouseService,
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
      this.loadWarehouses();
    });
  }

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const params = {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      sortBy: this.mapColumnToSortField(this.sortBy),
      sortOrder: this.sortOrder,
      search: this.searchTerm || undefined
    };

    this.warehouseService.getWarehousesPaged(params).subscribe({
      next: (result) => {
        this.warehouses = this.mapApiResponseToWarehouse(result.data);
        this.totalCount = result.totalCount;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading warehouses:', error);
        this.toastService.error('Error', 'Failed to load warehouses. Please try again.');
        this.isLoading = false;
      }
    });
  }

  private mapColumnToSortField(column: string): string {
    const columnMap: { [key: string]: string } = {
      'warehouseName': 'name',
      'warehouseAddress': 'addressLine1',
      'city': 'city',
      'state': 'state',
      'zipCode': 'zipCode'
    };
    return columnMap[column] || 'name';
  }

  private mapApiResponseToWarehouse(apiWarehouses: WarehouseResponse[]): Warehouse[] {
    return apiWarehouses.map(apiWarehouse => ({
      id: apiWarehouse.id,
      warehouseName: apiWarehouse.name,
      warehouseAddress: apiWarehouse.addressLine1 + (apiWarehouse.addressLine2 ? ', ' + apiWarehouse.addressLine2 : ''),
      city: apiWarehouse.city,
      state: apiWarehouse.state,
      zipCode: apiWarehouse.zipCode,
      country: 'USA' // Default country as per existing pattern
    }));
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue.trim());
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadWarehouses();
  }

  onSortChange(column: string) {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.pageIndex = 0;
    this.loadWarehouses();
  }

  addWarehouse() {
    console.log('Add Warehouse clicked');
    this.router.navigate(['/warehouse/add']);
  }

  viewWarehouse(warehouse: Warehouse) {
    console.log('View Warehouse:', warehouse);
  }

  editWarehouse(warehouse: Warehouse) {
    console.log('Edit Warehouse:', warehouse);
    this.router.navigate(['/warehouse/edit', warehouse.id]);
  }

  deleteWarehouse(warehouse: Warehouse) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Warehouse',
        message: `Are you sure you want to delete the warehouse "${warehouse.warehouseName}"? This action cannot be undone and will permanently delete all associated inventory.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performDelete(warehouse);
      }
    });
  }

  private performDelete(warehouse: Warehouse): void {
    this.deletingWarehouseId = warehouse.id;
    this.warehouseService.deleteWarehouse(warehouse.id).subscribe({
      next: () => {
        this.deletingWarehouseId = null;
        this.toastService.success('Success', 'Warehouse has been deleted successfully');
        this.loadWarehouses(); // Refresh the warehouse list
      },
      error: (error: any) => {
        this.deletingWarehouseId = null;
        console.error('Error deleting warehouse:', error);
        const message = error.error?.message || 'Failed to delete warehouse. Please try again.';
        this.toastService.error('Error', message);
      }
    });
  }
}
