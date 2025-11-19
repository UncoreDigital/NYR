import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { VanService } from '../../services/van.service';
import { VanResponse } from '../../models/van.model';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { computePageSizeOptions } from 'src/app/utils/paginator-utils';

export interface Van {
  id: number;
  vanName: string;
  vanNumber: string;
  defaultDriverName: string;
  isActive: boolean;
}

@Component({
  selector: 'app-van',
  templateUrl: './van.component.html',
  styleUrl: './van.component.css'
})
export class VanComponent implements OnInit {
  displayedColumns: string[] = ['vanName', 'vanNumber', 'actions'];
  dataSource = new MatTableDataSource<Van>();
  
  isLoading = false;
  errorMessage = '';
  vans: Van[] = [];

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
    private vanService: VanService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadVans();
  }

  loadVans(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.vanService.getVans().subscribe({
      next: (apiVans: VanResponse[]) => {
        this.vans = this.mapApiResponseToVan(apiVans);
        this.dataSource.data = this.vans;
        const computedOptions = computePageSizeOptions(this.dataSource.data.length);
        this.pageSizeOptions = computedOptions.length ? computedOptions : [25];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading vans:', error);
        this.toastService.error('Error', 'Failed to load vans. Please try again.');
        this.isLoading = false;
      }
    });
  }

  private mapApiResponseToVan(apiVans: VanResponse[]): Van[] {
    return apiVans.map(apiVan => ({
      id: apiVan.id,
      vanName: apiVan.vanName,
      vanNumber: apiVan.vanNumber,
      defaultDriverName: apiVan.defaultDriverName,
      isActive: apiVan.isActive
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

  addVan() {
    console.log('Add Van clicked');
    this.router.navigate(['/van/add']);
  }

  viewVan(van: Van) {
    console.log('View Van:', van);
  }

  editVan(van: Van) {
    console.log('Edit Van:', van);
    this.router.navigate(['/van/edit', van.id]);
  }

  deleteVan(van: Van) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Van',
        message: `Are you sure you want to delete van "${van.vanName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performDelete(van);
      }
    });
  }

  private performDelete(van: Van): void {
    this.vanService.deleteVan(van.id).subscribe({
      next: () => {
        this.toastService.success('Success', 'Van has been deleted successfully');
        this.loadVans(); // Refresh the van list
      },
      error: (error: any) => {
        console.error('Error deleting van:', error);
        const message = error.error?.message || 'Failed to delete van. Please try again.';
        this.toastService.error('Error', message);
      }
    });
  }
}
