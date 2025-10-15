import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [CommonModule, MatIconModule],
  standalone: true
})
export class HeaderComponent implements OnInit {
  showUserMenu = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Close user menu when clicking outside
    // document.addEventListener('click', () => {
    //   this.showUserMenu = false;
    // });
  }

  toggleMobileMenu(): void {
    // Emit event to communicate with sidebar
    const event = new CustomEvent('toggleMobileMenu');
    window.dispatchEvent(event);
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  viewProfile(): void {
    console.log('View Profile clicked');
    this.router.navigate(['/profile']);
    // Navigate to profile page
    this.showUserMenu = false;
  }

  openSettings(): void {
    // Navigate to settings page
    this.showUserMenu = false;
  }

  logout(): void {
    console.log('Logout clicked');
    // Clear tokens, redirect to login, etc.
    // Clear user session
    localStorage.clear();
    sessionStorage.clear();

    // Redirect to login page
    window.location.href = '/login';
    this.showUserMenu = false;
  }

}