import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
  users: User[] = [];
  filteredUsers: User[] = [];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  isLoading = false;
  errorMessage = '';
  selectedRole = '';
  pageSizeOptions: number[] = [25, 50, 75, 100];

  // Pagination state
  pageIndex: number = 0;
  pageSize: number = 25;
  totalCount: number = 0;
  sortBy: string = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';
  searchTerm: string = '';

  // Debounce subject for search
  private searchSubject = new Subject<string>();

  constructor(
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog,
    private toastService: ToastService
  ) {
    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.pageIndex = 0;
      this.loadUsers();
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const params = {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      sortBy: this.mapColumnToSortField(this.sortBy),
      sortOrder: this.sortOrder,
      search: this.searchTerm || undefined
    };

    this.userService.getUsersPaged(params).subscribe({
      next: (result) => {
        this.users = this.mapApiResponseToUser(result.data);
        this.applyRoleFilter();
        this.totalCount = result.totalCount;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Failed to load users. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private mapColumnToSortField(column: string): string {
    const columnMap: { [key: string]: string } = {
      'name': 'name',
      'email': 'email',
      'phoneNumber': 'phoneNumber',
      'role': 'role'
    };
    return columnMap[column] || 'name';
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue.trim());
  }

  applyRoleFilter() {
    if (this.selectedRole) {
      this.filteredUsers = this.users.filter(user => 
        user.role.toLowerCase() === this.selectedRole.toLowerCase()
      );
    } else {
      this.filteredUsers = [...this.users];
    }
  }

  onRoleFilterChange() {
    this.applyRoleFilter();
  }

  resetFilters() {
    this.selectedRole = '';
    this.searchTerm = '';
    this.pageIndex = 0;
    this.loadUsers();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  onSortChange(column: string) {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.pageIndex = 0;
    this.loadUsers();
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
