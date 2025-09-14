import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Routes, Router } from '@angular/router';

export interface CreateRoutes {
  id: number;
  locationName: string;
  locationAddress: string;
  driverName: string;
  status: string;
}

@Component({
  selector: 'app-create-route',
  templateUrl: './create-route.component.html',
  styleUrl: './create-route.component.css'
})
export class CreateRouteComponent implements OnInit {
  displayedColumns: string[] = ['locationName', 'locationAddress', 'driverName', 'status'];
  dataSource = new MatTableDataSource<CreateRoutes>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  createRoutes: CreateRoutes[] = [
    { id: 1, locationName: 'Location A', locationAddress: '123 Main St, Cityville', driverName: 'John Doe', status: 'pending' },
    { id: 2, locationName: 'Location B', locationAddress: '456 Oak St, Townsville', driverName: 'Jane Smith', status: 'in-transit' },
    { id: 3, locationName: 'Location C', locationAddress: '789 Pine St, Villageville', driverName: 'Mike Johnson', status: 'delivered' },
    { id: 4, locationName: 'Location D', locationAddress: '101 Maple St, Hamletville', driverName: 'Emily Davis', status: 'pending' },
    { id: 5, locationName: 'Location E', locationAddress: '202 Birch St, Boroughville', driverName: 'David Wilson', status: 'in-transit' },
    { id: 6, locationName: 'Location F', locationAddress: '303 Cedar St, Metropolis', driverName: 'Sarah Brown', status: 'delivered' },
    { id: 7, locationName: 'Location G', locationAddress: '404 Spruce St, Capital City', driverName: 'Chris Lee', status: 'pending' },
    { id: 8, locationName: 'Location H', locationAddress: '505 Elm St, Smalltown', driverName: 'Anna White', status: 'in-transit' },
    { id: 9, locationName: 'Location I', locationAddress: '606 Willow St, Bigcity', driverName: 'Tom Harris', status: 'delivered' },
    { id: 10, locationName: 'Location J', locationAddress: '707 Ash St, Uptown', driverName: 'Laura Martin', status: 'pending' },
    { id: 11, locationName: 'Location K', locationAddress: '808 Chestnut St, Downtown', driverName: 'James Clark', status: 'in-transit' },
    { id: 12, locationName: 'Location L', locationAddress: '909 Walnut St, Riverside', driverName: 'Olivia Lewis', status: 'delivered' },
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.dataSource.data = this.createRoutes;
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

  viewMap(route: CreateRoutes) {
  }

  // Status methods
  getStatusDisplayText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'delivered': 'Delivered',
      'in-transit': 'In transit',
      'follow-up': 'Follow up',
      'follow-up-completed': 'Follow up completed',
      'driver-assigned': 'Driver Assigned'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'delivered': 'status-delivered',
      'in-transit': 'status-in-transit',
      'follow-up': 'status-follow-up',
      'pending': 'status-follow-up',
      'follow-up-completed': 'status-follow-up-completed',
      'driver-assigned': 'status-driver-assigned'
    };
    return classMap[status] || 'status-default';
  }
}