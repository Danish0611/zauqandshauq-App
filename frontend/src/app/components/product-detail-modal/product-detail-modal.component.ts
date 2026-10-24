import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Product } from '../../product.model';

export interface NoteTier {
  title: string;
  duration: string;
  notes: string[];
  description: string;
  limbicRole: string;
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
        
        <button type="button" class="close-button modal-close" (click)="close.emit()" aria-label="Close details">×</button>

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
                {{ product.concentration || 'Eau de Parfum' }}
              </span>
            </div>

            <!-- Multi-angle Thumbnails -->
            <div class="pdp-thumbnails">
              <button
                type="button"
                class="thumb-btn"
                [class.active]="selectedView === 'bottle'"
                (click)="setView('bottle')">
                <img [src]="product.image" alt="Bottle view" />
                <span>Flacon</span>
              </button>
              <button
                type="button"
                class="thumb-btn"
                [class.active]="selectedView === 'packaging'"
                (click)="setView('packaging')">
                <div class="thumb-placeholder packaging-bg">
                  <span class="thumb-icon">📦</span>
                </div>
                <span>Coffret</span>
              </button>
              <button
                type="button"
                class="thumb-btn"
                [class.active]="selectedView === 'botanicals'"
                (click)="setView('botanicals')">
                <div class="thumb-placeholder botanicals-bg">
                  <span class="thumb-icon">🌿</span>
                </div>
                <span>Botanicals</span>
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
                  <small>10–14 Hours on pulse points</small>
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

            <!-- Olfactory Note Architecture Tabs (The French/Arabian Standard) -->
            <div class="pdp-notes-section">
              <div class="notes-nav">
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
                  Nerve &amp; Sillage Profile
                </button>
                <button
                  type="button"
                  [class.active]="activeNoteTab === 'ritual'"
                  (click)="activeNoteTab = 'ritual'">
                  Application Ritual
                </button>
              </div>

              <!-- Tab 1: 3-Tier Note Architecture -->
              <div class="notes-tab-content" *ngIf="activeNoteTab === 'pyramid'">
                <div class="pyramid-tiers">
                  <div class="tier-row top-tier">
                    <div class="tier-badge">
                      <span class="tier-title">TOP TIER</span>
                      <small>The Awakening · 0–30 mins</small>
                    </div>
                    <div class="tier-chips">
                      <span *ngFor="let n of topNotes" class="note-chip">{{ n }}</span>
                    </div>
                    <p class="tier-desc">Volatile, effervescent molecules that clear the mind upon first inhale.</p>
                  </div>

                  <div class="tier-row heart-tier">
                    <div class="tier-badge">
                      <span class="tier-title">HEART TIER</span>
                      <small>The Emotional Core · 1–4 hours</small>
                    </div>
                    <div class="tier-chips">
                      <span *ngFor="let n of heartNotes" class="note-chip">{{ n }}</span>
                    </div>
                    <p class="tier-desc">The floral and spiced soul that defines your signature presence.</p>
                  </div>

                  <div class="tier-row base-tier">
                    <div class="tier-badge">
                      <span class="tier-title">BASE TIER</span>
                      <small>The Memory · 6–24+ hours</small>
                    </div>
                    <div class="tier-chips">
                      <span *ngFor="let n of baseNotes" class="note-chip">{{ n }}</span>
                    </div>
                    <p class="tier-desc">Heavy agarwood, amber, and skin-musk that fuse intimately with your body heat.</p>
                  </div>
                </div>
              </div>

              <!-- Tab 2: Limbic System & Sillage Meters -->
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
                      <strong>12+ Hours</strong>
                    </div>
                    <div class="meter-bar"><div class="meter-fill" style="width: 88%;"></div></div>
                  </div>
                  <div class="meter-item">
                    <div class="meter-header">
                      <span>Sillage / Trail</span>
                      <strong>Refined &amp; Intimate</strong>
                    </div>
                    <div class="meter-bar"><div class="meter-fill" style="width: 78%;"></div></div>
                  </div>
                  <div class="meter-item">
                    <div class="meter-header">
                      <span>Oil Concentration</span>
                      <strong>Extrait / 25% Pure Oil</strong>
                    </div>
                    <div class="meter-bar"><div class="meter-fill" style="width: 92%;"></div></div>
                  </div>
                </div>
              </div>

              <!-- Tab 3: Application Ritual -->
              <div class="notes-tab-content" *ngIf="activeNoteTab === 'ritual'">
                <ol class="ritual-steps-list">
                  <li>
                    <strong>Pulse Point Activation:</strong> Mist onto warm pulse points—radial wrists, base of the throat, and behind earlobes. Do not rub wrists together, as friction crushes volatile top esters.
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
    .luxury-pdp-modal {
      width: 100%;
      max-width: 1040px;
      max-height: 92vh;
      overflow-y: auto;
      border-radius: 28px;
      background: linear-gradient(160deg, rgba(14, 28, 24, 0.96) 0%, rgba(8, 18, 15, 0.98) 100%);
      backdrop-filter: blur(32px) saturate(190%);
      -webkit-backdrop-filter: blur(32px) saturate(190%);
      border: 1px solid rgba(216, 191, 167, 0.22);
      box-shadow: 0 35px 80px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.2);
      color: #f7f2ea;
      padding: 2.4rem;
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
      width: 85%;
      height: 85%;
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
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }

    .thumb-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      cursor: pointer;
      color: rgba(247, 242, 234, 0.65);
      font-size: 0.74rem;
      transition: all 0.2s ease;
    }

    .thumb-btn img,
    .thumb-placeholder {
      width: 100%;
      height: 55px;
      border-radius: 8px;
      object-fit: cover;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .packaging-bg {
      background: linear-gradient(135deg, #1c2e26, #0d1e18);
      font-size: 1.3rem;
    }

    .botanicals-bg {
      background: linear-gradient(135deg, #2a3c30, #14221a);
      font-size: 1.3rem;
    }

    .thumb-btn.active {
      border-color: #d8bfa7;
      background: rgba(216, 191, 167, 0.12);
      color: #f7f2ea;
    }

    .pdp-poetry-strip {
      padding: 1rem 1.2rem;
      border-radius: 16px;
      background: rgba(9, 61, 53, 0.25);
      border: 1px solid rgba(216, 191, 167, 0.15);
      text-align: center;
    }

    .pdp-poetry-mark {
      font-family: serif;
      font-size: 1.8rem;
      color: #c89d54;
      line-height: 0.8;
      display: block;
    }

    .pdp-poetry-strip p {
      font-size: 1.05rem;
      line-height: 1.6;
      color: #f7f2ea;
      margin: 0.2rem 0;
    }

    .pdp-poetry-strip small {
      font-size: 0.78rem;
      font-style: italic;
      color: #d8bfa7;
    }

    /* Right Details Column */
    .pdp-eyebrow-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.4rem;
    }

    .eyebrow-emerald {
      color: #c89d54;
      font-size: 0.74rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .eyebrow-emerald .eyebrow-line {
      width: 20px;
      height: 1px;
      background: #c89d54;
    }

    .pdp-code {
      font-size: 0.72rem;
      color: rgba(247, 242, 234, 0.45);
      letter-spacing: 0.1em;
    }

    .pdp-title {
      font-family: var(--font-display, 'Cormorant Garamond', Georgia, serif);
      font-size: clamp(2rem, 3.2vw, 2.7rem);
      font-weight: 500;
      line-height: 1.1;
      margin: 0 0 0.65rem;
      color: #fffbf5;
    }

    .pdp-rating-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      margin-bottom: 1.1rem;
    }

    .stars {
      color: #c89d54;
      letter-spacing: 0.1em;
    }

    .review-count {
      color: rgba(247, 242, 234, 0.6);
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
      gap: 0.25rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 1.1rem;
    }

    .price-stack {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
    }

    .current-price {
      font-size: 1.75rem;
      font-weight: 600;
      color: #fffbf5;
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
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #f7f2ea;
      font-size: 1.2rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .wishlist-icon-btn.wished {
      color: #e57373;
      border-color: #e57373;
    }

    /* Pillars */
    .luxury-pillars-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      padding: 0.9rem 0;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 1.4rem;
    }

    .pillar-card {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .pillar-icon {
      font-size: 1.25rem;
    }

    .pillar-card strong {
      display: block;
      font-size: 0.78rem;
      color: #fffbf5;
    }

    .pillar-card small {
      font-size: 0.7rem;
      color: rgba(247, 242, 234, 0.55);
    }

    /* Note Tabs */
    .pdp-notes-section {
      background: rgba(0, 0, 0, 0.22);
      border-radius: 18px;
      padding: 1.2rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 1rem;
    }

    .notes-nav {
      display: flex;
      gap: 0.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 0.6rem;
      margin-bottom: 1rem;
    }

    .notes-nav button {
      background: none;
      border: none;
      color: rgba(247, 242, 234, 0.6);
      font-size: 0.8rem;
      padding: 0.3rem 0.65rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .notes-nav button.active {
      background: rgba(216, 191, 167, 0.15);
      color: #d8bfa7;
      font-weight: 600;
    }

    .pyramid-tiers {
      display: grid;
      gap: 0.9rem;
    }

    .tier-row {
      padding: 0.8rem;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.03);
      border-left: 3px solid #d8bfa7;
    }

    .top-tier { border-left-color: #8ed0b5; }
    .heart-tier { border-left-color: #d8bfa7; }
    .base-tier { border-left-color: #c89d54; }

    .tier-badge {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.45rem;
    }

    .tier-title {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: #fffbf5;
    }

    .tier-badge small {
      font-size: 0.7rem;
      color: rgba(247, 242, 234, 0.5);
    }

    .tier-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-bottom: 0.4rem;
    }

    .note-chip {
      font-size: 0.74rem;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.07);
      color: #f7f2ea;
    }

    .tier-desc {
      font-size: 0.78rem;
      color: rgba(247, 242, 234, 0.6);
      margin: 0;
    }

    .limbic-analysis-box {
      margin-bottom: 1.1rem;
    }

    .limbic-analysis-box h4 {
      font-size: 0.84rem;
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
  selectedView: 'bottle' | 'packaging' | 'botanicals' = 'bottle';
  quantity = 1;
  activeNoteTab: 'pyramid' | 'limbic' | 'ritual' = 'pyramid';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product) {
      this.selectedSize = '100ml';
      this.selectedView = 'bottle';
      this.quantity = 1;
      this.activeNoteTab = 'pyramid';
    }
  }

  get activeGalleryImage(): string {
    if (!this.product) return '';
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

  setView(view: 'bottle' | 'packaging' | 'botanicals'): void {
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
