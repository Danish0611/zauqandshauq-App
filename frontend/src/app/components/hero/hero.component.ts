import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Product } from '../../product.model';

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
      aria-label="Haute Parfumerie Showcase Slider">

      <!-- Ambient Background Texture & Glow Mesh -->
      <div class="slider-backdrop" [style.background]="currentSlide.spotlightGradient"></div>
      <div class="slider-grain"></div>
      <div class="scent-trail-layer" aria-hidden="true">
        <span class="scent-particle p1"></span>
        <span class="scent-particle p2"></span>
        <span class="scent-particle p3"></span>
        <span class="scent-particle p4"></span>
        <span class="scent-particle p5"></span>
      </div>

      <!-- Top Slide Progress Indicator -->
      <div class="slide-progress-bar-wrap" aria-hidden="true">
        <div class="slide-progress-fill" [style.width.%]="progressPercent"></div>
      </div>

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
          <h1 class="slide-title">
            <span class="slide-title-name">{{ currentSlide.name }}</span>
            <span class="slide-title-sub">
              <em>{{ currentSlide.headline }}</em>
            </span>
          </h1>

          <!-- Sensory Narrative Description -->
          <p class="slide-narrative">
            {{ currentSlide.description }}
          </p>

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
              <span class="btn-text">Shop This Flacon · ₹{{ currentSlide.price | number }}</span>
              <span class="btn-arrow">↗</span>
            </button>

            <button 
              type="button" 
              class="btn-smoked-glass" 
              (click)="explore.emit('All Fragrances')"
              aria-label="Explore Full Fragrance Wardrobe">
              <span>Explore Wardrobe</span>
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

        <!-- RIGHT COLUMN: ILLUMINATED FLACON STAGE (SLIDER REVOLUTION / CANVA BENCHMARK) -->
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

            <!-- Central Floating Bottle with Dynamic Keyframe Physics -->
            <div class="flacon-holder" (click)="onShopFlacon()" title="Inspect {{ currentSlide.name }} Profile">
              <img 
                class="flacon-hero-image" 
                [src]="currentSlide.image" 
                [alt]="currentSlide.name + ' luxury perfume flacon'"
                loading="eager">
              <div class="flacon-pedestal-shadow" aria-hidden="true"></div>
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

      <!-- Luxury Bottom Scent Signature Strip -->
      <div class="slider-signature-bar">
        <div class="page-shell bar-content">
          <div class="bar-item">
            <span class="bar-star">✦</span>
            <span>20% Pure Botanical Extraits</span>
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
            <span>Royal Wax-Sealed Coffret Packaging</span>
          </div>
        </div>
      </div>

    </section>
  `
})
export class HeroComponent implements OnInit, OnDestroy {
  @Input() heroProduct?: Product;
  @Input() allProducts: Product[] = [];
  @Output() explore = new EventEmitter<string>();
  @Output() viewProduct = new EventEmitter<Product>();

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
      image: '/assets/hero-fragrance.svg',
      notes: {
        top: 'Assam Bergamot · Smoked Leather',
        heart: 'Aged Agarwood · Damask Rose',
        base: 'Golden Ambergris · Mysore Sandal'
      },
      quoteScript: 'خوشبو وہ خاموش زبان ہے جو دل سے دل تک بات کرتی ہے',
      quoteAuthor: 'Urdu Literary Tradition',
      quoteTranslation: '“Fragrance is the silent tongue that speaks from heart to heart.”',
      badges: ['24h Extrait Longevity', 'Assam Agarwood', 'Royal House Fav.'],
      spotlightGradient: 'radial-gradient(circle at 65% 45%, rgba(101, 34, 14, 0.65) 0%, rgba(23, 18, 17, 0.95) 60%, #171211 100%)',
      accentColor: '#e5c178'
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
      image: '/assets/products/rose-eclat.svg',
      notes: {
        top: 'French Pear · Pink Pepper',
        heart: 'Damask Rose Otto · Peony',
        base: 'Cashmere Musk · Golden Amber'
      },
      quoteScript: 'بوی گل و ریحان همه از لطف حبیب است',
      quoteAuthor: 'Hafez Shirazi',
      quoteTranslation: '“The perfume of rose and sweet basil flows from the grace of the Beloved.”',
      badges: ['Luminescent Sillage', 'Grasse Rose Otto', 'Solar Romance'],
      spotlightGradient: 'radial-gradient(circle at 65% 45%, rgba(141, 96, 79, 0.55) 0%, rgba(23, 18, 17, 0.95) 60%, #171211 100%)',
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
      image: '/assets/products/velvet-amber.svg',
      notes: {
        top: 'Green Cardamom · Bitter Almond',
        heart: 'Bourbon Vanilla · Benzoin Resins',
        base: 'Dark Amber · Creamy Sandalwood'
      },
      quoteScript: 'ز شوق روی تو دل در برم فغان دارد',
      quoteAuthor: 'Jalal al-Din Rumi',
      quoteTranslation: '“From yearning for your presence, my heart sings within my chest.”',
      badges: ['30% Concentration', 'Bourbon Vanilla', 'Sensual Warmth'],
      spotlightGradient: 'radial-gradient(circle at 65% 45%, rgba(101, 34, 14, 0.7) 0%, rgba(94, 85, 81, 0.35) 55%, #171211 100%)',
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
      image: '/assets/products/saffron-smoke.svg',
      notes: {
        top: 'Kashmiri Saffron · Wild Thyme',
        heart: 'Temple Incense · Black Leather',
        base: 'Smoked Birch · Labdanum Resin'
      },
      quoteScript: 'عطرِ تو می آید و جان تازه می شود',
      quoteAuthor: 'Classical Persian Verse',
      quoteTranslation: '“Your fragrance arrives, and the soul is born anew.”',
      badges: ['Mongra Saffron', 'Ancient Incense', 'Limited Batch'],
      spotlightGradient: 'radial-gradient(circle at 65% 45%, rgba(101, 34, 14, 0.75) 0%, rgba(141, 96, 79, 0.45) 55%, #171211 100%)',
      accentColor: '#e5c178'
    }
  ];

  currentSlideIndex = 0;
  isPaused = false;
  isTransitioning = false;
  progressPercent = 0;

  private autoplayTimer?: ReturnType<typeof setInterval>;
  private progressInterval?: ReturnType<typeof setInterval>;
  private touchStartX = 0;
  private touchEndX = 0;
  private readonly SLIDE_DURATION_MS = 6000;
  private readonly PROGRESS_STEP_MS = 50;

  get currentSlide(): HeroSlide {
    return this.slides[this.currentSlideIndex];
  }

  ngOnInit(): void {
    this.startProgress();
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
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
    this.resetProgress();
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

  private startAutoplay(): void {
    // Progress interval drives slide advancing accurately
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
    // Look up live product from allProducts or heroProduct
    const matched = this.allProducts.find(p => 
      p.productCode === slide.productCode || 
      p.name.toLowerCase() === slide.name.toLowerCase()
    );

    if (matched) {
      this.viewProduct.emit(matched);
    } else {
      // Fallback synthetic Product instance for modal
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
