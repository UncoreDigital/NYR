import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { WarehouseService } from '../../services/warehouse.service';
import { WarehouseResponse } from '../../models/warehouse.model';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { computePageSizeOptions } from 'src/app/utils/paginator-utils';

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
  dataSource = new MatTableDataSource<Warehouse>();
  
  isLoading = false;
  errorMessage = '';
  warehouses: Warehouse[] = [];
  deletingWarehouseId: number | null = null;

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

  constructor(
    private router: Router,
    private warehouseService: WarehouseService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.warehouseService.getWarehouses().subscribe({
      next: (apiWarehouses: WarehouseResponse[]) => {
        this.warehouses = this.mapApiResponseToWarehouse(apiWarehouses);
        this.dataSource.data = this.warehouses;
        const computedOptions = computePageSizeOptions(this.dataSource.data.length);
        this.pageSizeOptions = computedOptions.length ? computedOptions : [25];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading warehouses:', error);
        this.toastService.error('Error', 'Failed to load warehouses. Please try again.');
        this.isLoading = false;
      }
    });
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

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
