import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TransferService } from 'src/app/services/transfer.service';

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
  displayedColumns: string[] = ['productName', 'skuCode', "variantName", 'quantity'];
  dataSource = new MatTableDataSource<TransferDetail>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  transferDetail: TransferDetail[] = [];
  transferAllDetail: any;
  inventoryCounts: any = {};

  constructor(private transferService: TransferService) { }

  ngOnInit(): void {
    const transfer = history.state.transfer;
    this.transferAllDetail = transfer;
    this.transferDetail = transfer.shippingInventory || [];
    
    this.dataSource.data = this.transferDetail;
    this.getInventoryCounts();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getInventoryCounts() {
    this.transferService.getInventoryCountsbyDriverId(this.transferAllDetail.driverId).subscribe((data: any) => {
      this.inventoryCounts = data || {};
      // Update transfer details with inventory counts
      this.updateTransferDetailsWithCounts();
    });
  }

  private updateTransferDetailsWithCounts() {
    this.transferDetail = this.transferDetail.map((detail: any) => {
      // Try to find matching inventory counts by variant name or SKU
      const variantKey = detail.variantName || detail.skuCode;
      const counts = this.inventoryCounts[variantKey] || {};
      const warehouseQuantity = this.inventoryCounts?.warehouseInventories?.filter((x: any) => x.productVariantId === detail.productVariantId)?.[0]?.quantity || 0;
      const vanQuantity = this.inventoryCounts?.vanInventories?.filter((x: any) => x.productVariantId === detail.productVariantId)?.[0]?.quantity || 0;
      return {
        ...detail,
        warehouseQuantity: warehouseQuantity,
        vanQuantity: vanQuantity
      };
    });
    
    // Update data source
    this.dataSource.data = this.transferDetail;
  }

  getTooltipText(transferDetail: TransferDetail): string {
    const warehouse = transferDetail.warehouseQuantity || 0;
    const van = transferDetail.vanQuantity || 0;
    return `📦 Warehouse: ${warehouse}\n🚐 Van: ${van}`;
  }

  getQuantityColorClass(transferDetail: TransferDetail): string {
    const quantity = parseInt(transferDetail.quantity) || 0;
    const warehouseQty = transferDetail.warehouseQuantity || 0;
    const vanQty = transferDetail.vanQuantity || 0;
    const totalAvailable = warehouseQty + vanQty;
    
    return quantity < totalAvailable ? 'quantity-sufficient' : 'quantity-insufficient';
  }
}

