import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../product.model';

@Component({
  selector: 'app-discovery-set',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <section class="discovery-section">
      <div class="discovery-ambient-orb orb-gold"></div>
      <div class="discovery-ambient-orb orb-emerald"></div>

      <div class="page-shell">
        <!-- Top Breadcrumb & Eyebrow -->
        <div class="discovery-top">
          <div class="eyebrow eyebrow-gold">
            <span class="eyebrow-line"></span> THE SAMPLING WARDROBE
          </div>
          <h2>The Royal <em>Discovery Coffret</em></h2>
          <p class="discovery-lead">
            Never blind buy. Experience 5 of our most celebrated botanical compositions on your skin
            before committing to a full flacon. Includes 100% full-bottle credit.
          </p>
        </div>

        <!-- Master Glass Showcase -->
        <div class="coffret-glass-card">
          <div class="coffret-visual-side">
            <div class="coffret-box-art">
              <div class="coffret-crest-mark">Z<span>&amp;</span>S</div>
              <div class="vial-rack">
                <div class="vial-item" *ngFor="let v of vials">
                  <div class="vial-tube" [style.background]="v.gradient">
                    <span class="vial-cap"></span>
                    <span class="vial-liquid"></span>
                  </div>
                  <strong>{{ v.name }}</strong>
                  <small>{{ v.notes }}</small>
                </div>
              </div>
              <div class="coffret-label">
                <span>LIMITED EDITION COFFRET</span>
                <strong>5 × 2ml Eau de Parfum &amp; Extrait</strong>
              </div>
            </div>

            <!-- Guarantee Ribbon -->
            <div class="voucher-callout">
              <span class="voucher-tag">100% CREDIT INCLUDED</span>
              <p>
                Receive an exclusive <strong>₹999 voucher code</strong> inside the box, valid toward any 50ml or 100ml full bottle purchase within 60 days.
              </p>
            </div>
          </div>

          <div class="coffret-details-side">
            <div class="coffret-price-stack">
              <span class="coffret-badge">BESTSELLER SAMPLER</span>
              <div class="price-line">
                <strong>{{ coffretProduct.price | currency:'INR':'symbol':'1.0-0' }}</strong>
                <s>{{ coffretProduct.originalPrice | currency:'INR':'symbol':'1.0-0' }}</s>
                <span class="save-tag">60% OFF</span>
              </div>
              <small class="tax-tag">Complimentary express shipping across India</small>
            </div>

            <div class="vial-details-list">
              <h4>What’s Inside Your Coffret:</h4>
              <div class="vial-row" *ngFor="let v of vials; let i = index">
                <span class="vial-num">0{{ i + 1 }}</span>
                <div class="vial-info">
                  <strong>{{ v.name }} <span class="vial-conc">({{ v.concentration }})</span></strong>
                  <p>{{ v.description }}</p>
                  <small>Key Accords: {{ v.notes }}</small>
                </div>
              </div>
            </div>

            <div class="coffret-perks-row">
              <div class="perk">
                <span class="perk-icon">📜</span>
                <div>
                  <strong>5 Scent-Testing Strips</strong>
                  <small>Imported French cotton blotters</small>
                </div>
              </div>
              <div class="perk">
                <span class="perk-icon">🏷️</span>
                <div>
                  <strong>₹999 Gift Voucher</strong>
                  <small>Zero-risk sampling guarantee</small>
                </div>
              </div>
            </div>

            <div class="coffret-cta-row">
              <button type="button" class="btn-royal-add" (click)="addCoffret()">
                Add Coffret to Bag · {{ coffretProduct.price | currency:'INR':'symbol':'1.0-0' }}
              </button>
              <button type="button" class="btn-royal-buy" (click)="buyNowCoffret()">
                Order Now <span>↗</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .discovery-section {
      position: relative;
      padding: 5rem 0 6rem;
      background:
        radial-gradient(circle at 10% 25%, rgba(200, 157, 84, 0.12), transparent 45%),
        radial-gradient(circle at 90% 75%, rgba(9, 61, 53, 0.28), transparent 50%),
        linear-gradient(180deg, #051410 0%, #081d17 50%, #04100c 100%);
      color: #f7f3ec;
      overflow: hidden;
      min-height: 80vh;
    }

    .discovery-ambient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
      pointer-events: none;
    }
    .orb-gold {
      width: 420px;
      height: 420px;
      background: rgba(200, 157, 84, 0.15);
      top: -80px;
      left: -80px;
    }
    .orb-emerald {
      width: 480px;
      height: 480px;
      background: rgba(13, 94, 80, 0.22);
      bottom: -100px;
      right: -80px;
    }

    .discovery-top {
      text-align: center;
      max-width: 720px;
      margin: 0 auto 3rem;
    }

    .eyebrow-gold {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      color: #e5c178;
      font-size: 0.74rem;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 0.8rem;
    }
    .eyebrow-gold .eyebrow-line {
      width: 28px;
      height: 1px;
      background: #e5c178;
    }

    .discovery-top h2 {
      font-family: var(--font-display, 'Cormorant Garamond', Georgia, serif);
      font-size: clamp(2.4rem, 4.5vw, 3.6rem);
      margin: 0 0 1rem;
      color: #fffbf5;
    }
    .discovery-top h2 em {
      color: #e5c178;
      font-style: italic;
    }

    .discovery-lead {
      color: rgba(247, 243, 236, 0.74);
      font-size: 1.02rem;
      line-height: 1.7;
      margin: 0;
    }

    /* Master Glass Card */
    .coffret-glass-card {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      gap: 3rem;
      background: linear-gradient(150deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
      backdrop-filter: blur(28px) saturate(180%);
      -webkit-backdrop-filter: blur(28px) saturate(180%);
      border: 1px solid rgba(216, 191, 167, 0.22);
      box-shadow: 0 35px 70px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.25);
      border-radius: 30px;
      padding: 3rem;
    }

    .coffret-box-art {
      position: relative;
      background: radial-gradient(circle at 50% 30%, #0d382e 0%, #061e18 100%);
      border: 1px solid rgba(216, 191, 167, 0.35);
      border-radius: 22px;
      padding: 2.2rem 1.8rem;
      text-align: center;
      margin-bottom: 1.25rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }

    .coffret-crest-mark {
      font-family: var(--font-display, serif);
      font-size: 2.2rem;
      color: #e5c178;
      letter-spacing: -2px;
      margin-bottom: 1.8rem;
    }
    .coffret-crest-mark span {
      font-style: italic;
      color: #fff;
    }

    .vial-rack {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.8rem;
      margin-bottom: 2rem;
    }

    .vial-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
    }

    .vial-tube {
      width: 22px;
      height: 95px;
      border-radius: 11px;
      border: 1px solid rgba(255, 255, 255, 0.4);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
      position: relative;
      overflow: hidden;
    }

    .vial-cap {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 20px;
      background: linear-gradient(180deg, #d8bfa7, #aa896f);
      border-bottom: 1px solid rgba(0, 0, 0, 0.3);
    }

    .vial-item strong {
      font-size: 0.76rem;
      color: #fffbf5;
      text-align: center;
    }
    .vial-item small {
      font-size: 0.64rem;
      color: rgba(247, 243, 236, 0.55);
      text-align: center;
    }

    .coffret-label {
      border-top: 1px solid rgba(216, 191, 167, 0.25);
      padding-top: 1.1rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .coffret-label span {
      font-size: 0.68rem;
      letter-spacing: 0.18em;
      color: #e5c178;
    }
    .coffret-label strong {
      font-size: 0.95rem;
      color: #fffbf5;
    }

    .voucher-callout {
      padding: 1.2rem;
      border-radius: 16px;
      background: rgba(9, 61, 53, 0.3);
      border: 1px solid rgba(216, 191, 167, 0.25);
      text-align: center;
    }

    .voucher-tag {
      display: inline-block;
      font-size: 0.7rem;
      letter-spacing: 0.15em;
      background: rgba(229, 193, 120, 0.18);
      border: 1px solid rgba(229, 193, 120, 0.45);
      color: #e5c178;
      padding: 0.25rem 0.7rem;
      border-radius: 999px;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .voucher-callout p {
      font-size: 0.88rem;
      color: rgba(247, 243, 236, 0.85);
      margin: 0;
      line-height: 1.55;
    }

    /* Right Side */
    .coffret-details-side {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1.5rem;
    }

    .coffret-badge {
      display: inline-block;
      font-size: 0.7rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #e5c178;
      margin-bottom: 0.4rem;
    }

    .price-line {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
    }
    .price-line strong {
      font-size: 2.2rem;
      color: #fffbf5;
      font-family: var(--font-display, serif);
    }
    .price-line s {
      font-size: 1.2rem;
      color: rgba(247, 243, 236, 0.4);
    }
    .save-tag {
      background: #c89d54;
      color: #0b1a15;
      font-weight: 700;
      font-size: 0.72rem;
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
    }

    .tax-tag {
      display: block;
      font-size: 0.76rem;
      color: #8ed0b5;
      margin-top: 0.3rem;
    }

    .vial-details-list h4 {
      font-size: 0.95rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #e5c178;
      margin: 0 0 0.9rem;
    }

    .vial-details-list {
      display: grid;
      gap: 0.85rem;
    }

    .vial-row {
      display: flex;
      gap: 0.85rem;
      align-items: flex-start;
      padding-bottom: 0.65rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .vial-num {
      font-family: var(--font-display, serif);
      font-size: 1.1rem;
      color: #e5c178;
      font-weight: 600;
    }

    .vial-info strong {
      display: block;
      font-size: 0.88rem;
      color: #fffbf5;
    }
    .vial-conc {
      font-size: 0.72rem;
      color: #d8bfa7;
      font-weight: 400;
    }
    .vial-info p {
      font-size: 0.8rem;
      color: rgba(247, 243, 236, 0.7);
      margin: 0.2rem 0;
      line-height: 1.45;
    }
    .vial-info small {
      font-size: 0.72rem;
      color: rgba(247, 243, 236, 0.5);
    }

    .coffret-perks-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      padding: 1rem 0;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .perk {
      display: flex;
      align-items: center;
      gap: 0.7rem;
    }
    .perk-icon {
      font-size: 1.3rem;
    }
    .perk strong {
      display: block;
      font-size: 0.8rem;
      color: #fffbf5;
    }
    .perk small {
      font-size: 0.72rem;
      color: rgba(247, 243, 236, 0.55);
    }

    .coffret-cta-row {
      display: flex;
      gap: 0.85rem;
    }

    .btn-royal-add {
      flex: 1;
      height: 52px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(216, 191, 167, 0.4);
      color: #fffbf5;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.25s ease;
    }
    .btn-royal-add:hover {
      background: rgba(216, 191, 167, 0.2);
    }

    .btn-royal-buy {
      flex: 1;
      height: 52px;
      border-radius: 999px;
      background: linear-gradient(135deg, #09473d 0%, #0d5e50 100%);
      border: 1px solid #14806e;
      color: #fffbf5;
      font-weight: 600;
      font-size: 0.92rem;
      cursor: pointer;
      box-shadow: 0 12px 24px rgba(9, 61, 53, 0.5);
      transition: all 0.25s ease;
    }
    .btn-royal-buy:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 32px rgba(9, 61, 53, 0.7);
    }

    @media (max-width: 900px) {
      .coffret-glass-card {
        grid-template-columns: 1fr;
        padding: 1.8rem;
      }
      .vial-rack {
        grid-template-columns: repeat(5, 1fr);
      }
    }
  `]
})
export class DiscoverySetComponent {
  @Input() set products(list: Product[]) {
    if (list && list.length) {
      const found = list.find(p => p.productCode === 'ZS-COFFRET-05');
      if (found) {
        this.coffretProduct = { ...found };
      }
    }
  }
  @Output() add = new EventEmitter<Product>();
  @Output() buyNow = new EventEmitter<{ product: Product; quantity: number }>();

  coffretProduct: Product = {
    id: 9999,
    productCode: 'ZS-COFFRET-05',
    name: 'The Royal Discovery Coffret',
    brand: 'Zauq & Shauq',
    category: 'Unisex',
    concentration: 'Discovery Wardrobe',
    size: '5 × 2ml Vials',
    price: 999,
    originalPrice: 2499,
    description: 'An intimate 5-piece wardrobe of our most celebrated creations. Includes a 100% redeemable ₹999 voucher code inside.',
    ingredients: 'Natural botanical absolutes, aged oud resins, Mysore sandalwood oil, grain alcohol, distilled water.',
    notes: ['Aged Oud', 'Damask Rose', 'Mysore Sandalwood', 'Kashmiri Saffron', 'Bergamot'],
    image: '/assets/logo.svg',
    rating: 5.0,
    reviews: 148,
    stockQuantity: 50,
    badge: 'EXCLUSIVE',
    featured: true,
    bestseller: true,
    newArrival: true
  };

  readonly vials = [
    {
      name: 'Noir Oud',
      concentration: 'Extrait 30%',
      gradient: 'linear-gradient(180deg, #2b1f17, #0e0a07)',
      notes: 'Assam Oud · Saffron · Leather',
      description: 'Commanding, deep resinous authority that grounds the pulse.'
    },
    {
      name: 'Rose Éclat',
      concentration: 'Eau de Parfum 22%',
      gradient: 'linear-gradient(180deg, #d49890, #5c2c26)',
      notes: 'Damask Rose · Pink Pepper · Vanilla',
      description: 'Luminous romantic poise that blooms with body warmth.'
    },
    {
      name: 'Velvet Amber',
      concentration: 'Extrait 28%',
      gradient: 'linear-gradient(180deg, #d49942, #472b09)',
      notes: 'Golden Amber · Sandalwood · Benzoin',
      description: 'Velvety, candlelit intimacy remembered long after you leave.'
    },
    {
      name: 'Citrus Drift',
      concentration: 'Eau de Parfum 20%',
      gradient: 'linear-gradient(180deg, #d6cb58, #3b360b)',
      notes: 'Bergamot · Neroli · Cedarwood',
      description: 'Sunlit clarity that dissolves morning mental fog in 150ms.'
    },
    {
      name: 'Saffron Smoke',
      concentration: 'Extrait 32%',
      gradient: 'linear-gradient(180deg, #993d2b, #2b0b04)',
      notes: 'Kashmir Saffron · Incense · Vetiver',
      description: 'Smoky royal mystery steeped in centuries of Eastern adab.'
    }
  ];

  addCoffret(): void {
    this.add.emit(this.coffretProduct);
  }

  buyNowCoffret(): void {
    this.buyNow.emit({ product: this.coffretProduct, quantity: 1 });
  }
}
