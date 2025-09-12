import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

export interface Transfers {
  locationName: string;
  customerName: string;
  deliveryDate: string;
  driver: string;
  status: string;
}

@Component({
  selector: 'app-transfers',
  templateUrl: './transfers.component.html',
  styleUrl: './transfers.component.css'
})
export class TransfersComponent implements OnInit {
  displayedColumns: string[] = ['locationName', 'customerName', 'deliveryDate', 'driver', 'status'];
  dataSource = new MatTableDataSource<Transfers>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  transfers: Transfers[] = [
    { locationName: 'Warehouse A', customerName: 'Alice Smith', deliveryDate: '2024-06-01', driver: 'Bob Johnson', status: 'In Transit' },
    { locationName: 'Warehouse B', customerName: 'Charlie Brown', deliveryDate: '2024-06-02', driver: 'David Wilson', status: 'Delivered' },
    { locationName: 'Warehouse C', customerName: 'Eve Davis', deliveryDate: '2024-06-03', driver: 'Frank Miller', status: 'Pending' },
    { locationName: 'Warehouse D', customerName: 'Grace Lee', deliveryDate: '2024-06-04', driver: 'Hank Garcia', status: 'In Transit' },
    { locationName: 'Warehouse E', customerName: 'Ivy Martinez', deliveryDate: '2024-06-05', driver: 'Jack Rodriguez', status: 'Delivered' },
    { locationName: 'Warehouse F', customerName: 'Kathy Hernandez', deliveryDate: '2024-06-06', driver: 'Larry Lopez', status: 'Pending' },
    { locationName: 'Warehouse G', customerName: 'Mona Gonzalez', deliveryDate: '2024-06-07', driver: 'Nina Wilson', status: 'In Transit' },
    { locationName: 'Warehouse H', customerName: 'Oscar Perez', deliveryDate: '2024-06-08', driver: 'Paul Clark', status: 'Delivered' },
    { locationName: 'Warehouse I', customerName: 'Quinn Lewis', deliveryDate: '2024-06-09', driver: 'Rita Walker', status: 'Pending' },
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.dataSource.data = this.transfers;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addTransfer() {
    console.log('Add Transfers clicked');
    this.router.navigate(['/transfers/add']);
  }

  viewTransfer(transfers: Transfers) {
    console.log('View Transfer:', transfers);
  }

  editTransfer(transfers: Transfers) {
    console.log('Edit Transfer:', transfers);
  }

  deleteTransfer(transfers: Transfers) {
    console.log('Delete Transfer:', transfers);
  }
}
