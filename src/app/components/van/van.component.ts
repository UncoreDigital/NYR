import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { VanService } from '../../services/van.service';
import { VanResponse } from '../../models/van.model';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

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
  vans: Van[] = [];

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
    private vanService: VanService,
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
      this.loadVans();
    });
  }

  ngOnInit(): void {
    this.loadVans();
  }

  loadVans(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const params = {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      sortBy: this.mapColumnToSortField(this.sortBy),
      sortOrder: this.sortOrder,
      search: this.searchTerm || undefined
    };

    this.vanService.getVansPaged(params).subscribe({
      next: (result) => {
        this.vans = this.mapApiResponseToVan(result.data);
        this.totalCount = result.totalCount;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading vans:', error);
        this.toastService.error('Error', 'Failed to load vans. Please try again.');
        this.isLoading = false;
      }
    });
  }

  private mapColumnToSortField(column: string): string {
    const columnMap: { [key: string]: string } = {
      'vanName': 'name',
      'vanNumber': 'vanNumber'
    };
    return columnMap[column] || 'name';
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue.trim());
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadVans();
  }

  onSortChange(column: string) {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.pageIndex = 0;
    this.loadVans();
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
