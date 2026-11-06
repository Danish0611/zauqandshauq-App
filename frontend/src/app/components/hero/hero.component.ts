import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Product } from '../../product.model';

export interface FragranticaAccord {
  name: string;
  percent: number;
  color: string;
}

export interface FragranticaScore {
  longevity: string;
  sillage: string;
  season: string;
  timeOfDay: string;
}

export interface HeroSlide {
  id: number;
  productCode: string;
  name: string;
  subname: string;
  edition: string;
  headline: string;
  description: string;
  price: number;
  originalPrice: number;
  size: string;
  concentration: string;
  image: string;
  notes: {
    top: string;
    heart: string;
    base: string;
  };
  accords: FragranticaAccord[];
  fragrantica: FragranticaScore;
  quoteScript: string;
  quoteAuthor: string;
  quoteTranslation: string;
  badges: string[];
  spotlightGradient: string;
  accentColor: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section 
      class="hero-slider-section" 
      id="home"
      (mouseenter)="pauseAutoplay()"
      (mouseleave)="resumeAutoplay()"
      (touchstart)="onTouchStart($event)"
      (touchend)="onTouchEnd($event)"
      aria-label="Haute Parfumerie Luxury Wardrobe">

      <!-- Ambient Background Video & Liquid Gold Particle Sillage Canvas -->
      <div class="slider-backdrop" [style.background]="currentSlide.spotlightGradient"></div>
      <video 
        class="hero-ambient-video" 
        src="/assets/hero-scent-video.mp4" 
        autoplay 
        muted 
        loop 
        playsinline 
        preload="auto"
        aria-hidden="true">
      </video>
      <canvas #mistCanvas class="hero-ambient-canvas" aria-hidden="true"></canvas>
      <div class="slider-grain"></div>
      
      <!-- Top Slide Progress Indicator -->
      <div class="slide-progress-bar-wrap" aria-hidden="true">
        <div class="slide-progress-fill" [style.width.%]="progressPercent"></div>
      </div>

      <!-- ==========================================================
           1. MAISON BRAND REVEAL & ROYAL WARDROBE ENTRANCE PORTAL
           ========================================================== -->
      <div class="wardrobe-portal-header page-shell">
        <div class="portal-brand-lockup">
          <div class="portal-crest-wrap">
            <div class="portal-crest-halo"></div>
            <img src="/assets/logo.svg" alt="Maison Zauq and Shauq Crest" class="portal-crest-img">
          </div>
          <div class="portal-brand-meta">
            <span class="portal-kicker">MAISON DE HAUTE PARFUMERIE · PARIS &amp; JAIPUR</span>
            <h1 class="portal-title">The Royal Fragrance Wardrobe</h1>
            <p class="portal-persian-quote" dir="rtl">خوشبو وہ خاموش زبان ہے جو دل سے دل تک بات کرتی ہے</p>
            <p class="portal-tagline">
              “Fragrance is the silent tongue that speaks from heart to heart.” Step inside our private wardrobe to reveal each numbered extrait one by one.
            </p>
          </div>
        </div>

        <!-- Sequential Wardrobe Alcove Selectors (One-by-One Switcher) -->
        <div class="wardrobe-alcove-tabs" role="tablist" aria-label="Fragrance Wardrobe Flacons">
          <button 
            *ngFor="let s of slides; let i = index" 
            type="button" 
            class="alcove-tab-pill" 
            [class.is-active]="i === currentSlideIndex"
            (click)="goToSlide(i)"
            role="tab"
            [attr.aria-selected]="i === currentSlideIndex">
            <span class="alcove-roman">{{ getRoman(i) }}</span>
            <span class="alcove-name">{{ s.name }}</span>
            <span class="alcove-tag" *ngIf="i === currentSlideIndex">Selected</span>
          </button>

          <button 
            type="button" 
            class="wardrobe-doors-toggle-btn"
            (click)="toggleWardrobeDoors()"
            [title]="wardrobeDoorsOpen ? 'Close Wardrobe Doors' : 'Open Wardrobe Doors'">
            <span>{{ wardrobeDoorsOpen ? '✦ Wardrobe Open' : '◇ Step Inside Wardrobe' }}</span>
          </button>
        </div>
      </div>

      <!-- ==========================================================
           2. INTERACTIVE LUXURY WARDROBE INTERIOR (BOTTLES ONE BY ONE)
           ========================================================== -->
      <div class="wardrobe-cabinet-wrapper" [class.doors-closed]="!wardrobeDoorsOpen">
        
        <!-- Left & Right Animated Wardrobe Doors with Gold Trim -->
        <div class="wardrobe-door door-left" aria-hidden="true" (click)="toggleWardrobeDoors()">
          <div class="door-panel">
            <div class="door-brass-crest">
              <img src="/assets/logo.svg" alt="Z&amp;S" class="door-crest-mini">
              <span>ZAUQ</span>
            </div>
            <div class="door-handle handle-left"></div>
          </div>
        </div>

        <div class="wardrobe-door door-right" aria-hidden="true" (click)="toggleWardrobeDoors()">
          <div class="door-panel">
            <div class="door-brass-crest">
              <img src="/assets/logo.svg" alt="Z&amp;S" class="door-crest-mini">
              <span>SHAUQ</span>
            </div>
            <div class="door-handle handle-right"></div>
          </div>
        </div>

        <!-- WARDROBE INTERIOR: ACTIVE FLACON ALCOVE -->
        <div class="slider-inner page-shell">
          
          <!-- LEFT COLUMN: CINEMATIC EDITORIAL COPY -->
          <div class="slider-copy-col" [class.slide-transitioning]="isTransitioning">
            
            <!-- Edition Badge & Live Counter -->
            <div class="slide-badge-row">
              <span class="edition-pill">
                <span class="pill-sparkle">✦</span>
                {{ currentSlide.edition }}
              </span>
              <div class="slide-counter">
                <span class="current-num">0{{ currentSlideIndex + 1 }}</span>
                <span class="counter-slash">/</span>
                <span class="total-num">0{{ slides.length }}</span>
              </div>
            </div>

            <!-- Main Grand Title with Golden Italic Accent -->
            <h2 class="slide-title">
              <span class="slide-title-name">{{ currentSlide.name }}</span>
              <span class="slide-title-sub">
                <em>{{ currentSlide.headline }}</em>
              </span>
            </h2>

            <!-- Sensory Narrative Description -->
            <p class="slide-narrative">
              {{ currentSlide.description }}
            </p>

            <!-- FRAGRANTICA-INSPIRED MAIN ACCORDS BARS -->
            <div class="fragrantica-mini-accords" aria-label="Main Fragrantica Olfactory Accords">
              <div class="accords-header">
                <span class="accords-kicker">MAIN ACCORDS</span>
                <span class="accords-source">FRAGRANTICA PROFILE</span>
              </div>
              <div class="accords-bars-deck">
                <div 
                  *ngFor="let acc of currentSlide.accords" 
                  class="accord-bar-row"
                  [title]="acc.name + ': ' + acc.percent + '% prominence'">
                  <span class="accord-title">{{ acc.name }}</span>
                  <div class="accord-meter-track">
                    <div class="accord-meter-fill" [style.width.%]="acc.percent" [style.background]="acc.color"></div>
                  </div>
                  <span class="accord-percent">{{ acc.percent }}%</span>
                </div>
              </div>
              
              <!-- Sensory Performance Badges -->
              <div class="fragrantica-metrics-strip">
                <span class="f-pill"><i class="f-bullet">⏱</i> {{ currentSlide.fragrantica.longevity }}</span>
                <span class="f-pill"><i class="f-bullet">✨</i> {{ currentSlide.fragrantica.sillage }}</span>
                <span class="f-pill"><i class="f-bullet">❄️</i> {{ currentSlide.fragrantica.season }}</span>
              </div>
            </div>

            <!-- Interactive Olfactory Pyramid Chips -->
            <div class="olfactory-pyramid" aria-label="Olfactory Notes Pyramid">
              <div class="note-chip">
                <span class="note-level">TOP</span>
                <span class="note-scent">{{ currentSlide.notes.top }}</span>
              </div>
              <div class="note-chip">
                <span class="note-level">HEART</span>
                <span class="note-scent">{{ currentSlide.notes.heart }}</span>
              </div>
              <div class="note-chip">
                <span class="note-level">BASE</span>
                <span class="note-scent">{{ currentSlide.notes.base }}</span>
              </div>
            </div>

            <!-- Persian & Urdu Literary Couplet Card -->
            <div class="literary-quote-card">
              <div class="quote-header">
                <span class="quote-kicker">HERITAGE RESONANCE</span>
                <span class="quote-author">{{ currentSlide.quoteAuthor }}</span>
              </div>
              <div class="quote-persian" dir="rtl">{{ currentSlide.quoteScript }}</div>
              <p class="quote-translation">{{ currentSlide.quoteTranslation }}</p>
            </div>

            <!-- Primary Luxury Action Buttons -->
            <div class="slide-actions-row">
              <button 
                type="button" 
                class="btn-flared-gold" 
                (click)="onShopFlacon()"
                [attr.aria-label]="'Shop ' + currentSlide.name + ' for ₹' + currentSlide.price">
                <span class="btn-text">Acquire Flacon · ₹{{ currentSlide.price | number }}</span>
                <span class="btn-arrow">↗</span>
              </button>

              <button 
                type="button" 
                class="btn-smoked-glass" 
                (click)="explore.emit('All Fragrances')"
                aria-label="Explore Full Fragrance Wardrobe">
                <span>View Full Wardrobe</span>
                <span class="btn-arrow">→</span>
              </button>
            </div>

            <!-- Slide Selector Navigation Tabs -->
            <div class="slide-tabs-nav" role="tablist" aria-label="Select Fragrance Slide">
              <button 
                *ngFor="let s of slides; let i = index" 
                type="button" 
                class="slide-tab-pill" 
                [class.is-active]="i === currentSlideIndex"
                (click)="goToSlide(i)"
                role="tab"
                [attr.aria-selected]="i === currentSlideIndex">
                <span class="tab-index">0{{ i + 1 }}</span>
                <span class="tab-name">{{ s.name }}</span>
                <span class="tab-active-indicator" *ngIf="i === currentSlideIndex"></span>
              </button>
            </div>

          </div>

          <!-- RIGHT COLUMN: ILLUMINATED FLACON STAGE WITH SCENT DIFFUSER ATOMIZER SPRAY -->
          <div class="slider-stage-col">
            
            <div class="flacon-cinematic-stage" [class.stage-transitioning]="isTransitioning">
              
              <!-- Canva-style Luxury Gold Frame Accents -->
              <div class="stage-frame-corner top-left" aria-hidden="true"></div>
              <div class="stage-frame-corner top-right" aria-hidden="true"></div>
              <div class="stage-frame-corner bottom-left" aria-hidden="true"></div>
              <div class="stage-frame-corner bottom-right" aria-hidden="true"></div>

              <!-- Rotating Gold Orbit Rings & Halos -->
              <div class="gold-halo-core" aria-hidden="true"></div>
              <div class="gold-orbit-ring ring-outer" aria-hidden="true"></div>
              <div class="gold-orbit-ring ring-inner" aria-hidden="true"></div>

              <!-- Floating Olfactory Feature Badges -->
              <div class="floating-badge badge-top-left">
                <span class="badge-icon">✦</span>
                <span>{{ currentSlide.badges[0] }}</span>
              </div>

              <div class="floating-badge badge-bottom-right">
                <span class="badge-icon">◇</span>
                <span>{{ currentSlide.badges[1] }}</span>
              </div>

              <div class="floating-badge badge-top-right">
                <span class="badge-icon">♥</span>
                <span>{{ currentSlide.concentration }}</span>
              </div>

              <!-- Central Floating Bottle with Scent Diffuser Mist Atomizer -->
              <div class="flacon-holder" [class.is-spritzing]="isSpritzing">
                
                <!-- SCENT BOTTLE DIFFUSER MIST ATOMIZER SPRAY ANIMATION -->
                <div class="scent-diffuser-atomizer" [class.spray-active]="isSpritzing || isTransitioning" aria-hidden="true">
                  <div class="diffuser-nozzle-flare"></div>
                  <div class="diffuser-mist-cone"></div>
                  <div class="diffuser-mist-plume-left"></div>
                  <div class="diffuser-mist-plume-right"></div>
                  <div class="diffuser-particles">
                    <span class="diffuser-drop d1"></span>
                    <span class="diffuser-drop d2"></span>
                    <span class="diffuser-drop d3"></span>
                    <span class="diffuser-drop d4"></span>
                    <span class="diffuser-drop d5"></span>
                    <span class="diffuser-drop d6"></span>
                    <span class="diffuser-drop d7"></span>
                    <span class="diffuser-drop d8"></span>
                  </div>
                  <div class="diffuser-aroma-ring ring-1"></div>
                  <div class="diffuser-aroma-ring ring-2"></div>
                  <div class="diffuser-floating-note">✦ {{ currentSlide.notes.top }}</div>
                </div>

                <!-- Main Illuminated Flacon (Real Studio Photography) -->
                <img 
                  class="flacon-hero-image real-flacon-photo" 
                  [src]="getDisplayedImage()" 
                  [alt]="currentSlide.name + ' luxury perfume flacon'"
                  (click)="onShopFlacon()"
                  loading="eager">
                <div class="flacon-pedestal-shadow" aria-hidden="true"></div>

                <!-- Real Flacon Multi-Angle Studio Gallery Selector -->
                <div class="flacon-multi-gallery-nav" aria-label="Inspect Bottle Angles">
                  <button 
                    type="button" 
                    class="gallery-thumb-btn" 
                    [class.is-active]="selectedGalleryView === 0"
                    (click)="selectedGalleryView = 0; $event.stopPropagation()"
                    title="Main Flacon View">
                    <span>Flacon</span>
                  </button>
                  <button 
                    type="button" 
                    class="gallery-thumb-btn" 
                    [class.is-active]="selectedGalleryView === 1"
                    (click)="selectedGalleryView = 1; $event.stopPropagation()"
                    title="Velvet Presentation Gift Box">
                    <span>Coffret Box</span>
                  </button>
                  <button 
                    type="button" 
                    class="gallery-thumb-btn" 
                    [class.is-active]="selectedGalleryView === 2"
                    (click)="selectedGalleryView = 2; $event.stopPropagation()"
                    title="Macro Sculptural Cap & Gold Collar">
                    <span>Marble Cap</span>
                  </button>
                  <button 
                    type="button" 
                    class="gallery-thumb-btn" 
                    [class.is-active]="selectedGalleryView === 3"
                    (click)="selectedGalleryView = 3; $event.stopPropagation()"
                    title="Full Bottle on Marble Pedestal">
                    <span>Pedestal</span>
                  </button>
                </div>

                <!-- Interactive Spritz Tester Mist Action Button -->
                <button 
                  type="button" 
                  class="spritz-mist-trigger-btn"
                  (click)="triggerSpritz($event)"
                  [title]="'Spritz ' + currentSlide.name + ' aroma mist'">
                  <span class="spritz-icon">💨</span>
                  <span class="spritz-label">Spray Flacon Scent Mist</span>
                  <span class="spritz-star">✦</span>
                </button>
              </div>

              <!-- Flacon Pedestal Label / Vintage Crest -->
              <div class="flacon-vintage-card">
                <div class="vintage-stamp">
                  <span class="vintage-est">MAISON</span>
                  <strong class="vintage-logo">Z&amp;S</strong>
                  <span class="vintage-city">PARIS · JAIPUR</span>
                </div>
                <div class="vintage-details">
                  <span class="vintage-cat">{{ currentSlide.concentration }} · {{ currentSlide.size }}</span>
                  <strong class="vintage-title">{{ currentSlide.name }}</strong>
                  <button type="button" class="vintage-inspect-btn" (click)="onShopFlacon()">
                    <span>Inspect Scent Profile</span>
                    <span class="arrow-glyph">↗</span>
                  </button>
                </div>
              </div>

              <!-- Stage Navigation Arrows -->
              <div class="stage-controls">
                <button 
                  type="button" 
                  class="nav-arrow-btn prev-btn" 
                  (click)="prevSlide()" 
                  aria-label="Previous Fragrance Flacon">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
                
                <div class="stage-slide-indicator">
                  <span>0{{ currentSlideIndex + 1 }}</span>
                  <div class="indicator-bar">
                    <div class="indicator-fill" [style.width.%]="((currentSlideIndex + 1) / slides.length) * 100"></div>
                  </div>
                  <span>0{{ slides.length }}</span>
                </div>

                <button 
                  type="button" 
                  class="nav-arrow-btn next-btn" 
                  (click)="nextSlide()" 
                  aria-label="Next Fragrance Flacon">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

      <!-- Luxury Bottom Scent Signature Strip -->
      <div class="slider-signature-bar">
        <div class="page-shell bar-content">
          <div class="bar-item">
            <span class="bar-star">✦</span>
            <span>Pure Botanical Distillates</span>
          </div>
          <span class="bar-dot">·</span>
          <div class="bar-item">
            <span class="bar-star">◇</span>
            <span>Zero Synthetic Loudness</span>
          </div>
          <span class="bar-dot">·</span>
          <div class="bar-item">
            <span class="bar-star">↗</span>
            <span>Complimentary All-India Delivery Above ₹2,499</span>
          </div>
          <span class="bar-dot">·</span>
          <div class="bar-item">
            <span class="bar-star">♡</span>
            <span>Royal Wax-Sealed Packaging</span>
          </div>
        </div>
      </div>

    </section>
  `
})
export class HeroComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() heroProduct?: Product;
  @Input() allProducts: Product[] = [];
  @Output() explore = new EventEmitter<string>();
  @Output() viewProduct = new EventEmitter<Product>();

  @ViewChild('mistCanvas') private mistCanvasRef?: ElementRef<HTMLCanvasElement>;

  readonly slides: HeroSlide[] = [
    {
      id: 1,
      productCode: 'ZS-OUD-01',
      name: 'Noir Oud',
      subname: 'The Sovereign Scent',
      edition: 'THE SIGNATURE EDIT · VINTAGE BATCH NO. 01',
      headline: 'The King of Woods. A Dark Resinous Symphony.',
      description: 'Hand-distilled from 20-year aged wild Assam agarwood, fused with ambergris, cedarwood, and smoked saddle leather. Intensely magnetic, commanding, and timeless.',
      price: 3499,
      originalPrice: 4299,
      size: '100 ml',
      concentration: 'Extrait de Parfum',
      image: '/assets/products/real-flacon-signature.jpg',
      notes: {
        top: 'Assam Bergamot · Smoked Leather',
        heart: 'Aged Agarwood · Damask Rose',
        base: 'Golden Ambergris · Mysore Sandal'
      },
      accords: [
        { name: 'Oud & Woods', percent: 96, color: '#8B5A2B' },
        { name: 'Warm Amber', percent: 85, color: '#D49B35' },
        { name: 'Warm Spicy', percent: 74, color: '#9C3D28' },
        { name: 'Smoky Incense', percent: 66, color: '#3A3238' }
      ],
      fragrantica: {
        longevity: 'Eternal (14+ hrs)',
        sillage: 'Royal Projection',
        season: 'Fall · Winter',
        timeOfDay: 'Evening Gala'
      },
      quoteScript: 'خوشبو وہ خاموش زبان ہے جو دل سے دل تک بات کرتی ہے',
      quoteAuthor: 'Urdu Literary Tradition',
      quoteTranslation: '“Fragrance is the silent tongue that speaks from heart to heart.”',
      badges: ['24h Extrait Longevity', 'Assam Agarwood', 'Royal House Fav.'],
      spotlightGradient: 'radial-gradient(circle at 65% 45%, rgba(13, 56, 41, 0.78) 0%, rgba(5, 26, 19, 0.96) 60%, #03120c 100%)',
      accentColor: '#e5c875'
    },
    {
      id: 2,
      productCode: 'ZS-ROSE-02',
      name: 'Rose Éclat',
      subname: 'The Sunlit Petals',
      edition: 'MAISON AURORE · SPRING HARVEST NO. 02',
      headline: 'Luminescent Florals. Morning Dew on Petals.',
      description: 'Dawn-harvested Damask rose otto kissed with crisp French pear and wrapped in cashmere white musk. Poetic, radiant, and intimately memorable on warm skin.',
      price: 2899,
      originalPrice: 3499,
      size: '75 ml',
      concentration: 'Eau de Parfum',
      image: '/assets/products/real-flacon-rose-eclat.jpg',
      notes: {
        top: 'French Pear · Pink Pepper',
        heart: 'Damask Rose Otto · Peony',
        base: 'Cashmere Musk · Golden Amber'
      },
      accords: [
        { name: 'Damask Rose', percent: 98, color: '#C96B82' },
        { name: 'Crisp Pear', percent: 82, color: '#8DAA4A' },
        { name: 'White Musk', percent: 75, color: '#D4C4B5' },
        { name: 'Soft Floral', percent: 64, color: '#E5A5B5' }
      ],
      fragrantica: {
        longevity: 'Long Lasting (10+ hrs)',
        sillage: 'Alluring Aura',
        season: 'Spring · Summer',
        timeOfDay: 'Day & Evening'
      },
      quoteScript: 'بوی گل و ریحان همه از لطف حبیب است',
      quoteAuthor: 'Hafez Shirazi',
      quoteTranslation: '“The perfume of rose and sweet basil flows from the grace of the Beloved.”',
      badges: ['Luminescent Sillage', 'Grasse Rose Otto', 'Solar Romance'],
      spotlightGradient: 'radial-gradient(circle at 65% 45%, rgba(89, 28, 52, 0.65) 0%, rgba(6, 26, 19, 0.96) 60%, #03120c 100%)',
      accentColor: '#e9d5cc'
    },
    {
      id: 4,
      productCode: 'ZS-AMBER-04',
      name: 'Velvet Amber',
      subname: 'The Molten Elixir',
      edition: 'THE ARTISAN EDIT · LIMITED CASQUE NO. 03',
      headline: 'Molten Resins. Liquid Gold on Silk.',
      description: 'A slow-burning elixir of dark Madagascar bourbon vanilla, golden benzoin tear resins, and warm creamy sandalwood that envelops your senses like silk.',
      price: 3999,
      originalPrice: 4699,
      size: '50 ml',
      concentration: 'Extrait de Parfum',
      image: '/assets/products/real-flacon-velvet-amber.jpg',
      notes: {
        top: 'Green Cardamom · Bitter Almond',
        heart: 'Bourbon Vanilla · Benzoin Resins',
        base: 'Dark Amber · Creamy Sandalwood'
      },
      accords: [
        { name: 'Amber Resins', percent: 95, color: '#D49B35' },
        { name: 'Bourbon Vanilla', percent: 88, color: '#C58F48' },
        { name: 'Mysore Sandal', percent: 78, color: '#A07242' },
        { name: 'Sweet Balsamic', percent: 65, color: '#8F6543' }
      ],
      fragrantica: {
        longevity: 'Eternal (14+ hrs)',
        sillage: 'Royal Sillage',
        season: 'Autumn · Winter',
        timeOfDay: 'Intimate Night'
      },
      quoteScript: 'ز شوق روی تو دل در برم فغان دارد',
      quoteAuthor: 'Jalal al-Din Rumi',
      quoteTranslation: '“From yearning for your presence, my heart sings within my chest.”',
      badges: ['30% Concentration', 'Bourbon Vanilla', 'Sensual Warmth'],
      spotlightGradient: 'radial-gradient(circle at 65% 45%, rgba(138, 92, 33, 0.72) 0%, rgba(6, 26, 19, 0.96) 60%, #03120c 100%)',
      accentColor: '#c8aea2'
    },
    {
      id: 7,
      productCode: 'ZS-SAFF-07',
      name: 'Saffron Smoke',
      subname: 'The Sacred Flame',
      edition: 'OUD & EARTH · MONASTERY CELLAR NO. 04',
      headline: 'The Sacred Flame. Golden Saffron & Incense.',
      description: 'Sun-dried Kashmiri Mongra saffron threads smoldering over sacred cedarwood, antique leather, and temple incense. Warm, mystical, and deeply grounding.',
      price: 4499,
      originalPrice: 5299,
      size: '50 ml',
      concentration: 'Extrait de Parfum',
      image: '/assets/products/real-flacon-saffron-smoke.jpg',
      notes: {
        top: 'Kashmiri Saffron · Wild Thyme',
        heart: 'Temple Incense · Black Leather',
        base: 'Smoked Birch · Labdanum Resin'
      },
      accords: [
        { name: 'Mongra Saffron', percent: 94, color: '#B34A26' },
        { name: 'Temple Incense', percent: 86, color: '#4D3B43' },
        { name: 'Antique Leather', percent: 78, color: '#6E452B' },
        { name: 'Smoked Woods', percent: 68, color: '#544136' }
      ],
      fragrantica: {
        longevity: 'Eternal (16+ hrs)',
        sillage: 'Commanding Wake',
        season: 'Winter · Grand Galas',
        timeOfDay: 'Nocturnal'
      },
      quoteScript: 'عطرِ تو می آید و جان تازه می شود',
      quoteAuthor: 'Classical Persian Verse',
      quoteTranslation: '“Your fragrance arrives, and the soul is born anew.”',
      badges: ['Mongra Saffron', 'Ancient Incense', 'Limited Batch'],
      spotlightGradient: 'radial-gradient(circle at 65% 45%, rgba(115, 48, 22, 0.75) 0%, rgba(6, 26, 19, 0.96) 60%, #03120c 100%)',
      accentColor: '#e5c178'
    },
    {
      id: 3,
      productCode: 'ZS-AZUR-03',
      name: 'Azure Coast',
      subname: 'The Mediterranean Silk',
      edition: 'RIVIERA PRIVATE EDIT · CASQUE NO. 05',
      headline: 'Sunlit Coastal Driftwood. Sparkling Bergamot & Sea Salt.',
      description: 'Hand-harvested Calabrian bergamot infused with sea salt crystals, sun-drenched cedar driftwood, and crisp white tea. Refreshing, oceanic, and effortlessly magnetic.',
      price: 2699,
      originalPrice: 3299,
      size: '100 ml',
      concentration: 'Extrait de Parfum',
      image: '/assets/products/real-flacon-azure-coast.jpg',
      notes: {
        top: 'Calabrian Bergamot · Sea Salt',
        heart: 'Neroli Petals · White Tea',
        base: 'Sunlit Driftwood · Ocean Amber'
      },
      accords: [
        { name: 'Citrus Fresh', percent: 94, color: '#3A9BB7' },
        { name: 'Aquatic Marine', percent: 86, color: '#2B7092' },
        { name: 'Aromatic Tea', percent: 76, color: '#668F80' },
        { name: 'Clean Driftwood', percent: 68, color: '#887B6C' }
      ],
      fragrantica: {
        longevity: 'Long Lasting (10+ hrs)',
        sillage: 'Breezy Radiance',
        season: 'Spring · Summer',
        timeOfDay: 'Day & Evening'
      },
      quoteScript: 'نسیمِ بادِ صبا بویِ تو دارد',
      quoteAuthor: 'Saadi Shirazi',
      quoteTranslation: '“The morning breeze carries the fragrance of your presence.”',
      badges: ['Riviera Breeze', 'Calabrian Citrus', 'Summer Favorite'],
      spotlightGradient: 'radial-gradient(circle at 65% 45%, rgba(20, 68, 85, 0.75) 0%, rgba(6, 26, 19, 0.96) 60%, #03120c 100%)',
      accentColor: '#8ec5d6'
    }
  ];

  currentSlideIndex = 0;
  selectedGalleryView = 0;
  isPaused = false;
  isTransitioning = false;
  isSpritzing = false;
  progressPercent = 0;
  wardrobeDoorsOpen = true;

  getDisplayedImage(): string {
    if (this.selectedGalleryView === 1) {
      return '/assets/products/real-flacon-unboxing.jpg';
    } else if (this.selectedGalleryView === 2) {
      return '/assets/products/real-flacon-macro.jpg';
    } else if (this.selectedGalleryView === 3) {
      return '/assets/products/real-flacon-hero-scene.jpg';
    }
    return this.currentSlide.image;
  }

  getRoman(i: number): string {
    const romans = ['I', 'II', 'III', 'IV', 'V', 'VI'];
    return romans[i] || (i + 1).toString();
  }

  toggleWardrobeDoors(): void {
    this.wardrobeDoorsOpen = !this.wardrobeDoorsOpen;
    if (this.wardrobeDoorsOpen) {
      setTimeout(() => this.triggerSpritz(), 300);
    }
  }

  private autoplayTimer?: ReturnType<typeof setInterval>;
  private progressInterval?: ReturnType<typeof setInterval>;
  private spritzTimeout?: ReturnType<typeof setTimeout>;
  private touchStartX = 0;
  private touchEndX = 0;
  private readonly SLIDE_DURATION_MS = 6000;
  private readonly PROGRESS_STEP_MS = 50;

  // Particle Canvas Simulator
  private animFrameId?: number;
  private particles: Array<{ x: number; y: number; r: number; vy: number; vx: number; alpha: number; maxAlpha: number }> = [];

  get currentSlide(): HeroSlide {
    return this.slides[this.currentSlideIndex];
  }

  ngOnInit(): void {
    this.startProgress();
    setTimeout(() => this.triggerSpritz(), 800);
  }

  ngAfterViewInit(): void {
    this.initMistCanvas();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    if (this.spritzTimeout) {
      clearTimeout(this.spritzTimeout);
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  private initMistCanvas(): void {
    if (!this.mistCanvasRef) return;
    const canvas = this.mistCanvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || 650;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Seed 40 ambient floating scent particles
    this.particles = [];
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -(Math.random() * 0.5 + 0.25),
        alpha: Math.random() * 0.6,
        maxAlpha: Math.random() * 0.5 + 0.2
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += 0.005;
        if (p.alpha > p.maxAlpha) {
          p.alpha = 0.05;
        }

        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(229, 200, 117, ${p.alpha})`;
        ctx.shadowColor = '#d4af37';
        ctx.shadowBlur = 6;
        ctx.fill();
      }

      this.animFrameId = requestAnimationFrame(render);
    };
    render();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.prevSlide();
    } else if (event.key === 'ArrowRight') {
      this.nextSlide();
    }
  }

  nextSlide(): void {
    const nextIndex = (this.currentSlideIndex + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }

  prevSlide(): void {
    const prevIndex = (this.currentSlideIndex - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prevIndex);
  }

  goToSlide(index: number): void {
    if (index === this.currentSlideIndex || index < 0 || index >= this.slides.length) {
      return;
    }
    this.triggerTransition();
    this.currentSlideIndex = index;
    this.selectedGalleryView = 0;
    this.resetProgress();
    this.triggerSpritz();
  }

  triggerSpritz(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.spritzTimeout) {
      clearTimeout(this.spritzTimeout);
    }
    this.isSpritzing = true;
    this.spritzTimeout = setTimeout(() => {
      this.isSpritzing = false;
    }, 2400);
  }

  pauseAutoplay(): void {
    this.isPaused = true;
  }

  resumeAutoplay(): void {
    this.isPaused = false;
  }

  onTouchStart(e: TouchEvent): void {
    this.pauseAutoplay();
    this.touchStartX = e.changedTouches[0].screenX;
  }

  onTouchEnd(e: TouchEvent): void {
    this.touchEndX = e.changedTouches[0].screenX;
    this.handleSwipe();
    this.resumeAutoplay();
  }

  private handleSwipe(): void {
    const delta = this.touchEndX - this.touchStartX;
    if (Math.abs(delta) > 45) {
      if (delta < 0) {
        this.nextSlide(); // Swiped left -> next
      } else {
        this.prevSlide(); // Swiped right -> prev
      }
    }
  }

  private triggerTransition(): void {
    this.isTransitioning = true;
    setTimeout(() => {
      this.isTransitioning = false;
    }, 450);
  }

  private startProgress(): void {
    const increment = (this.PROGRESS_STEP_MS / this.SLIDE_DURATION_MS) * 100;
    this.progressInterval = setInterval(() => {
      if (!this.isPaused) {
        this.progressPercent += increment;
        if (this.progressPercent >= 100) {
          this.progressPercent = 0;
          this.nextSlide();
        }
      }
    }, this.PROGRESS_STEP_MS);
  }

  private resetProgress(): void {
    this.progressPercent = 0;
  }

  private stopAutoplay(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
    }
  }

  onShopFlacon(): void {
    const slide = this.currentSlide;
    const matched = this.allProducts.find(p => 
      p.productCode === slide.productCode || 
      p.name.toLowerCase() === slide.name.toLowerCase()
    );

    if (matched) {
      this.viewProduct.emit(matched);
    } else {
      const fallbackProduct: Product = {
        id: slide.id,
        productCode: slide.productCode,
        name: slide.name,
        brand: 'Zauq & Shauq Atelier',
        category: 'Unisex',
        concentration: slide.concentration,
        size: slide.size,
        price: slide.price,
        originalPrice: slide.originalPrice,
        rating: 4.9,
        reviews: 142,
        description: slide.description,
        ingredients: 'Pure Botanical Distillates, Alcohol Denat., Parfum (Natural Essential Oils), Coumarin, Linalool.',
        notes: [slide.notes.top, slide.notes.heart, slide.notes.base],
        image: slide.image,
        badge: 'ROYAL EDIT',
        featured: true,
        bestseller: true,
        newArrival: false,
        stockQuantity: 45
      };
      this.viewProduct.emit(fallbackProduct);
    }
  }
}
