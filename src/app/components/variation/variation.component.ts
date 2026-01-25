import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ToastService } from 'src/app/services/toast.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { VariationService } from '../../services/variation.service';
import { Variation as VariationApiModel } from '../../models/variation.model';

export interface Variation {
  id: number;
  variationName: string;
  variationType: string;
}


@Component({
  selector: 'app-variation',
  templateUrl: './variation.component.html',
  styleUrl: './variation.component.css'
})
export class VariationComponent implements OnInit {
  displayedColumns: string[] = ['variationName', 'variationType', 'actions'];
  variations: Variation[] = [];
  deletingVariationId: number | null = null;

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
    private toastService: ToastService,
    private dialog: MatDialog,
    private variationService: VariationService
  ) {
    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.pageIndex = 0;
      this.loadVariations();
    });
  }

  ngOnInit(): void {
    this.loadVariations();
  }

  loadVariations(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const params = {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      sortBy: this.mapColumnToSortField(this.sortBy),
      sortOrder: this.sortOrder,
      search: this.searchTerm || undefined
    };

    this.variationService.getVariationsPaged(params).subscribe({
      next: (result) => {
        const mapped: Variation[] = result.data.map(v => ({
          id: v.id,
          variationName: v.name,
          variationType: v.valueType
        }));
        this.variations = mapped;
        this.totalCount = result.totalCount;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load variations', error);
        this.toastService.error('Error', 'Failed to load variations');
        this.isLoading = false;
      }
    });
  }

  private mapColumnToSortField(column: string): string {
    const columnMap: { [key: string]: string } = {
      'variationName': 'name',
      'variationType': 'valueType'
    };
    return columnMap[column] || 'name';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue.trim());
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadVariations();
  }

  onSortChange(column: string) {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.pageIndex = 0;
    this.loadVariations();
  }

  addVariation() {
    console.log('Add Variation clicked');
    this.router.navigate(['/variation/add']);
  }

  viewVariation(variation: Variation) {
    console.log('View Variation:', variation);
  }

  editVariation(variation: Variation) {
    console.log('Edit Variation:', variation);
    this.router.navigate(['/variation/edit', variation.id]);
  }

  deleteVariation(variation: Variation) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Variation',
        message: `Are you sure you want to delete variation "${variation.variationName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performDelete(variation);
      }
    });
  }

  private performDelete(variation: Variation): void {
    this.deletingVariationId = variation.id;
    
    this.variationService.deleteVariation(variation.id).subscribe({
      next: () => {
        this.toastService.success('Success', 'Variation has been deleted successfully');
        this.deletingVariationId = null;
        this.loadVariations(); // Refresh the list
      },
      error: (error) => {
        console.error('Failed to delete variation', error);
        const message = error?.error?.message || 'Failed to delete variation. Please try again.';
        this.toastService.error('Error', message);
        this.deletingVariationId = null;
      }
    });
  }
}

