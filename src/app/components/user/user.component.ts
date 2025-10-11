import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserResponse } from '../../models/user.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../services/toast.service';

export interface User {
  id: number;
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
  
  isLoading = false;
  errorMessage = '';
  users: User[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.userService.getUsers().subscribe({
      next: (apiUsers: UserResponse[]) => {
        this.users = this.mapApiResponseToUser(apiUsers);
        this.dataSource.data = this.users;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Failed to load users. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private mapApiResponseToUser(apiUsers: UserResponse[]): User[] {
    return apiUsers.map(apiUser => ({
      id: apiUser.id,
      role: apiUser.roleName,
      name: apiUser.name,
      email: apiUser.email,
      phoneNumber: apiUser.phoneNumber
    }));
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
    this.router.navigate(['/users/edit', user.id]);
  }

  deleteUser(user: User) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performDelete(user);
      }
    });
  }

  private performDelete(user: User): void {
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.toastService.success('Success', 'User has been deleted successfully');
        this.loadUsers(); // Refresh the user list
      },
      error: (error: any) => {
        console.error('Error deleting user:', error);
        const message = error.error?.message || 'Failed to delete user. Please try again.';
        this.toastService.error('Error', message);
      }
    });
  }

  isAdmin(user: User): boolean {
    return user.role.toLowerCase() === 'administrators' || user.role.toLowerCase() === 'admin';
  }
}
