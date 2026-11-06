import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Inject, Input, NgZone, OnDestroy, OnInit, Output, PLATFORM_ID, ViewChild } from '@angular/core';
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
      class="hero-slider-section luxury-minimal-hero" 
      id="home"
      (mouseenter)="pauseAutoplay()"
      (mouseleave)="resumeAutoplay()"
      (touchstart)="onTouchStart($event)"
      (touchend)="onTouchEnd($event)"
      aria-label="Zauq and Shauq Haute Parfumerie Hero">

      <!-- Ambient Spotlight & Canvas Particles -->
      <div class="slider-backdrop" [style.background]="currentSlide.spotlightGradient"></div>
      <canvas #mistCanvas class="hero-ambient-canvas" aria-hidden="true"></canvas>
      <div class="slider-grain"></div>
      
      <!-- Top Slide Progress Indicator -->
      <div class="slide-progress-bar-wrap" aria-hidden="true">
        <div class="slide-progress-fill" [style.width.%]="progressPercent"></div>
      </div>

      <!-- ==========================================================
           MINIMALIST EDITORIAL HERO (MATCHING INSPIRATION BOARD)
           ========================================================== -->
      <div class="slider-inner page-shell hero-editorial-grid">
        
        <!-- LEFT COLUMN: EDITORIAL TYPOGRAPHY & CTAs -->
        <div class="hero-copy-col" [class.slide-transitioning]="isTransitioning">
          
          <!-- Kicker Eyebrow with Brand Monogram -->
          <div class="hero-eyebrow-row">
            <span class="hero-crest-mini-wrap">
              <img src="/assets/logo.png" alt="Z&amp;S" class="hero-crest-mini">
            </span>
            <span class="hero-kicker">✦ THE ART OF PERSONAL SCENT · HAUTE PARFUMERIE</span>
          </div>

          <!-- Main Grand Title (Scent, With Soul) -->
          <h1 class="hero-grand-title">
            <span class="title-line-1">Scent, With Soul.</span>
            <span class="title-line-2">
              <em>More Than Fragrance. It's a Feeling.</em>
            </span>
          </h1>

          <!-- Editorial Subtitle Narrative -->
          <p class="hero-lead-narrative">
            Hand-poured luxury extraits crafted for every mood, every memory, every story.
            Infused with 20-year aged wild Assam agarwood, Grasse damask rose, and sacred saffron.
          </p>

          <!-- Current Active Flacon Live Chip -->
          <div class="active-flacon-strip">
            <span class="flacon-batch-pill">✦ BATCH NO. 0{{ currentSlideIndex + 1 }} · {{ currentSlide.edition }}</span>
            <span class="flacon-active-name">{{ currentSlide.name }}</span>
            <span class="flacon-price-tag">₹{{ currentSlide.price | number }}</span>
          </div>

          <!-- Primary Action Buttons (Explore Collection & Find Your Scent) -->
          <div class="hero-actions-row">
            <button 
              type="button" 
              class="btn-flared-gold hero-cta-btn" 
              (click)="explore.emit('All Fragrances')"
              aria-label="Explore Full Fragrance Collection">
              <span class="btn-text">Explore Collection</span>
              <span class="btn-arrow">→</span>
            </button>

            <button 
              type="button" 
              class="btn-smoked-glass hero-cta-btn" 
              (click)="explore.emit('quiz')"
              aria-label="Find Your Signature Scent via Scent Finder">
              <span>Find Your Scent ✦</span>
              <span class="btn-arrow">↗</span>
            </button>
          </div>

          <!-- Slide Selector Navigation Tabs (Numbered 01 to 05) -->
          <div class="hero-tabs-nav" role="tablist" aria-label="Select Fragrance Flacon">
            <button 
              *ngFor="let s of slides; let i = index" 
              type="button" 
              class="hero-tab-pill" 
              [class.is-active]="i === currentSlideIndex"
              (click)="goToSlide(i)"
              role="tab"
              [attr.aria-selected]="i === currentSlideIndex">
              <span class="tab-index">0{{ i + 1 }}</span>
              <span class="tab-name">{{ s.name }}</span>
              <span class="tab-dot" *ngIf="i === currentSlideIndex"></span>
            </button>
          </div>

        </div>

        <!-- RIGHT COLUMN: ILLUMINATED DESIGNER FLACON STAGE WITH ATOMIZER SPRAY -->
        <div class="hero-stage-col">
          <div class="flacon-cinematic-stage" [class.stage-transitioning]="isTransitioning">
            
            <!-- Luxury Gold Frame Accents -->
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
                <div class="diffuser-floating-note">✦ Diffusing {{ currentSlide.name }}</div>
              </div>

              <!-- Main Illuminated Designer Flacon -->
              <img 
                class="flacon-hero-image" 
                [src]="currentSlide.image" 
                [alt]="currentSlide.name + ' designer perfume flacon'"
                (click)="onShopFlacon()"
                loading="eager">
              <div class="flacon-pedestal-shadow" aria-hidden="true"></div>

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

      <!-- ==========================================================
           CINEMATIC STORY VIDEO LIGHTBOX MODAL
           ========================================================== -->
      <div 
        class="video-lightbox-backdrop" 
        *ngIf="storyVideoOpen" 
        (click)="closeStoryVideo()" 
        role="dialog" 
        aria-modal="true" 
        aria-label="Zauq &amp; Shauq Parfumerie Film">
        
        <div class="video-lightbox-card" (click)="$event.stopPropagation()">
          <button 
            type="button" 
            class="video-lightbox-close" 
            (click)="closeStoryVideo()" 
            aria-label="Close video">
            ✕
          </button>
          
          <div class="video-player-wrap">
            <video 
              #storyVideoPlayer
              class="story-video-element" 
              src="/assets/videos/perfume-cinematic-reel.mp4" 
              controls 
              autoplay 
              playsinline>
            </video>
          </div>
          
          <div class="video-card-footer">
            <div>
              <span class="video-kicker">MAISON DE HAUTE PARFUMERIE</span>
              <h4>The Art of Scent · The Ritual of Extrait</h4>
            </div>
            <button type="button" class="btn-flared-gold btn-video-shop" (click)="closeStoryVideo(); onShopFlacon()">
              <span>Explore Fragrances</span>
              <span>↗</span>
            </button>
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
  @ViewChild('storyVideoPlayer') private storyVideoPlayerRef?: ElementRef<HTMLVideoElement>;

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
      accords: [
        { name: 'Oud & Woods', percent: 96, color: '#8B5A2B' },
        { name: 'Warm Amber', percent: 85, color: '#D49B35' },
        { name: 'Warm Spicy', percent: 74, color: '#9C3D28' },
        { name: 'Smoky Incense', percent: 66, color: '#3A3238' }
      ],
      fragrantica: {
        longevity: 'Eternal (16+ hrs)',
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
      image: '/assets/products/rose-eclat.svg',
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
      image: '/assets/products/velvet-amber.svg',
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
      image: '/assets/products/saffron-smoke.svg',
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
      image: '/assets/products/azure-coast.svg',
      notes: {
        top: 'Calabrian Bergamot · Sea Salt',
        heart: 'Neroli Petals · White Tea',
        base: 'Sunlit Driftwood · Ocean Amber'
      },
      accords: [
        { name: 'Calabrian Bergamot', percent: 96, color: '#E2BD38' },
        { name: 'Sunlit Driftwood', percent: 84, color: '#8B7355' },
        { name: 'Sea Salt & Neroli', percent: 76, color: '#66B2B2' },
        { name: 'Clean White Musk', percent: 62, color: '#C9D6DF' }
      ],
      fragrantica: {
        longevity: 'Long Lasting (10+ hrs)',
        sillage: 'Moderate & Fresh',
        season: 'Spring · Summer',
        timeOfDay: 'Daytime Elegance'
      },
      quoteScript: 'نسیم صبا بوی بهشت می‌آورد',
      quoteAuthor: 'Saadi Shirazi',
      quoteTranslation: '“The morning breeze carries the fragrance of paradise.”',
      badges: ['Calabrian Citrus', 'Sea Salt Air', 'Refreshing Extrait'],
      spotlightGradient: 'radial-gradient(circle at 65% 45%, rgba(20, 75, 85, 0.72) 0%, rgba(4, 22, 28, 0.96) 60%, #020c10 100%)',
      accentColor: '#8ed0b5'
    }
  ];

  currentSlideIndex = 0;
  progressPercent = 0;
  isPaused = false;
  isTransitioning = false;
  isSpritzing = false;
  storyVideoOpen = false;

  private readonly SLIDE_DURATION_MS = 8500;
  private readonly PROGRESS_STEP_MS = 50;
  private progressInterval: any;
  private autoplayTimer: any;
  private spritzTimeout: any;

  private touchStartX = 0;
  private touchEndX = 0;
  private animFrameId?: number;

  private isBrowser: boolean;
  private resizeListener?: () => void;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private ngZone: NgZone
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.startProgress();
    // Auto-spritz the initial flacon lightly
    setTimeout(() => this.triggerSpritz(), 800);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.initMistCanvas();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    if (this.spritzTimeout) clearTimeout(this.spritzTimeout);
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.resizeListener && this.isBrowser) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  get currentSlide(): HeroSlide {
    return this.slides[this.currentSlideIndex] || this.slides[0];
  }

  openStoryVideo(): void {
    this.storyVideoOpen = true;
    this.pauseAutoplay();
  }

  closeStoryVideo(): void {
    this.storyVideoOpen = false;
    this.resumeAutoplay();
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.storyVideoOpen) {
      this.closeStoryVideo();
    }
  }

  nextSlide(): void {
    this.triggerTransition();
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
    this.resetProgress();
    this.triggerSpritz();
  }

  prevSlide(): void {
    this.triggerTransition();
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.slides.length) % this.slides.length;
    this.resetProgress();
    this.triggerSpritz();
  }

  goToSlide(index: number): void {
    if (index === this.currentSlideIndex || index < 0 || index >= this.slides.length) {
      return;
    }
    this.triggerTransition();
    this.currentSlideIndex = index;
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
    if (!this.storyVideoOpen) {
      this.isPaused = false;
    }
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
        this.nextSlide();
      } else {
        this.prevSlide();
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

  private initMistCanvas(): void {
    if (!this.isBrowser || !this.mistCanvasRef) return;
    const canvas = this.mistCanvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || 650;
    };
    resize();
    this.resizeListener = resize;
    window.addEventListener('resize', resize, { passive: true });

    const particles: Array<{
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
    }> = [];

    const colors = ['#e5c178', '#c89d54', '#deb46a', '#ffffff', '#8ed0b5'];

    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.6 - 0.2,
        alpha: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    this.ngZone.runOutsideAngular(() => {
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -10) {
            p.y = canvas.height + 10;
            p.x = Math.random() * canvas.width;
          }
          if (p.x < -10) p.x = canvas.width + 10;
          if (p.x > canvas.width + 10) p.x = -10;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
        }

        ctx.globalAlpha = 1.0;
        this.animFrameId = requestAnimationFrame(render);
      };

      this.animFrameId = requestAnimationFrame(render);
    });
  }
}
