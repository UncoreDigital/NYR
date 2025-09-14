import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

export interface TransferDetail {
  productName: string;
  skuCode: string;
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
  displayedColumns: string[] = ['productName', 'skuCode', 'size', 'side', 'colour', 'quantity'];
  dataSource = new MatTableDataSource<TransferDetail>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  transferDetail: TransferDetail[] = [
    { productName: 'Nike Air Max 270', skuCode: 'NK-AM270', size: '10', side: 'Left', colour: 'Black', quantity: '50' },
    { productName: 'Nike Air Max 270', skuCode: 'NK-AM270', size: '10', side: 'Right', colour: 'Black', quantity: '50' },
    { productName: 'Nike Air Max 270', skuCode: 'NK-AM270', size: '9', side: 'Left', colour: 'White', quantity: '30' },
    { productName: 'Nike Air Max 270', skuCode: 'NK-AM270', size: '9', side: 'Right', colour: 'White', quantity: '30' },
    { productName: 'Adidas Ultraboost 21', skuCode: 'AD-UB21', size: '8', side: 'Left', colour: 'Blue', quantity: '20' },
    { productName: 'Adidas Ultraboost 21', skuCode: 'AD-UB21', size: '8', side: 'Right', colour: 'Blue', quantity: '20' },
    { productName: 'Adidas Ultraboost 21', skuCode: 'AD-UB21', size: '7', side: 'Left', colour: 'Red', quantity: '15' },
    { productName: 'Adidas Ultraboost 21', skuCode: 'AD-UB21', size: '7', side: 'Right', colour: 'Red', quantity: '15' },
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
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

