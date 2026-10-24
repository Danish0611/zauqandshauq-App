import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe],
  template: `
    <article class="product-card">
      <div class="product-visual" [class]="'product-visual visual-' + ((product.id - 1) % 4)">
        <button class="product-image-button" type="button" (click)="open.emit(product)" [attr.aria-label]="'View ' + product.name">
          <img [src]="product.image" [alt]="product.name + ' perfume bottle illustration'" loading="lazy">
        </button>
        <span class="product-badge" *ngIf="product.badge">{{ product.badge }}</span>
        <button type="button" class="wish-button" [class.wished]="wished" (click)="toggleWish.emit(product)" [attr.aria-label]="wished ? 'Remove from wishlist' : 'Add to wishlist'">
          <svg viewBox="0 0 24 24"><path d="M20.8 8.8c0 5.2-8.8 10.2-8.8 10.2S3.2 14 3.2 8.8A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.7Z"></path></svg>
        </button>
        <button type="button" class="quick-add" (click)="add.emit(product)" [disabled]="product.stockQuantity === 0">
          <span>＋</span> {{ product.stockQuantity === 0 ? 'Out of stock' : 'Add to bag' }}
          <span class="quick-add-price">{{ product.price | currency:'INR':'symbol':'1.0-0' }}</span>
        </button>
      </div>
      <div class="product-details">
        <div class="product-brand-row">
          <span class="product-brand">{{ product.brand }} <ng-container *ngIf="product.productCode">· {{ product.productCode }}</ng-container></span>
          <span class="product-rating">★ {{ product.rating }}</span>
        </div>
        <button class="product-name-button" type="button" (click)="open.emit(product)">{{ product.name }}</button>
        <p class="product-notes">{{ product.notes.join(' · ') }}</p>
        <div class="product-bottom-row">
          <span class="product-size">{{ product.size }} <i>·</i> {{ product.concentration }}</span>
          <span class="product-price">{{ product.price | currency:'INR':'symbol':'1.0-0' }}</span>
        </div>
        <div class="discount-line" *ngIf="product.originalPrice > product.price">
          <span>{{ ((product.originalPrice - product.price) / product.originalPrice * 100) | number:'1.0-0' }}% less</span>
          <s>{{ product.originalPrice | currency:'INR':'symbol':'1.0-0' }}</s>
        </div>
      </div>
    </article>
  `
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() wished = false;
  @Output() open = new EventEmitter<Product>();
  @Output() add = new EventEmitter<Product>();
  @Output() toggleWish = new EventEmitter<Product>();
}

