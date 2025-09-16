import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

export interface User {
  role: string;
  name: string;
  email: string;
  phoneNumber: string;
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit {
  displayedColumns: string[] = ['role', 'name', 'email', 'phoneNumber', 'actions'];
  dataSource = new MatTableDataSource<User>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  users: User[] = [
    { role: 'Administrators', name: 'John Doe', email: 'loepark@gmail.com', phoneNumber: '123456789' },
    { role: 'Staff', name: 'John Doe', email: 'loepark@gmail.com', phoneNumber: '123456789' },
    { role: 'Administrators', name: 'John Doe', email: 'loepark@gmail.com', phoneNumber: '123456789' },
    { role: 'Administrators', name: 'John Doe', email: 'loepark@gmail.com', phoneNumber: '123456789' },
    { role: 'Administrators', name: 'John Doe', email: 'loepark@gmail.com', phoneNumber: '123456789' },
    { role: 'Administrators', name: 'John Doe', email: 'loepark@gmail.com', phoneNumber: '123456789' },
    { role: 'Administrators', name: 'John Doe', email: 'loepark@gmail.com', phoneNumber: '123456789' },
    { role: 'Administrators', name: 'John Doe', email: 'loepark@gmail.com', phoneNumber: '123456789' },
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.dataSource.data = this.users;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addUser() {
    console.log('Add User clicked');
    this.router.navigate(['/users/add']);
  }

  viewUser(user: User) {
    console.log('View User:', user);
  }

  editUser(user: User) {
    console.log('Edit User:', user);
  }

  deleteUser(user: User) {
    console.log('Delete User:', user);
  }
}
