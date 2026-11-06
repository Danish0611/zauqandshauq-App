import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Product } from '../../product.model';

export interface NoteTier {
  title: string;
  duration: string;
  notes: string[];
  description: string;
  limbicRole: string;
}

export interface FragranticaAccord {
  name: string;
  percent: number;
  color: string;
}

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="modal-backdrop" *ngIf="product" (click)="close.emit()" role="presentation">
      <section
        class="product-modal luxury-pdp-modal"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="product.name"
        (click)="$event.stopPropagation()">
        
        <!-- High-Priority Universal Close Button (Always in front of navbar & content) -->
        <button 
          type="button" 
          class="modal-close" 
          (click)="close.emit()" 
          aria-label="Close fragrance details">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="pdp-layout">
          <!-- Left Column: Visual Gallery & Bottle Presentation -->
          <div class="pdp-gallery-col">
            <div class="pdp-main-image-wrap">
              <img
                [src]="activeGalleryImage"
                [alt]="product.name + ' luxury bottle view'"
                class="pdp-main-img" />
              <span class="pdp-badge-discount" *ngIf="discountPercent > 0">
                {{ discountPercent }}% OFF
              </span>
              <span class="pdp-concentration-chip">
                ✦ {{ product.concentration || 'Eau de Parfum' }}
              </span>
            </div>

            <!-- Authentic Flacon & Royal Seal Thumbnails -->
            <div class="pdp-thumbnails">
              <button
                type="button"
                class="thumb-btn"
                [class.active]="selectedView === 'bottle'"
                (click)="setView('bottle')">
                <img [src]="product.image" [alt]="product.name + ' Flacon'" />
                <span>Flacon</span>
              </button>
              <button
                type="button"
                class="thumb-btn"
                [class.active]="selectedView === 'seal'"
                (click)="setView('seal')">
                <img src="/assets/logo.png" alt="Royal Crest Seal" />
                <span>Royal Seal</span>
              </button>
            </div>

            <!-- Poetic Quote Banner for this Bottle -->
            <div class="pdp-poetry-strip">
              <span class="pdp-poetry-mark">“</span>
              <p>خوشبو وہ خاموش زبان ہے جو دل سے دل تک بات کرتی ہے</p>
              <small>Scent is the silent language that speaks from soul to soul.</small>
            </div>
          </div>

          <!-- Right Column: Olfactory Architecture & Purchase Suite -->
          <div class="pdp-details-col">
            <!-- Breadcrumb & Brand Lockup -->
            <div class="pdp-eyebrow-row">
              <div class="eyebrow eyebrow-emerald">
                <span class="eyebrow-line"></span> {{ product.brand }} · {{ product.category }}
              </div>
              <span class="pdp-code" *ngIf="product.productCode">CODE: {{ product.productCode }}</span>
            </div>

            <h2 class="pdp-title">{{ product.name }}</h2>

            <!-- Rating & Reviews -->
            <div class="pdp-rating-row">
              <span class="stars">★★★★★</span>
              <strong>{{ product.rating || 4.9 }}</strong>
              <span class="review-count">({{ product.reviews || 84 }} verified reviews)</span>
              <span class="dot-sep">·</span>
              <span class="verified-pill">✓ 100% Authentic Botanical Extract</span>
            </div>

            <!-- Price with Dynamic Size Calculation -->
            <div class="pdp-price-row">
              <div class="price-stack">
                <span class="current-price">{{ currentPrice | currency:'INR':'symbol':'1.0-0' }}</span>
                <s class="original-price" *ngIf="currentOriginalPrice > currentPrice">
                  {{ currentOriginalPrice | currency:'INR':'symbol':'1.0-0' }}
                </s>
              </div>
              <span class="tax-info">Inclusive of all luxury taxes &amp; complimentary shipping</span>
            </div>

            <p class="pdp-lead-description">{{ product.description }}</p>

            <!-- Size Selector (50ml / 100ml) -->
            <div class="pdp-option-group">
              <div class="option-label">
                <span>Select Flacon Size</span>
                <small>{{ selectedSize === '100ml' ? 'Most Loved · Better Value' : 'Travel & Daily Companion' }}</small>
              </div>
              <div class="size-pill-group">
                <button
                  type="button"
                  class="size-pill"
                  [class.active]="selectedSize === '50ml'"
                  (click)="setSize('50ml')">
                  <strong>50ml</strong>
                  <span>Eau de Parfum</span>
                </button>
                <button
                  type="button"
                  class="size-pill"
                  [class.active]="selectedSize === '100ml'"
                  (click)="setSize('100ml')">
                  <strong>100ml</strong>
                  <span class="save-tag">Grand Flacon</span>
                </button>
              </div>
            </div>

            <!-- Quantity & Actions -->
            <div class="pdp-purchase-row">
              <div class="quantity-stepper">
                <button type="button" (click)="decQty()" [disabled]="quantity <= 1" aria-label="Decrease quantity">−</button>
                <span>{{ quantity }}</span>
                <button type="button" (click)="incQty()" [disabled]="quantity >= 10" aria-label="Increase quantity">+</button>
              </div>

              <button
                type="button"
                class="btn-pdp-add"
                [disabled]="product.stockQuantity === 0"
                (click)="handleAddToCart()">
                {{ product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Bag' }}
              </button>

              <button
                type="button"
                class="btn-pdp-buy"
                [disabled]="product.stockQuantity === 0"
                (click)="handleBuyNow()">
                Buy Now <span>↗</span>
              </button>

              <button
                type="button"
                class="wishlist-icon-btn"
                [class.wished]="wished"
                (click)="toggleWish.emit(product)"
                [attr.aria-label]="wished ? 'Remove from wishlist' : 'Save to wishlist'">
                {{ wished ? '♥' : '♡' }}
              </button>
            </div>

            <!-- French & Arabian 3 Luxury Value Pillars -->
            <div class="luxury-pillars-grid">
              <div class="pillar-card">
                <span class="pillar-icon">⏳</span>
                <div>
                  <strong>Long Lasting</strong>
                  <small>12–16 Hours on pulse points</small>
                </div>
              </div>
              <div class="pillar-card">
                <span class="pillar-icon">🌿</span>
                <div>
                  <strong>Precious Botanicals</strong>
                  <small>Grasse, Mysore &amp; Assam oils</small>
                </div>
              </div>
              <div class="pillar-card">
                <span class="pillar-icon">🧠</span>
                <div>
                  <strong>Calms the Nerves</strong>
                  <small>Bypasses cortex to limbic center</small>
                </div>
              </div>
            </div>

            <!-- Olfactory Note Architecture & Fragrantica Accords Tabs -->
            <div class="pdp-notes-section">
              <div class="notes-nav">
                <button
                  type="button"
                  [class.active]="activeNoteTab === 'accords'"
                  (click)="activeNoteTab = 'accords'">
                  Main Accords (Fragrantica)
                </button>
                <button
                  type="button"
                  [class.active]="activeNoteTab === 'pyramid'"
                  (click)="activeNoteTab = 'pyramid'">
                  Olfactory Pyramid
                </button>
                <button
                  type="button"
                  [class.active]="activeNoteTab === 'limbic'"
                  (click)="activeNoteTab = 'limbic'">
                  Sillage &amp; Nerve Profile
                </button>
                <button
                  type="button"
                  [class.active]="activeNoteTab === 'ritual'"
                  (click)="activeNoteTab = 'ritual'">
                  Application Ritual
                </button>
              </div>

              <!-- Tab 1: Fragrantica Main Accords Proportion Bars -->
              <div class="notes-tab-content" *ngIf="activeNoteTab === 'accords'">
                <div class="fragrantica-full-bars">
                  <div class="accords-header-line">
                    <span class="accords-sub">MOLECULAR PROMINENCE</span>
                    <span class="accords-badge">Fragrantica Certified</span>
                  </div>
                  <div *ngFor="let acc of accords" class="f-full-bar-row">
                    <div class="f-bar-labels">
                      <span class="f-accord-name">{{ acc.name }}</span>
                      <span class="f-accord-val">{{ acc.percent }}%</span>
                    </div>
                    <div class="f-track">
                      <div class="f-fill" [style.width.%]="acc.percent" [style.background]="acc.color"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab 2: 3-Tier Note Architecture -->
              <div class="notes-tab-content" *ngIf="activeNoteTab === 'pyramid'">
                <div class="pyramid-tiers">
                  <div class="tier-row top-tier">
                    <div class="tier-badge">
                      <span class="tier-title">TOP TIER</span>
                      <small>The Awakening · 0–30 mins</small>
                    </div>
                    <div class="tier-chips">
                      <span *ngFor="let n of topNotes" class="note-chip">✦ {{ n }}</span>
                    </div>
                    <p class="tier-desc">Volatile, effervescent molecules that clear the mind upon first inhale.</p>
                  </div>

                  <div class="tier-row heart-tier">
                    <div class="tier-badge">
                      <span class="tier-title">HEART TIER</span>
                      <small>The Emotional Core · 1–4 hours</small>
                    </div>
                    <div class="tier-chips">
                      <span *ngFor="let n of heartNotes" class="note-chip">◇ {{ n }}</span>
                    </div>
                    <p class="tier-desc">The floral and spiced soul that defines your signature presence.</p>
                  </div>

                  <div class="tier-row base-tier">
                    <div class="tier-badge">
                      <span class="tier-title">BASE TIER</span>
                      <small>The Memory · 6–24+ hours</small>
                    </div>
                    <div class="tier-chips">
                      <span *ngFor="let n of baseNotes" class="note-chip">♥ {{ n }}</span>
                    </div>
                    <p class="tier-desc">Heavy agarwood, amber, and skin-musk that fuse intimately with your body heat.</p>
                  </div>
                </div>
              </div>

              <!-- Tab 3: Limbic System & Sillage Meters -->
              <div class="notes-tab-content" *ngIf="activeNoteTab === 'limbic'">
                <div class="limbic-analysis-box">
                  <h4>🧠 Neuro-Olfactory Response</h4>
                  <p>
                    Natural botanical compounds in this formulation activate the amygdala and hippocampus
                    within 150ms of inhalation, reducing cortisol and grounding heart rate. You experience
                    quiet, composed confidence rather than synthetic sensory fatigue.
                  </p>
                </div>

                <div class="meters-grid">
                  <div class="meter-item">
                    <div class="meter-header">
                      <span>Longevity</span>
                      <strong>14+ Hours (Extrait Grade)</strong>
                    </div>
                    <div class="meter-bar"><div class="meter-fill" style="width: 92%;"></div></div>
                  </div>
                  <div class="meter-item">
                    <div class="meter-header">
                      <span>Sillage / Trail</span>
                      <strong>Royal Projection (6 ft)</strong>
                    </div>
                    <div class="meter-bar"><div class="meter-fill" style="width: 86%;"></div></div>
                  </div>
                  <div class="meter-item">
                    <div class="meter-header">
                      <span>Season Radar</span>
                      <strong>All-Season Elegance</strong>
                    </div>
                    <div class="meter-bar"><div class="meter-fill" style="width: 80%;"></div></div>
                  </div>
                </div>
              </div>

              <!-- Tab 4: Application Ritual -->
              <div class="notes-tab-content" *ngIf="activeNoteTab === 'ritual'">
                <ol class="ritual-steps-list">
                  <li>
                    <strong>Pulse Points:</strong> Apply 1–2 drops or sprays onto wrists, inner elbows, and base of throat where pulse heats the extrait.
                  </li>
                  <li>
                    <strong>Never Rub:</strong> Allow the oil to dry naturally. Friction bruises delicate floral top notes.
                  </li>
                  <li>
                    <strong>Skin Hydration:</strong> Apply immediately after showering onto unscented moisturized skin to double longevity.
                  </li>
                  <li>
                    <strong>The Z&amp;S Aura:</strong> Spritz once over natural fabric (linen, silk, or cashmere) for a soft sillage that lingers for days.
                  </li>
                </ol>
              </div>
            </div>

            <!-- Ingredients Transparency -->
            <div class="pdp-ingredients-box" *ngIf="product.ingredients">
              <span class="ing-label">Clean Luxury Ingredients:</span>
              <p>{{ product.ingredients }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed !important;
      inset: 0 !important;
      z-index: 99999 !important;
      background: rgba(3, 14, 11, 0.88) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: clamp(20px, 3.5vw, 48px) 16px !important;
      overflow-y: auto !important;
      box-sizing: border-box !important;
    }

    .luxury-pdp-modal {
      position: relative !important;
      z-index: 100000 !important;
      width: 100%;
      max-width: 1060px;
      max-height: 92vh;
      overflow-y: auto;
      border-radius: 28px;
      background: linear-gradient(160deg, rgba(8, 26, 21, 0.98) 0%, rgba(4, 16, 12, 0.99) 100%);
      backdrop-filter: blur(32px) saturate(190%);
      -webkit-backdrop-filter: blur(32px) saturate(190%);
      border: 1px solid rgba(216, 191, 167, 0.28);
      box-shadow: 0 35px 90px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.2);
      color: #f7f2ea;
      padding: 2.6rem;
      box-sizing: border-box;
      margin: auto !important;
    }

    .modal-close {
      position: absolute !important;
      top: 18px !important;
      right: 18px !important;
      z-index: 100002 !important;
      width: 42px !important;
      height: 42px !important;
      border-radius: 50% !important;
      background: rgba(8, 28, 22, 0.95) !important;
      border: 1px solid rgba(229, 193, 120, 0.45) !important;
      color: #f7f2ea !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.6) !important;
      backdrop-filter: blur(8px) !important;
      -webkit-backdrop-filter: blur(8px) !important;
      padding: 0 !important;
    }

    .modal-close:hover {
      background: rgba(229, 193, 120, 0.25) !important;
      border-color: #e5c178 !important;
      color: #e5c178 !important;
      transform: rotate(90deg) scale(1.1) !important;
      box-shadow: 0 6px 24px rgba(229, 193, 120, 0.35) !important;
    }

    .modal-close:active {
      transform: rotate(90deg) scale(0.95) !important;
    }

    .pdp-layout {
      display: grid;
      grid-template-columns: 420px 1fr;
      gap: 2.6rem;
      align-items: flex-start;
    }

    /* Left Gallery Column */
    .pdp-gallery-col {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }

    .pdp-main-image-wrap {
      position: relative;
      width: 100%;
      height: 440px;
      border-radius: 22px;
      overflow: hidden;
      background: radial-gradient(circle at 50% 40%, rgba(9, 61, 53, 0.5) 0%, rgba(4, 18, 15, 0.95) 100%);
      border: 1px solid rgba(216, 191, 167, 0.18);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pdp-main-img {
      width: 88%;
      height: 88%;
      object-fit: contain;
      filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.65));
      transition: transform 0.4s ease;
    }

    .pdp-main-image-wrap:hover .pdp-main-img {
      transform: scale(1.04);
    }

    .pdp-badge-discount {
      position: absolute;
      top: 14px;
      left: 14px;
      background: #c89d54;
      color: #100d0a;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 0.3rem 0.65rem;
      border-radius: 999px;
    }

    .pdp-concentration-chip {
      position: absolute;
      bottom: 14px;
      right: 14px;
      background: rgba(10, 30, 25, 0.85);
      border: 1px solid rgba(216, 191, 167, 0.3);
      color: #f7f2ea;
      font-size: 0.72rem;
      padding: 0.3rem 0.7rem;
      border-radius: 999px;
      backdrop-filter: blur(8px);
    }

    .pdp-thumbnails {
      display: flex;
      gap: 0.75rem;
    }
    .thumb-btn {
      width: 76px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      cursor: pointer;
      color: #d8bfa7;
      font-size: 0.72rem;
      transition: all 0.2s ease;
    }
    .thumb-btn:hover {
      background: rgba(216, 191, 167, 0.12);
      border-color: rgba(216, 191, 167, 0.3);
    }
    .thumb-btn.active {
      border-color: #d8bfa7;
      background: rgba(216, 191, 167, 0.18);
      color: #fff;
    }
    .thumb-btn img {
      width: 44px;
      height: 44px;
      object-fit: contain;
      border-radius: 8px;
    }

    .pdp-poetry-strip {
      display: flex;
      align-items: flex-start;
      gap: 0.7rem;
      padding: 0.9rem 1.1rem;
      border-radius: 14px;
      background: rgba(216, 191, 167, 0.05);
      border: 1px dashed rgba(216, 191, 167, 0.25);
    }
    .pdp-poetry-mark {
      font-family: serif;
      font-size: 2rem;
      line-height: 1;
      color: #c89d54;
    }
    .pdp-poetry-strip p {
      font-family: 'Amiri', 'Playfair Display', serif;
      font-size: 0.92rem;
      color: #d8bfa7;
      margin: 0 0 0.2rem;
      line-height: 1.4;
    }
    .pdp-poetry-strip small {
      display: block;
      font-size: 0.72rem;
      color: rgba(247, 242, 234, 0.6);
      font-style: italic;
    }

    /* Right Details Column */
    .pdp-details-col {
      display: flex;
      flex-direction: column;
    }

    .pdp-eyebrow-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.65rem;
    }

    .eyebrow-emerald {
      color: #8ed0b5;
      font-size: 0.75rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      font-weight: 600;
    }

    .pdp-code {
      font-size: 0.72rem;
      letter-spacing: 0.1em;
      color: rgba(247, 242, 234, 0.45);
    }

    .pdp-title {
      font-family: 'Playfair Display', 'Cinzel', serif;
      font-size: 2.1rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      line-height: 1.15;
      margin: 0 0 0.8rem;
      color: #ffffff;
    }

    .pdp-rating-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      margin-bottom: 1.2rem;
      color: #d8bfa7;
      flex-wrap: wrap;
    }

    .pdp-rating-row .stars {
      color: #e5c178;
      letter-spacing: 2px;
    }

    .pdp-rating-row .review-count {
      color: rgba(247, 242, 234, 0.55);
    }

    .dot-sep {
      color: rgba(247, 242, 234, 0.3);
    }

    .verified-pill {
      color: #8ed0b5;
      font-size: 0.75rem;
    }

    .pdp-price-row {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      margin-bottom: 1.2rem;
      padding-bottom: 1.1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .price-stack {
      display: flex;
      align-items: baseline;
      gap: 0.85rem;
    }

    .current-price {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 700;
      color: #e5c178;
    }

    .original-price {
      font-size: 1.1rem;
      color: rgba(247, 242, 234, 0.4);
    }

    .tax-info {
      font-size: 0.76rem;
      color: rgba(247, 242, 234, 0.55);
    }

    .pdp-lead-description {
      font-size: 0.95rem;
      line-height: 1.65;
      color: rgba(247, 242, 234, 0.82);
      margin: 0 0 1.3rem;
    }

    /* Size Selector */
    .pdp-option-group {
      margin-bottom: 1.3rem;
    }

    .option-label {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      margin-bottom: 0.55rem;
      color: rgba(247, 242, 234, 0.8);
    }

    .option-label small {
      color: #c89d54;
    }

    .size-pill-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .size-pill {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.2rem;
      padding: 0.8rem 1rem;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #f7f2ea;
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .size-pill:hover {
      background: rgba(216, 191, 167, 0.1);
      border-color: rgba(216, 191, 167, 0.4);
    }

    .size-pill.active {
      background: linear-gradient(145deg, rgba(9, 61, 53, 0.6), rgba(216, 191, 167, 0.18));
      border-color: #d8bfa7;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .size-pill strong {
      font-size: 1.05rem;
    }

    .size-pill span {
      font-size: 0.75rem;
      color: rgba(247, 242, 234, 0.6);
    }

    .save-tag {
      color: #c89d54 !important;
      font-weight: 600;
    }

    /* Purchase Bar */
    .pdp-purchase-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      margin-bottom: 1.4rem;
    }

    .quantity-stepper {
      display: flex;
      align-items: center;
      height: 48px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 999px;
      padding: 0 0.5rem;
    }

    .quantity-stepper button {
      background: none;
      border: none;
      color: #f7f2ea;
      width: 32px;
      height: 32px;
      font-size: 1.1rem;
      cursor: pointer;
    }

    .quantity-stepper span {
      min-width: 24px;
      text-align: center;
      font-size: 0.92rem;
      font-weight: 600;
    }

    .btn-pdp-add {
      flex: 1;
      height: 48px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(216, 191, 167, 0.35);
      color: #f7f2ea;
      font-size: 0.88rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-pdp-add:hover {
      background: rgba(216, 191, 167, 0.2);
      border-color: #d8bfa7;
    }

    .btn-pdp-buy {
      flex: 1.2;
      height: 48px;
      border-radius: 999px;
      background: linear-gradient(135deg, #09473d 0%, #0d5e50 100%);
      border: 1px solid #14806e;
      color: #fffbf5;
      font-size: 0.9rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      cursor: pointer;
      box-shadow: 0 10px 20px rgba(9, 61, 53, 0.45);
      transition: all 0.2s ease;
    }

    .btn-pdp-buy:hover {
      transform: translateY(-2px);
      box-shadow: 0 14px 28px rgba(9, 61, 53, 0.65);
      background: linear-gradient(135deg, #0d5e50 0%, #117866 100%);
    }

    .wishlist-icon-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.14);
      color: #f7f2ea;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .wishlist-icon-btn:hover,
    .wishlist-icon-btn.wished {
      background: rgba(200, 157, 84, 0.2);
      border-color: #c89d54;
      color: #e5c178;
    }

    /* Pillars */
    .luxury-pillars-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      padding: 0.85rem 1rem;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .pillar-card {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .pillar-icon {
      font-size: 1.3rem;
    }

    .pillar-card strong {
      display: block;
      font-size: 0.82rem;
      color: #ffffff;
    }

    .pillar-card small {
      display: block;
      font-size: 0.7rem;
      color: rgba(247, 242, 234, 0.55);
      margin-top: 1px;
    }

    /* Notes Architecture Section */
    .pdp-notes-section {
      border: 1px solid rgba(216, 191, 167, 0.16);
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.02);
      overflow: hidden;
      margin-bottom: 1.2rem;
    }

    .notes-nav {
      display: flex;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(0, 0, 0, 0.2);
      flex-wrap: wrap;
    }

    .notes-nav button {
      flex: 1;
      padding: 0.75rem 0.5rem;
      background: none;
      border: none;
      color: rgba(247, 242, 234, 0.65);
      font-size: 0.78rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
      white-space: nowrap;
    }

    .notes-nav button:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.04);
    }

    .notes-nav button.active {
      color: #e5c178;
      background: rgba(216, 191, 167, 0.08);
      border-bottom: 2px solid #c89d54;
    }

    .notes-tab-content {
      padding: 1.2rem;
    }

    /* Fragrantica Accord Bars inside Modal */
    .fragrantica-full-bars {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .accords-header-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.4rem;
    }

    .accords-sub {
      font-size: 0.75rem;
      letter-spacing: 0.12em;
      color: #c89d54;
      font-weight: 600;
    }

    .accords-badge {
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 999px;
      background: rgba(200, 157, 84, 0.15);
      border: 1px solid rgba(200, 157, 84, 0.35);
      color: #e5c178;
    }

    .f-full-bar-row {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .f-bar-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: rgba(247, 242, 234, 0.85);
    }

    .f-accord-val {
      font-weight: 600;
      color: #e5c178;
    }

    .f-track {
      height: 7px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      overflow: hidden;
    }

    .f-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Pyramid Tiers */
    .pyramid-tiers {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .tier-row {
      padding: 0.8rem;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .tier-badge {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .tier-title {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #c89d54;
    }

    .tier-badge small {
      font-size: 0.7rem;
      color: rgba(247, 242, 234, 0.5);
    }

    .tier-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
      margin-bottom: 0.45rem;
    }

    .tier-chips .note-chip {
      background: rgba(216, 191, 167, 0.12);
      border: 1px solid rgba(216, 191, 167, 0.25);
      border-radius: 999px;
      padding: 0.25rem 0.65rem;
      font-size: 0.78rem;
      color: #f7f2ea;
    }

    .tier-desc {
      font-size: 0.74rem;
      line-height: 1.5;
      color: rgba(247, 242, 234, 0.6);
      margin: 0;
    }

    .limbic-analysis-box {
      background: rgba(9, 61, 53, 0.25);
      border: 1px solid rgba(142, 208, 181, 0.25);
      border-radius: 14px;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .limbic-analysis-box h4 {
      font-size: 0.88rem;
      color: #8ed0b5;
      margin: 0 0 0.4rem;
    }

    .limbic-analysis-box p {
      font-size: 0.84rem;
      line-height: 1.6;
      color: rgba(247, 242, 234, 0.75);
      margin: 0;
    }

    .meters-grid {
      display: grid;
      gap: 0.75rem;
    }

    .meter-item {
      display: grid;
      gap: 0.3rem;
    }

    .meter-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.76rem;
      color: rgba(247, 242, 234, 0.75);
    }

    .meter-bar {
      height: 5px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      overflow: hidden;
    }

    .meter-fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #09473d, #c89d54);
    }

    .ritual-steps-list {
      padding-left: 1.1rem;
      margin: 0;
      display: grid;
      gap: 0.65rem;
      font-size: 0.82rem;
      line-height: 1.6;
      color: rgba(247, 242, 234, 0.78);
    }

    .pdp-ingredients-box {
      font-size: 0.76rem;
      line-height: 1.55;
      color: rgba(247, 242, 234, 0.5);
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 0.7rem;
    }

    .ing-label {
      color: #d8bfa7;
      font-weight: 600;
      margin-right: 0.35rem;
    }

    @media (max-width: 900px) {
      .luxury-pdp-modal {
        padding: 1.4rem;
        padding-top: 3.6rem;
        max-height: 94vh;
      }
      .modal-close {
        top: 14px !important;
        right: 14px !important;
        width: 38px !important;
        height: 38px !important;
      }
      .pdp-layout {
        grid-template-columns: 1fr;
      }
      .pdp-main-image-wrap {
        height: 320px;
      }
      .luxury-pillars-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductDetailModalComponent implements OnChanges {
  @Input() product: Product | null = null;
  @Input() wished = false;
  @Output() close = new EventEmitter<void>();
  @Output() add = new EventEmitter<Product>();
  @Output() buyNow = new EventEmitter<{ product: Product; quantity: number }>();
  @Output() toggleWish = new EventEmitter<Product>();

  selectedSize: '50ml' | '100ml' = '100ml';
  selectedView: 'bottle' | 'seal' = 'bottle';
  quantity = 1;
  activeNoteTab: 'accords' | 'pyramid' | 'limbic' | 'ritual' = 'accords';

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.product) {
      this.close.emit();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product) {
      this.selectedSize = '100ml';
      this.selectedView = 'bottle';
      this.quantity = 1;
      this.activeNoteTab = 'accords';
    }
  }

  get activeGalleryImage(): string {
    if (!this.product) return '';
    if (this.selectedView === 'seal') {
      return '/assets/logo.png';
    }
    return this.product.image;
  }

  get currentPrice(): number {
    if (!this.product) return 0;
    // 50ml is 65% of the 100ml grand flacon price
    return this.selectedSize === '50ml'
      ? Math.round(this.product.price * 0.65)
      : this.product.price;
  }

  get currentOriginalPrice(): number {
    if (!this.product) return 0;
    const baseOriginal = this.product.originalPrice || Math.round(this.product.price * 1.3);
    return this.selectedSize === '50ml'
      ? Math.round(baseOriginal * 0.65)
      : baseOriginal;
  }

  get discountPercent(): number {
    if (this.currentOriginalPrice <= this.currentPrice) return 0;
    return Math.round(((this.currentOriginalPrice - this.currentPrice) / this.currentOriginalPrice) * 100);
  }

  get accords(): FragranticaAccord[] {
    if (!this.product) return [];
    const notesStr = (this.product.notes || []).join(' ').toLowerCase();
    const nameStr = (this.product.name || '').toLowerCase();

    const result: FragranticaAccord[] = [];

    if (notesStr.includes('oud') || nameStr.includes('oud')) {
      result.push({ name: 'Oud & Precious Woods', percent: 96, color: '#8B5A2B' });
      result.push({ name: 'Warm Amber & Resins', percent: 85, color: '#D49B35' });
      result.push({ name: 'Warm Spicy Balsams', percent: 74, color: '#9C3D28' });
      result.push({ name: 'Smoky Temple Incense', percent: 66, color: '#3A3238' });
    } else if (notesStr.includes('rose') || nameStr.includes('rose')) {
      result.push({ name: 'Damask Rose Otto', percent: 98, color: '#C96B82' });
      result.push({ name: 'Crisp Orchard Pear', percent: 82, color: '#8DAA4A' });
      result.push({ name: 'Soft Cashmere Musk', percent: 75, color: '#D4C4B5' });
      result.push({ name: 'Solar Fresh Florals', percent: 64, color: '#E5A5B5' });
    } else if (notesStr.includes('amber') || nameStr.includes('amber') || notesStr.includes('vanilla')) {
      result.push({ name: 'Molten Amber Resins', percent: 95, color: '#D49B35' });
      result.push({ name: 'Bourbon Vanilla Bean', percent: 88, color: '#C58F48' });
      result.push({ name: 'Mysore Sandalwood', percent: 78, color: '#A07242' });
      result.push({ name: 'Sweet Balsamic Woods', percent: 65, color: '#8F6543' });
    } else if (notesStr.includes('saffron') || nameStr.includes('saffron')) {
      result.push({ name: 'Kashmiri Mongra Saffron', percent: 94, color: '#B34A26' });
      result.push({ name: 'Smoked Cedar Incense', percent: 86, color: '#4D3B43' });
      result.push({ name: 'Antique Saddle Leather', percent: 78, color: '#6E452B' });
      result.push({ name: 'Earth & Resins', percent: 68, color: '#544136' });
    } else if (notesStr.includes('citrus') || notesStr.includes('bergamot') || nameStr.includes('citrus') || nameStr.includes('drift')) {
      result.push({ name: 'Calabrian Bergamot', percent: 96, color: '#E2BD38' });
      result.push({ name: 'Sunlit Coastal Driftwood', percent: 84, color: '#8B7355' });
      result.push({ name: 'Sea Salt & Neroli', percent: 76, color: '#66B2B2' });
      result.push({ name: 'Clean White Musk', percent: 62, color: '#C9D6DF' });
    } else {
      // Default haute parfumerie accords
      result.push({ name: 'Botanical Florals', percent: 90, color: '#C58F48' });
      result.push({ name: 'Precious Woods & Cedar', percent: 80, color: '#8B5A2B' });
      result.push({ name: 'Skin Musk & Ambergris', percent: 70, color: '#D49B35' });
      result.push({ name: 'Subtle Spice', percent: 58, color: '#9C3D28' });
    }

    return result;
  }

  get topNotes(): string[] {
    if (!this.product || !this.product.notes.length) return ['Calabrian Bergamot', 'Pink Pepper'];
    return this.product.notes.slice(0, Math.ceil(this.product.notes.length / 3));
  }

  get heartNotes(): string[] {
    if (!this.product || !this.product.notes.length) return ['Damask Rose', 'Spiced Cardamom'];
    const start = Math.ceil(this.product.notes.length / 3);
    const end = Math.ceil((this.product.notes.length * 2) / 3);
    const slice = this.product.notes.slice(start, end);
    return slice.length ? slice : [this.product.notes[0]];
  }

  get baseNotes(): string[] {
    if (!this.product || !this.product.notes.length) return ['Mysore Sandalwood', 'Assam Oud', 'Amber'];
    const start = Math.ceil((this.product.notes.length * 2) / 3);
    const slice = this.product.notes.slice(start);
    return slice.length ? slice : ['Mysore Sandalwood', 'Warm Amber'];
  }

  setSize(size: '50ml' | '100ml'): void {
    this.selectedSize = size;
  }

  setView(view: 'bottle' | 'seal'): void {
    this.selectedView = view;
  }

  incQty(): void {
    if (this.quantity < 10) this.quantity++;
  }

  decQty(): void {
    if (this.quantity > 1) this.quantity--;
  }

  handleAddToCart(): void {
    if (!this.product) return;
    const adjustedProduct: Product = {
      ...this.product,
      size: this.selectedSize,
      price: this.currentPrice,
      originalPrice: this.currentOriginalPrice
    };
    for (let i = 0; i < this.quantity; i++) {
      this.add.emit(adjustedProduct);
    }
    this.close.emit();
  }

  handleBuyNow(): void {
    if (!this.product) return;
    const adjustedProduct: Product = {
      ...this.product,
      size: this.selectedSize,
      price: this.currentPrice,
      originalPrice: this.currentOriginalPrice
    };
    this.buyNow.emit({ product: adjustedProduct, quantity: this.quantity });
    this.close.emit();
  }
}
