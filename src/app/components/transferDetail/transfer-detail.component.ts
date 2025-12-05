import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

export interface TransferDetail {
  productName: string;
  skuCode: string;
  variantName: string;
  size: string;
  side: string;
  colour: string;
  quantity: string;
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

  constructor() { }

  ngOnInit(): void {
    const transfer = history.state.transfer;
    this.transferDetail = transfer.shippingInventory || [];
    this.dataSource.data = this.transferDetail;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}

