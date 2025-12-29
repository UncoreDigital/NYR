import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      rememberPassword: [false]
    });
  }

  ngOnInit(): void {
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  isFromAPK(): boolean {
    const ua = navigator.userAgent || '';
    return /wv|Android.*Version\/[\d.]+/.test(ua);
  }

  onSubmit(): void {
    if (this.isFromAPK()) {
      const errorMessage = 'Login failed. Please try again.';
      this.toastService.error('Login Failed', errorMessage);
      return; // Skip login if from APK
    }
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.toastService.success('Login Successful', 'Welcome back!');          
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error.error?.message || error.message || 'Login failed. Please try again.';
          this.toastService.error('Login Failed', errorMessage);
        }
      });
    }
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }
}