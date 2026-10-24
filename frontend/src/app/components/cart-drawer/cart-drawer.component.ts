import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CartItem } from '../../product.model';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="overlay" *ngIf="open" (click)="close.emit()" aria-hidden="true"></div>
    <aside class="cart-drawer royal-cart" [class.drawer-open]="open" [attr.aria-hidden]="!open" aria-label="Shopping bag">
      <div class="drawer-header">
        <div>
          <span class="eyebrow eyebrow-emerald"><span class="eyebrow-line"></span> YOUR SELECTION</span>
          <h2>Your bag <em>({{ cartCount }})</em></h2>
        </div>
        <button type="button" class="close-button" (click)="close.emit()" aria-label="Close shopping bag">×</button>
      </div>

      <!-- Free Gift & Sample Milestone (From World Benchmark Report) -->
      <div class="sample-milestone-banner" *ngIf="cart.length">
        <div class="milestone-text">
          <span class="milestone-icon">{{ freeShippingRemaining > 0 ? '🎁' : '✨' }}</span>
          <p *ngIf="freeShippingRemaining > 0">
            Add <strong>{{ freeShippingRemaining | currency:'INR':'symbol':'1.0-0' }}</strong> more to unlock a <strong>Complimentary 2ml Extrait Vial</strong> + Express Delivery.
          </p>
          <p *ngIf="freeShippingRemaining === 0" class="milestone-unlocked">
            <strong>Gift Unlocked:</strong> Complimentary 2ml Luxury Extrait Vial + Royal Wax-Sealed Packaging is included with your order!
          </p>
        </div>
        <div class="milestone-track">
          <span [style.width.%]="cartSubtotal >= 2499 ? 100 : (cartSubtotal / 2499 * 100)"></span>
        </div>
      </div>

      <div class="cart-items" *ngIf="cart.length; else emptyBag">
        <article class="cart-line" *ngFor="let item of cart">
          <img [src]="item.product.image" [alt]="item.product.name">
          <div class="cart-line-content">
            <span class="product-brand">{{ item.product.brand }}</span>
            <h3>{{ item.product.name }}</h3>
            <p>{{ item.product.size }} · {{ item.product.concentration }}</p>
            <div class="cart-line-bottom">
              <div class="quantity-control">
                <button type="button" (click)="quantityChange.emit({ item, delta: -1 })" [attr.aria-label]="'Decrease ' + item.product.name + ' quantity'">−</button>
                <span>{{ item.quantity }}</span>
                <button type="button" (click)="quantityChange.emit({ item, delta: 1 })" [attr.aria-label]="'Increase ' + item.product.name + ' quantity'">+</button>
              </div>
              <strong>{{ item.product.price * item.quantity | currency:'INR':'symbol':'1.0-0' }}</strong>
            </div>
            <button type="button" class="remove-line" (click)="remove.emit(item)">Remove</button>
          </div>
        </article>
      </div>

      <ng-template #emptyBag>
        <div class="empty-bag">
          <span class="empty-crest">Z<span>&amp;</span>S</span>
          <h3>Your bag is taking a little pause.</h3>
          <p>Explore our fragrance wardrobe or begin with the Discovery Coffret.</p>
          <button class="button button-dark" type="button" (click)="explore.emit()">Explore Wardrobe</button>
        </div>
      </ng-template>

      <div class="drawer-bottom" *ngIf="cart.length">
        <div class="drawer-subtotal">
          <span>Subtotal</span>
          <strong>{{ cartSubtotal | currency:'INR':'symbol':'1.0-0' }}</strong>
        </div>
        <div class="drawer-perks-note">
          <span>✓ Hand-poured in small batches</span>
          <span>✓ Free express insured shipping</span>
        </div>
        <button type="button" class="button button-dark checkout-button" (click)="checkout.emit()">
          Proceed to Checkout <span>→</span>
        </button>
        <button type="button" class="continue-shopping" (click)="close.emit()">Continue Exploring</button>
        <div class="drawer-secure">
          <span>🔒 256-Bit SSL Encrypted · Razorpay &amp; PostgreSQL Persistence</span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .royal-cart {
      background: #faf8f2;
      border-left: 1px solid rgba(216, 191, 167, 0.4);
    }

    .eyebrow-emerald {
      color: #0d5e50;
      font-weight: 700;
      letter-spacing: 0.16em;
    }

    .sample-milestone-banner {
      padding: 14px 24px;
      background: linear-gradient(135deg, #093c33 0%, #062620 100%);
      color: #f7f3ea;
      border-bottom: 1px solid rgba(216, 191, 167, 0.3);
    }

    .milestone-text {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 11px;
      line-height: 1.5;
    }

    .milestone-text p {
      margin: 0;
    }

    .milestone-text strong {
      color: #e5c178;
    }

    .milestone-unlocked strong {
      color: #8ed0b5;
    }

    .milestone-icon {
      font-size: 18px;
    }

    .milestone-track {
      height: 4px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.15);
      margin-top: 10px;
      overflow: hidden;
    }

    .milestone-track span {
      height: 100%;
      display: block;
      background: linear-gradient(90deg, #c89d54, #f0d59c);
      transition: width 0.35s ease;
    }

    .empty-crest {
      font-family: var(--font-display, serif);
      font-size: 32px;
      color: #c89d54;
      display: block;
      margin-bottom: 12px;
    }
    .empty-crest span {
      font-style: italic;
      color: #093c33;
    }

    .drawer-perks-note {
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #093c33;
      margin: 8px 0 14px;
      font-weight: 600;
    }

    .drawer-secure {
      text-align: center;
      font-size: 9px;
      color: #7b8070;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid #e2dece;
    }
  `]
})
export class CartDrawerComponent {
  @Input() open = false;
  @Input() cart: CartItem[] = [];
  @Input() cartCount = 0;
  @Input() cartSubtotal = 0;
  @Input() freeShippingRemaining = 0;
  @Output() close = new EventEmitter<void>();
  @Output() quantityChange = new EventEmitter<{ item: CartItem; delta: number }>();
  @Output() remove = new EventEmitter<CartItem>();
  @Output() checkout = new EventEmitter<void>();
  @Output() explore = new EventEmitter<void>();
}
