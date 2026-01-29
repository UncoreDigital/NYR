import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { TransferService } from 'src/app/services/transfer.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface TransferDetail {
  productName: string;
  skuCode: string;
  variantName: string;
  size: string;
  side: string;
  colour: string;
  quantity: string;
  warehouseQuantity?: number;
  vanQuantity?: number;
}

@Component({
  selector: 'app-transfer-detail',
  templateUrl: './transfer-detail.component.html',
  styleUrl: './transfer-detail.component.css'
})
export class TransferDetailComponent implements OnInit {
  displayedColumns: string[] = ['productName', 'skuCode', 'variantName', 'quantity'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  transferDetail: TransferDetail[] = [];
  transferAllDetail: any;
  inventoryCounts: any = {};

  pageSizeOptions: number[] = [5, 10, 20, 50];
  pageIndex = 0;
  pageSize = 10;
  sortBy = 'productName';
  sortOrder: 'asc' | 'desc' = 'asc';
  searchTerm = '';

  private searchSubject = new Subject<string>();

  constructor(private transferService: TransferService) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.pageIndex = 0;
    });
  }

  ngOnInit(): void {
    const transfer = history.state.transfer;
    this.transferAllDetail = transfer;
    this.transferDetail = transfer?.shippingInventory || [];
    if (transfer?.driverId != null) {
      this.getInventoryCounts();
    }
  }

  get filteredList(): TransferDetail[] {
    if (!this.searchTerm.trim()) return this.transferDetail;
    const term = this.searchTerm.trim().toLowerCase();
    return this.transferDetail.filter(d =>
      (d.productName || '').toLowerCase().includes(term) ||
      (d.skuCode || '').toLowerCase().includes(term) ||
      (d.variantName || '').toLowerCase().includes(term)
    );
  }

  get sortedList(): TransferDetail[] {
    const list = [...this.filteredList];
    const col = this.sortBy;
    const order = this.sortOrder === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      const aVal = (a as any)[col] ?? '';
      const bVal = (b as any)[col] ?? '';
      if (col === 'quantity') {
        const aNum = parseInt(String(aVal), 10) || 0;
        const bNum = parseInt(String(bVal), 10) || 0;
        return (aNum - bNum) * order;
      }
      return String(aVal).localeCompare(String(bVal), undefined, { numeric: true }) * order;
    });
    return list;
  }

  get paginatedItems(): TransferDetail[] {
    const start = this.pageIndex * this.pageSize;
    return this.sortedList.slice(start, start + this.pageSize);
  }

  get totalCount(): number {
    return this.sortedList.length;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue.trim());
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  onSortChange(column: string) {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.pageIndex = 0;
  }

  getInventoryCounts() {
    const driverId = this.transferAllDetail?.driverId;
    if (driverId == null) return;
    this.transferService.getInventoryCountsbyDriverId(driverId).subscribe((data: any) => {
      this.inventoryCounts = data || {};
      this.updateTransferDetailsWithCounts();
    });
  }

  private updateTransferDetailsWithCounts() {
    this.transferDetail = this.transferDetail.map((detail: any) => {
      const warehouseQuantity = this.inventoryCounts?.warehouseInventories?.filter((x: any) => x.productVariantId === detail.productVariantId)?.[0]?.quantity || 0;
      const vanQuantity = this.inventoryCounts?.vanInventories?.filter((x: any) => x.productVariantId === detail.productVariantId)?.[0]?.quantity || 0;
      return {
        ...detail,
        warehouseQuantity,
        vanQuantity
      };
    });
  }

  getTooltipText(transferDetail: TransferDetail): string {
    const warehouse = transferDetail.warehouseQuantity || 0;
    const van = transferDetail.vanQuantity || 0;
    return `📦 Warehouse: ${warehouse}\n🚐 Van: ${van}`;
  }

  getQuantityColorClass(transferDetail: TransferDetail): string {
    const quantity = parseInt(transferDetail.quantity, 10) || 0;
    const warehouseQty = transferDetail.warehouseQuantity || 0;
    const vanQty = transferDetail.vanQuantity || 0;
    const totalAvailable = warehouseQty + vanQty;
    return quantity < totalAvailable ? 'quantity-sufficient' : 'quantity-insufficient';
  }
}
