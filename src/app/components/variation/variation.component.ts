import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { VariationService } from '../../services/variation.service';
import { Variation as VariationApiModel } from '../../models/variation.model';
import { computePageSizeOptions } from 'src/app/utils/paginator-utils';

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
  dataSource = new MatTableDataSource<Variation>();

  isLoading = false;
  errorMessage = '';
  variations: Variation[] = [];
  deletingVariationId: number | null = null;

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
    private toastService: ToastService,
    private dialog: MatDialog,
    private variationService: VariationService
  ) { }

  ngOnInit(): void {
    this.loadVariations();
  }

  loadVariations(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.variationService.getVariations().subscribe({
      next: (variations: VariationApiModel[]) => {
        const mapped: Variation[] = variations.map(v => ({
          id: v.id,
          variationName: v.name,
          variationType: v.valueType
        }));
        this.variations = mapped;
        this.dataSource.data = this.variations;
        const computedOptions = computePageSizeOptions(this.dataSource.data.length);
        this.pageSizeOptions = computedOptions.length ? computedOptions : [25];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load variations', error);
        this.toastService.error('Error', 'Failed to load variations');
        this.isLoading = false;
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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

