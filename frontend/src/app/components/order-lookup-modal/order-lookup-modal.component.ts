import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { OrderReceipt } from '../../product.model';

@Component({
  selector: 'app-order-lookup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="modal-backdrop" *ngIf="open" (click)="close.emit()" role="presentation">
      <section class="checkout-modal" style="max-width: 660px; padding: 32px;" role="dialog" aria-modal="true" aria-label="Track Order" (click)="$event.stopPropagation()">
        <button type="button" class="close-button checkout-close" (click)="close.emit()" aria-label="Close order lookup">×</button>
        <div class="eyebrow"><span class="eyebrow-line"></span> ORDER CONCIERGE</div>
        <h2 style="font-family: 'Playfair Display', serif; font-weight: 400; font-size: 32px; margin: 12px 0;">Track your <em>order.</em></h2>
        <p style="font-size: 11px; color: #707666; line-height: 1.8; margin-bottom: 20px;">
          Enter your order reference (e.g. <code>ZS-20261013-A1B2C3</code>) or your email address to view your persistent order status from our PostgreSQL database.
        </p>

        <form (submit)="$event.preventDefault(); searchOrder()" style="display: flex; gap: 10px; margin-bottom: 20px;">
          <input type="text" name="query" [(ngModel)]="query" placeholder="Enter Order Reference (ZS-...) or Email" required
                 style="flex: 1; border: 1px solid #dbd7c9; background: #fffdf7; padding: 12px 14px; font-size: 11px; color: #202a1c;">
          <button type="submit" class="button button-dark" [disabled]="loading">{{ loading ? 'Searching…' : 'Find Order' }} <span>→</span></button>
        </form>

        <div class="checkout-error" *ngIf="errorMessage">{{ errorMessage }}</div>

        <div *ngIf="foundOrders.length" style="display: flex; flex-direction: column; gap: 14px; max-height: 420px; overflow-y: auto;">
          <div *ngFor="let ord of foundOrders" class="success-order-card" style="margin: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 0; padding-top: 0; margin-bottom: 8px;">
              <span style="font-size: 9px; letter-spacing: 1.2px; color: #858775;">ORDER REFERENCE</span>
              <span style="padding: 4px 10px; background: #202a1c; color: #f7f4eb; font-size: 8px; letter-spacing: 1px;">{{ ord.status }}</span>
            </div>
            <strong style="font-family: 'Playfair Display', serif; font-size: 20px; display: block; margin-bottom: 6px;">{{ ord.orderNumber }}</strong>
            <small style="display: block; color: #747a68; font-size: 9px; margin-bottom: 12px;">
              Placed on {{ ord.createdAt | date:'medium' }} · {{ ord.name }} ({{ ord.email }})
            </small>
            <div style="border-top: 1px solid #ded7c7; padding-top: 10px; margin-bottom: 10px;">
              <div *ngFor="let item of ord.items" style="display: flex; justify-content: space-between; font-size: 10px; padding: 3px 0;">
                <span>{{ item.name }} × {{ item.quantity }}</span>
                <span>{{ item.lineTotal | currency:'INR':'symbol':'1.0-0' }}</span>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #ded7c7; padding-top: 10px;">
              <span style="font-size: 10px;">Total ({{ ord.paymentMethod }})</span>
              <strong style="font-family: 'Playfair Display', serif; font-size: 17px;">{{ ord.total | currency:'INR':'symbol':'1.0-0' }}</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  `
})
export class OrderLookupModalComponent {
  @Input() open = false;
  @Input() apiBase = 'http://localhost:8080/api';
  @Input() set initialQuery(q: string) {
    if (q) {
      this.query = q;
      if (this.open) {
        setTimeout(() => this.searchOrder(), 50);
      }
    }
  }
  @Output() close = new EventEmitter<void>();

  query = '';
  loading = false;
  errorMessage = '';
  foundOrders: OrderReceipt[] = [];

  constructor(private http: HttpClient) {}

  searchOrder(): void {
    const q = this.query.trim();
    if (!q) return;
    this.loading = true;
    this.errorMessage = '';
    this.foundOrders = [];

    if (q.includes('@')) {
      this.http.get<OrderReceipt[]>(`${this.apiBase}/orders/by-email`, { params: { email: q } }).subscribe({
        next: list => {
          this.loading = false;
          this.foundOrders = list;
          if (!list.length) this.errorMessage = 'No orders found for this email address.';
        },
        error: err => {
          this.loading = false;
          this.errorMessage = err?.error?.message || 'Unable to look up orders right now.';
        }
      });
    } else {
      this.http.get<OrderReceipt>(`${this.apiBase}/orders/${encodeURIComponent(q.toUpperCase())}`).subscribe({
        next: receipt => {
          this.loading = false;
          this.foundOrders = [receipt];
        },
        error: err => {
          this.loading = false;
          this.errorMessage = err?.error?.message || 'Order reference not found.';
        }
      });
    }
  }
}

