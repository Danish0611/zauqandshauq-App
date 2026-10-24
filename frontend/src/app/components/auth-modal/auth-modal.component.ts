import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { OrderReceipt, UserProfile } from '../../product.model';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="modal-backdrop" *ngIf="open" (click)="close.emit()" role="presentation">
      <section class="checkout-modal" style="max-width: 720px; padding: 32px;" role="dialog" aria-modal="true" aria-label="Account & Profile" (click)="$event.stopPropagation()">
        <button type="button" class="close-button checkout-close" (click)="close.emit()" aria-label="Close account modal">×</button>

        <ng-container *ngIf="!auth.currentUser; else loggedInView">
          <div class="eyebrow"><span class="eyebrow-line"></span> Z&amp;S ATELIER MEMBERSHIP</div>
          <h2 style="font-family: 'Playfair Display', serif; font-weight: 400; font-size: 32px; margin: 12px 0;">
            {{ mode === 'login' ? 'Welcome' : 'Create your' }} <em>{{ mode === 'login' ? 'back.' : 'account.' }}</em>
          </h2>

          <div class="category-pills" style="margin-bottom: 22px;">
            <button type="button" [class.active]="mode === 'login'" (click)="mode = 'login'; errorMessage = ''">Sign In</button>
            <button type="button" [class.active]="mode === 'register'" (click)="mode = 'register'; errorMessage = ''">Create Account</button>
          </div>

          <form *ngIf="mode === 'login'" class="checkout-form" style="padding: 0;" (ngSubmit)="submitLogin()">
            <label>Email address
              <input type="email" name="loginEmail" [(ngModel)]="loginForm.email" required placeholder="you@example.com">
            </label>
            <label>Password
              <input type="password" name="loginPassword" [(ngModel)]="loginForm.password" required placeholder="Your password">
            </label>
            <div class="checkout-error" *ngIf="errorMessage">{{ errorMessage }}</div>
            <button type="submit" class="button button-dark full-button checkout-submit" [disabled]="busy">
              {{ busy ? 'Signing in…' : 'Sign in to Z&S' }} <span>→</span>
            </button>
            <div style="margin-top: 16px; padding: 12px; background: #f0ede2; border: 1px solid #ded9ca; font-size: 9px; color: #626b56; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <span>Quick test accounts (seeded in PostgreSQL):</span>
              <div style="display: flex; gap: 8px;">
                <button type="button" class="text-link" style="font-size: 9px; text-decoration: underline;" (click)="fillDemo('customer')">Customer Login</button>
                <button type="button" class="text-link" style="font-size: 9px; text-decoration: underline;" (click)="fillDemo('admin')">Admin Login</button>
              </div>
            </div>
          </form>

          <form *ngIf="mode === 'register'" class="checkout-form" style="padding: 0;" (ngSubmit)="submitRegister()">
            <div class="form-row">
              <label>Full name
                <input type="text" name="regName" [(ngModel)]="registerForm.name" required minlength="2" placeholder="Your full name">
              </label>
              <label>Phone number
                <input type="tel" name="regPhone" [(ngModel)]="registerForm.phone" placeholder="10-digit mobile">
              </label>
            </div>
            <div class="form-row">
              <label>Email address
                <input type="email" name="regEmail" [(ngModel)]="registerForm.email" required placeholder="you@example.com">
              </label>
              <label>Password (min 6 chars)
                <input type="password" name="regPassword" [(ngModel)]="registerForm.password" required minlength="6" placeholder="Create password">
              </label>
            </div>
            <div class="checkout-error" *ngIf="errorMessage">{{ errorMessage }}</div>
            <button type="submit" class="button button-dark full-button checkout-submit" [disabled]="busy">
              {{ busy ? 'Creating account…' : 'Create account' }} <span>→</span>
            </button>
          </form>
        </ng-container>

        <ng-template #loggedInView>
          <div *ngIf="auth.currentUser as user">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 18px;">
              <div>
                <div class="eyebrow"><span class="eyebrow-line"></span> {{ user.role === 'ADMIN' ? 'ATELIER ADMINISTRATOR' : 'MEMBER PROFILE' }}</div>
                <h2 style="font-family: 'Playfair Display', serif; font-weight: 400; font-size: 32px; margin: 8px 0 4px;">
                  Hello, <em>{{ user.name }}</em>
                </h2>
                <small style="font-size: 10px; color: #747a68;">{{ user.email }}</small>
              </div>
              <div style="display: flex; gap: 10px; align-items: center;">
                <button *ngIf="user.role === 'ADMIN'" type="button" class="button button-gold" (click)="openAdmin.emit(); close.emit()">
                  Admin Dashboard <span>↗</span>
                </button>
                <button type="button" class="button button-dark" (click)="logout()">Sign Out</button>
              </div>
            </div>

            <div class="category-pills" style="margin-bottom: 20px; border-bottom: 1px solid #d9d6ca; padding-bottom: 12px;">
              <button type="button" [class.active]="activeTab === 'orders'" (click)="activeTab = 'orders'">My Orders ({{ myOrders.length }})</button>
              <button type="button" [class.active]="activeTab === 'profile'" (click)="activeTab = 'profile'">Saved Address &amp; Details</button>
            </div>

            <div *ngIf="activeTab === 'orders'" style="max-height: 380px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px;">
              <div *ngIf="!myOrders.length" style="text-align: center; padding: 36px 20px; background: #f4f0e3;">
                <p style="font-size: 11px; color: #707666; margin: 0;">You haven't placed any orders yet.</p>
              </div>
              <div *ngFor="let ord of myOrders" class="success-order-card" style="margin: 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 0; padding-top: 0;">
                  <strong style="font-family: 'Playfair Display', serif; font-size: 18px;">{{ ord.orderNumber }}</strong>
                  <span style="padding: 4px 9px; background: #202a1c; color: #f7f4eb; font-size: 8px; letter-spacing: 1px;">{{ ord.status }}</span>
                </div>
                <small style="color: #747a68; font-size: 9px; margin: 4px 0 10px; display: block;">
                  {{ ord.createdAt | date:'medium' }} · {{ ord.paymentMethod }}
                </small>
                <div *ngFor="let line of ord.items" style="display: flex; justify-content: space-between; font-size: 10px; padding: 3px 0;">
                  <span>{{ line.name }} × {{ line.quantity }}</span>
                  <span>{{ line.lineTotal | currency:'INR':'symbol':'1.0-0' }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid #ded7c7;">
                  <span>Total</span>
                  <strong>{{ ord.total | currency:'INR':'symbol':'1.0-0' }}</strong>
                </div>
              </div>
            </div>

            <form *ngIf="activeTab === 'profile'" class="checkout-form" style="padding: 0;" (ngSubmit)="saveProfile()">
              <div class="form-row">
                <label>Full name
                  <input type="text" name="profName" [(ngModel)]="profileForm.name" required>
                </label>
                <label>Phone number
                  <input type="tel" name="profPhone" [(ngModel)]="profileForm.phone">
                </label>
              </div>
              <label>Default street address
                <input type="text" name="profAddress" [(ngModel)]="profileForm.address" placeholder="House no., street, locality">
              </label>
              <div class="form-row">
                <label>City
                  <input type="text" name="profCity" [(ngModel)]="profileForm.city">
                </label>
                <label>State
                  <input type="text" name="profState" [(ngModel)]="profileForm.state">
                </label>
              </div>
              <label>PIN code
                <input type="text" name="profPostal" [(ngModel)]="profileForm.postalCode" maxlength="6">
              </label>
              <p *ngIf="profileSavedMsg" style="font-size: 10px; color: #3c7049; margin: 8px 0;">{{ profileSavedMsg }}</p>
              <button type="submit" class="button button-dark" [disabled]="busy">
                {{ busy ? 'Saving…' : 'Save profile details' }} <span>→</span>
              </button>
            </form>
          </div>
        </ng-template>
      </section>
    </div>
  `
})
export class AuthModalComponent implements OnChanges {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  @Output() authenticated = new EventEmitter<UserProfile>();
  @Output() openAdmin = new EventEmitter<void>();

  mode: 'login' | 'register' = 'login';
  activeTab: 'orders' | 'profile' = 'orders';
  busy = false;
  errorMessage = '';
  profileSavedMsg = '';
  myOrders: OrderReceipt[] = [];

  loginForm = { email: '', password: '' };
  registerForm = { name: '', email: '', password: '', phone: '' };
  profileForm = { name: '', phone: '', address: '', city: '', state: 'Rajasthan', postalCode: '' };

  constructor(public auth: AuthService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open && this.auth.isLoggedIn) {
      this.refreshMe();
    }
  }

  fillDemo(role: 'customer' | 'admin'): void {
    if (role === 'admin') {
      this.loginForm.email = 'admin@zauqandshauq.in';
      this.loginForm.password = 'admin123';
    } else {
      this.loginForm.email = 'customer@zauqandshauq.in';
      this.loginForm.password = 'customer123';
    }
    this.submitLogin();
  }

  submitLogin(): void {
    if (this.busy) return;
    this.busy = true;
    this.errorMessage = '';
    this.auth.login(this.loginForm.email, this.loginForm.password).subscribe({
      next: res => {
        this.busy = false;
        this.authenticated.emit(res.user);
        this.refreshMe();
      },
      error: err => {
        this.busy = false;
        this.errorMessage = err?.error?.message || 'Invalid email or password.';
      }
    });
  }

  submitRegister(): void {
    if (this.busy) return;
    this.busy = true;
    this.errorMessage = '';
    this.auth.register(
      this.registerForm.name,
      this.registerForm.email,
      this.registerForm.password,
      this.registerForm.phone
    ).subscribe({
      next: res => {
        this.busy = false;
        this.authenticated.emit(res.user);
        this.refreshMe();
      },
      error: err => {
        this.busy = false;
        this.errorMessage = err?.error?.message || 'Registration failed.';
      }
    });
  }

  refreshMe(): void {
    this.auth.fetchMe().subscribe({
      next: data => {
        this.myOrders = data.orders || [];
        const u = data.user;
        this.profileForm = {
          name: u.name || '',
          phone: u.phone || '',
          address: u.address || '',
          city: u.city || '',
          state: u.state || 'Rajasthan',
          postalCode: u.postalCode || ''
        };
      }
    });
  }

  saveProfile(): void {
    this.busy = true;
    this.profileSavedMsg = '';
    this.auth.updateProfile(this.profileForm).subscribe({
      next: u => {
        this.busy = false;
        this.profileSavedMsg = 'Profile and delivery details saved.';
        this.authenticated.emit(u);
      },
      error: () => {
        this.busy = false;
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.myOrders = [];
    this.close.emit();
  }
}

