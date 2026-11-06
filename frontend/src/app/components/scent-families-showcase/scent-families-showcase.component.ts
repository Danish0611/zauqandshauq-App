import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Inject, NgZone, OnDestroy, Output, PLATFORM_ID, ViewChild } from '@angular/core';
import { ScentNotesPyramidComponent } from '../scent-notes-pyramid/scent-notes-pyramid.component';

export interface ScentFamily {
  id: 'woody' | 'floral' | 'oriental' | 'fresh';
  name: string;
  subtitle: string;
  description: string;
  dominantNotes: string[];
  personality: string;
  seasonOccasion: string;
  flaconName: string;
  flaconImage: string;
  flaconPrice: number;
  bgGlow: string;
}

@Component({
  selector: 'app-scent-families-showcase',
  standalone: true,
  imports: [CommonModule, ScentNotesPyramidComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="scent-families-pinned-section page-shell" id="scent-families" #sectionRef>
      <div class="section-heading">
        <div>
          <div class="eyebrow"><span class="eyebrow-line"></span> FOUR OLFACTORY KINGDOMS</div>
          <h2>Curated by Scent Family. <em>Explore your signature profile.</em></h2>
          <p class="section-intro">
            From dark wild woods to sunlit coastal citrus, every flacon is hand-distilled to evoke a distinct emotional state.
          </p>
        </div>
        <span class="family-badge">✦ HAUTE PARFUMERIE</span>
      </div>

      <!-- Family Tabs Switcher -->
      <div class="family-nav-pills" role="tablist" aria-label="Select Scent Family">
        <button
          *ngFor="let fam of families"
          type="button"
          class="family-tab-btn"
          [class.active]="selectedFamily.id === fam.id"
          (click)="selectFamily(fam)"
          role="tab"
          [attr.aria-selected]="selectedFamily.id === fam.id">
          <span class="tab-glyph">✦</span>
          <span>{{ fam.name }}</span>
        </button>
      </div>

      <!-- Pinned Showcase Stage -->
      <div class="family-showcase-stage" [style.background]="selectedFamily.bgGlow">
        <!-- Ambient Glass Frame -->
        <div class="showcase-content-col">
          <span class="fam-kicker">FAMILY ARCHITECTURE</span>
          <h3 class="fam-title">{{ selectedFamily.name }}</h3>
          <p class="fam-sub">{{ selectedFamily.subtitle }}</p>
          <p class="fam-desc">{{ selectedFamily.description }}</p>

          <div class="fam-meta-grid">
            <div class="meta-box">
              <span class="meta-label">Personality</span>
              <strong>{{ selectedFamily.personality }}</strong>
            </div>
            <div class="meta-box">
              <span class="meta-label">Ideal Moments</span>
              <strong>{{ selectedFamily.seasonOccasion }}</strong>
            </div>
          </div>

          <div class="fam-notes-wrap">
            <span class="notes-kicker">Signature Notes in Extraction:</span>
            <div class="fam-chips">
              <span class="fam-chip" *ngFor="let n of selectedFamily.dominantNotes">✦ {{ n }}</span>
            </div>
          </div>

          <div class="fam-actions">
            <button
              type="button"
              class="btn-family-shop"
              (click)="onExploreFamily(selectedFamily.id)">
              <span>Explore {{ selectedFamily.name }} Extraits</span>
              <span class="arrow">↗</span>
            </button>
          </div>
        </div>

        <!-- Center Rotating Flacon Presentation -->
        <div class="showcase-bottle-col">
          <div class="bottle-halo" aria-hidden="true"></div>
          <div class="bottle-pedestal">
            <img
              [src]="selectedFamily.flaconImage"
              [alt]="selectedFamily.flaconName + ' Flacon'"
              class="family-flacon-img" />
            <div class="bottle-shadow" aria-hidden="true"></div>
          </div>
          <div class="bottle-tag-pill">
            <span class="flacon-lead-name">{{ selectedFamily.flaconName }}</span>
            <span class="flacon-lead-price">₹{{ selectedFamily.flaconPrice | number }}</span>
          </div>
        </div>
      </div>

      <!-- Integrated Scent Notes Pyramid -->
      <div class="pyramid-embed-wrapper">
        <app-scent-notes-pyramid></app-scent-notes-pyramid>
      </div>
    </section>
  `,
  styles: [`
    .scent-families-pinned-section {
      padding: 80px 0 60px;
    }

    .family-badge {
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--color-champagne-gold, #C9A96E);
      border: 1px solid rgba(201, 169, 110, 0.35);
      padding: 6px 14px;
      border-radius: 999px;
      background: rgba(32, 42, 28, 0.5);
    }

    .family-nav-pills {
      display: flex;
      gap: 12px;
      margin: 28px 0 24px;
      overflow-x: auto;
      scrollbar-width: none;
      padding-bottom: 4px;
    }

    .family-nav-pills::-webkit-scrollbar {
      display: none;
    }

    .family-tab-btn {
      background: rgba(32, 42, 28, 0.6);
      border: 1px solid rgba(201, 169, 110, 0.24);
      color: var(--color-warm-ivory, #F5EFE6);
      padding: 10px 22px;
      border-radius: 999px;
      font-family: var(--font-body, 'Inter', sans-serif);
      font-size: 12px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .family-tab-btn:hover {
      border-color: var(--color-champagne-gold, #C9A96E);
      background: rgba(201, 169, 110, 0.15);
      color: #ffffff;
      transform: translateY(-2px);
    }

    .family-tab-btn.active {
      background: linear-gradient(135deg, rgba(201, 169, 110, 0.3) 0%, rgba(32, 42, 28, 0.9) 100%);
      border-color: var(--color-champagne-gold, #C9A96E);
      color: #ffffff;
      box-shadow: 0 4px 20px rgba(201, 169, 110, 0.25);
    }

    .tab-glyph {
      font-size: 9px;
      color: var(--color-champagne-gold, #C9A96E);
    }

    .family-showcase-stage {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 3rem;
      align-items: center;
      border-radius: var(--radius-lg, 24px);
      border: 1px solid rgba(201, 169, 110, 0.26);
      padding: 3.5rem;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 24px 60px rgba(13, 15, 11, 0.65);
      transition: background 0.6s ease;
      position: relative;
      overflow: hidden;
    }

    .fam-kicker {
      font-size: 10px;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      color: var(--color-champagne-gold, #C9A96E);
      font-weight: 600;
    }

    .fam-title {
      font-family: var(--font-heading, 'Cormorant Garamond', serif);
      font-size: clamp(34px, 4.5vw, 48px);
      color: var(--color-warm-ivory, #F5EFE6);
      margin: 8px 0 4px;
      font-weight: 500;
      line-height: 1.1;
    }

    .fam-sub {
      font-family: var(--font-heading, 'Cormorant Garamond', serif);
      font-style: italic;
      font-size: 18px;
      color: var(--color-champagne-gold, #C9A96E);
      margin: 0 0 16px;
    }

    .fam-desc {
      font-size: 13.5px;
      line-height: 1.7;
      color: var(--color-ivory-dim, rgba(245, 239, 230, 0.85));
      margin-bottom: 24px;
    }

    .fam-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
      padding: 16px;
      border-radius: var(--radius-sm, 8px);
      background: rgba(13, 15, 11, 0.55);
      border: 1px solid rgba(201, 169, 110, 0.16);
    }

    .meta-label {
      display: block;
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: var(--color-champagne-gold, #C9A96E);
      margin-bottom: 3px;
    }

    .meta-box strong {
      font-size: 12.5px;
      color: var(--color-warm-ivory, #F5EFE6);
      font-weight: 500;
    }

    .notes-kicker {
      display: block;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: var(--color-ivory-dim, rgba(245, 239, 230, 0.75));
      margin-bottom: 8px;
    }

    .fam-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 28px;
    }

    .fam-chip {
      background: rgba(201, 169, 110, 0.15);
      border: 1px solid rgba(201, 169, 110, 0.32);
      color: var(--color-warm-ivory, #F5EFE6);
      padding: 5px 12px;
      border-radius: 999px;
      font-size: 11px;
    }

    .btn-family-shop {
      background: linear-gradient(135deg, #dfc796 0%, #C9A96E 50%, #a88444 100%);
      color: #0d0f0b;
      border: none;
      padding: 13px 26px;
      border-radius: 999px;
      font-family: var(--font-body, 'Inter', sans-serif);
      font-size: 11.5px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: 0 10px 24px rgba(201, 169, 110, 0.3);
    }

    .btn-family-shop:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 16px 36px rgba(201, 169, 110, 0.45);
    }

    /* Bottle Presentation Column */
    .showcase-bottle-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .bottle-halo {
      position: absolute;
      width: 280px;
      height: 280px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(201, 169, 110, 0.25) 0%, transparent 70%);
      pointer-events: none;
      filter: blur(24px);
    }

    .family-flacon-img {
      width: min(280px, 80%);
      height: auto;
      filter: drop-shadow(0 24px 45px rgba(0, 0, 0, 0.75));
      animation: floatBottle 5s ease-in-out infinite;
      transition: transform 0.4s ease;
    }

    .bottle-tag-pill {
      margin-top: 1.5rem;
      background: rgba(13, 15, 11, 0.85);
      border: 1px solid rgba(201, 169, 110, 0.32);
      padding: 8px 18px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      gap: 12px;
      backdrop-filter: blur(10px);
    }

    .flacon-lead-name {
      font-family: var(--font-heading, 'Cormorant Garamond', serif);
      font-size: 15px;
      color: var(--color-warm-ivory, #F5EFE6);
    }

    .flacon-lead-price {
      font-size: 13px;
      color: var(--color-champagne-gold, #C9A96E);
      font-weight: 600;
    }

    .pyramid-embed-wrapper {
      margin-top: 48px;
    }

    @keyframes floatBottle {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    @media (max-width: 900px) {
      .family-showcase-stage {
        grid-template-columns: 1fr;
        padding: 2rem;
        gap: 2rem;
      }
      .showcase-bottle-col {
        order: -1;
      }
    }
  `]
})
export class ScentFamiliesShowcaseComponent {
  @Output() explore = new EventEmitter<string>();

  families: ScentFamily[] = [
    {
      id: 'woody',
      name: 'Woody & Resinous',
      subtitle: 'The King of Woods · Commanding, Grounded & Magnetic',
      description: 'Built on wild Assam agarwood aged 20 years, paired with smoked cedarwood, golden ambergris, and sacred Mysore sandalwood. Leaves an imposing, unforgettable wake.',
      dominantNotes: ['Assam Agarwood', 'Mysore Sandalwood', 'Smoked Cedar', 'Golden Ambergris'],
      personality: 'Bold, Royal, Confident',
      seasonOccasion: 'Evening Galas, Winter & Signature Wear',
      flaconName: 'Noir Oud',
      flaconImage: '/assets/products/noir-oud.svg',
      flaconPrice: 3499,
      bgGlow: 'radial-gradient(circle at 60% 40%, rgba(32, 42, 28, 0.95) 0%, rgba(13, 15, 11, 0.98) 100%)'
    },
    {
      id: 'floral',
      name: 'Floral & Romantic',
      subtitle: 'Velvety Damask Petals & Dewy Morning Orchards',
      description: 'Luminous damask rose distilled at dawn, softened with juicy French pear, white peony, and cashmere musk. Intimate, ethereal, and gracefully evocative.',
      dominantNotes: ['Damask Rose', 'Grasse Jasmine', 'French Pear', 'White Cashmere Musk'],
      personality: 'Graceful, Radiant, Romantic',
      seasonOccasion: 'Spring Celebrations & Intimate Dinners',
      flaconName: 'Rose Éclat',
      flaconImage: '/assets/products/rose-eclat.svg',
      flaconPrice: 2899,
      bgGlow: 'radial-gradient(circle at 60% 40%, rgba(45, 34, 30, 0.92) 0%, rgba(13, 15, 11, 0.98) 100%)'
    },
    {
      id: 'oriental',
      name: 'Oriental & Amber',
      subtitle: 'Sacred Spices, Golden Saffron & Sensual Vanilla Resins',
      description: 'Hand-picked Kashmiri saffron blended with benzoin tears, bourbon vanilla, and dark leather. An opulent tapestry that warms the skin for 24+ hours.',
      dominantNotes: ['Kashmiri Saffron', 'Bourbon Vanilla', 'Temple Incense', 'Dark Leather'],
      personality: 'Hypnotic, Warm, Sensual',
      seasonOccasion: 'Festive Evenings & Cold Autumn Nights',
      flaconName: 'Velvet Amber',
      flaconImage: '/assets/products/velvet-amber.svg',
      flaconPrice: 3999,
      bgGlow: 'radial-gradient(circle at 60% 40%, rgba(46, 36, 18, 0.92) 0%, rgba(13, 15, 11, 0.98) 100%)'
    },
    {
      id: 'fresh',
      name: 'Fresh & Citrus Drift',
      subtitle: 'Sunlit Coastal Citrus, Salty Sea Salt & Neroli',
      description: 'Cold-pressed Calabrian bergamot infused with ocean spray, crisp driftwood, and sun-drenched orange blossom. Bright, restorative, and effortless.',
      dominantNotes: ['Calabrian Bergamot', 'Neroli Petals', 'Sea Salt', 'Sunlit Driftwood'],
      personality: 'Effortless, Bright, Invigorating',
      seasonOccasion: 'Sunlit Mornings, Summer & Daily Luxury',
      flaconName: 'Citrus Drift',
      flaconImage: '/assets/products/citrus-drift.svg',
      flaconPrice: 2199,
      bgGlow: 'radial-gradient(circle at 60% 40%, rgba(20, 38, 34, 0.92) 0%, rgba(13, 15, 11, 0.98) 100%)'
    }
  ];

  selectedFamily: ScentFamily = this.families[0];

  selectFamily(fam: ScentFamily): void {
    this.selectedFamily = fam;
  }

  onExploreFamily(familyId: string): void {
    this.explore.emit(familyId);
  }
}
