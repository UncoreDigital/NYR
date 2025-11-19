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
import { computePageSizeOptions } from 'src/app/utils/paginator-utils';

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
  filteredUsers: User[] = [];
  selectedRole = '';
  searchTerm = '';

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
        this.filteredUsers = [...this.users];
        this.applyFilters();
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
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.users];

    // Apply role filter
    if (this.selectedRole) {
      filtered = filtered.filter(user => 
        user.role.toLowerCase() === this.selectedRole.toLowerCase()
      );
    }

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower) ||
        user.phoneNumber.toLowerCase().includes(searchLower)
      );
    }

    this.filteredUsers = filtered;
    this.dataSource.data = this.filteredUsers;
    const computedOptions = computePageSizeOptions(this.dataSource.data.length);
    this.pageSizeOptions = computedOptions.length ? computedOptions : [25];
  }

  onRoleFilterChange() {
    this.applyFilters();
  }

  resetFilters() {
    this.selectedRole = '';
    this.searchTerm = '';
    this.applyFilters();
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
