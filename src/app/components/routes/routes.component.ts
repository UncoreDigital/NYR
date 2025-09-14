import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

export interface Routes {
  driverName: string;
  totalStops: string;
  shippingDate: string;
  status: string;
}

@Component({
  selector: 'app-routes',
  templateUrl: './routes.component.html',
  styleUrl: './routes.component.css'
})
export class RoutesComponent implements OnInit {
  displayedColumns: string[] = ['driverName', 'totalStops', 'shippingDate', 'status', 'details'];
  dataSource = new MatTableDataSource<Routes>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  vans: Routes[] = [
    { driverName: 'John Doe', totalStops: '5', shippingDate: '2023-10-01', status: 'In Transit' },
    { driverName: 'Jane Smith', totalStops: '3', shippingDate: '2023-10-02', status: 'Delivered' },
    { driverName: 'Mike Johnson', totalStops: '4', shippingDate: '2023-10-03', status: 'Pending' },
    { driverName: 'Emily Davis', totalStops: '6', shippingDate: '2023-10-04', status: 'In Transit' },
    { driverName: 'David Wilson', totalStops: '2', shippingDate: '2023-10-05', status: 'Delivered' },
    { driverName: 'Sarah Brown', totalStops: '7', shippingDate: '2023-10-06', status: 'Pending' },
    { driverName: 'Chris Lee', totalStops: '5', shippingDate: '2023-10-07', status: 'In Transit' },
    { driverName: 'Anna White', totalStops: '4', shippingDate: '2023-10-08', status: 'Delivered' },
    { driverName: 'Tom Harris', totalStops: '3', shippingDate: '2023-10-09', status: 'Pending' },
    { driverName: 'Laura Martin', totalStops: '6', shippingDate: '2023-10-10', status: 'In Transit' },
    { driverName: 'James Clark', totalStops: '2', shippingDate: '2023-10-11', status: 'Delivered' },
    { driverName: 'Olivia Lewis', totalStops: '5', shippingDate: '2023-10-12', status: 'Pending' },
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.dataSource.data = this.vans;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  createRoute() {
    this.router.navigate(['/crate-route']);
  }

  viewMap(route: Routes) {
  }
}
