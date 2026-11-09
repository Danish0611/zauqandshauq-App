import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, NgZone, OnDestroy, OnInit, Output, PLATFORM_ID, ViewChild } from '@angular/core';
import { ProductService } from '../../product.service';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  decay: number;
  color: string;
}

@Component({
  selector: 'app-intro-spray',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *ngIf="!isFinished"
      class="spray-intro-overlay"
      [class.force-intro]="forceIntro"
      [class.intro-dissolving]="isDissolving"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Zauq & Shauq">

      <!-- Particle Canvas -->
      <canvas #mistCanvas class="intro-mist-canvas"></canvas>

      <!-- Center Flacon Stage -->
      <div class="intro-bottle-stage" [class.nozzle-active]="isSpraying">
        <div class="intro-nozzle-plume" [class.plume-burst]="isSpraying" aria-hidden="true"></div>
        <img
          src="/assets/hero-fragrance.svg"
          alt="Zauq &amp; Shauq signature flacon"
          class="intro-bottle-image"
          [class.bottle-pulse]="isSpraying" />
        
        <div class="intro-brand-lockup">
          <img src="/assets/logo/svg/zauq-shauq-mark-gold.svg" alt="Zauq &amp; Shauq Crest" class="intro-crest-logo" width="56" height="56">
          <span class="intro-kicker">HAUTE PARFUMERIE · PARIS &amp; JAIPUR</span>
          <h1 class="intro-title">ZAUQ <span>&amp;</span> SHAUQ</h1>
          <p class="intro-tagline">Scent, With Soul</p>
        </div>
      </div>

      <!-- Skip Button -->
      <button
        type="button"
        class="intro-skip-btn"
        (click)="skipIntro()"
        aria-label="Skip fragrance opening">
        <span>Skip Intro</span>
        <span class="skip-arrow">→</span>
      </button>

      <!-- Subtitle Audio/Visual Cue -->
      <div class="intro-bottom-caption">
        <span>“Khushboo woh khamosh zubaan hai...” · Atomizing signature extraits</span>
      </div>
    </div>
  `,
  styles: [`
    .spray-intro-overlay {
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: radial-gradient(circle at 50% 40%, #1e2819 0%, #0d0f0b 75%, #050704 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1),
                  transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
      overflow: hidden;
      user-select: none;
    }

    .intro-dissolving {
      opacity: 0;
      transform: scale(1.08);
      pointer-events: none;
    }

    .intro-mist-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2;
    }

    .intro-bottle-stage {
      position: relative;
      z-index: 3;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      transform: translateY(-20px);
      transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .intro-bottle-image {
      width: min(240px, 45vw);
      height: auto;
      filter: drop-shadow(0 20px 50px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 35px rgba(201, 169, 110, 0.35));
      transition: transform 0.35s ease;
    }

    .bottle-pulse {
      transform: scale(1.03) translateY(-4px);
    }

    .intro-brand-lockup {
      margin-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: center;
    }

    .intro-crest-logo {
      filter: drop-shadow(0 0 16px rgba(201, 169, 110, 0.65));
      animation: floatCrest 4s ease-in-out infinite;
    }

    @keyframes floatCrest {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    .intro-kicker {
      font-family: var(--font-body, 'Inter', sans-serif);
      font-size: 10px;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--color-champagne-gold, #C9A96E);
      font-weight: 600;
    }

    .intro-title {
      font-family: var(--font-heading, 'Cormorant Garamond', serif);
      font-size: clamp(32px, 5vw, 48px);
      font-weight: 500;
      letter-spacing: 0.15em;
      color: var(--color-warm-ivory, #F5EFE6);
      margin: 0;
      line-height: 1.1;
    }

    .intro-title span {
      font-style: italic;
      color: var(--color-champagne-gold, #C9A96E);
    }

    .intro-tagline {
      font-family: var(--font-heading, 'Cormorant Garamond', serif);
      font-style: italic;
      font-size: 18px;
      letter-spacing: 0.08em;
      color: rgba(245, 239, 230, 0.8);
      margin: 0;
    }

    .intro-skip-btn {
      position: absolute;
      top: 32px;
      right: 36px;
      z-index: 10;
      background: rgba(32, 42, 28, 0.55);
      border: 1px solid rgba(201, 169, 110, 0.35);
      color: var(--color-warm-ivory, #F5EFE6);
      padding: 10px 20px;
      border-radius: 999px;
      font-family: var(--font-body, 'Inter', sans-serif);
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      backdrop-filter: blur(12px);
      transition: all 0.25s ease;
    }

    .intro-skip-btn:hover {
      background: rgba(201, 169, 110, 0.2);
      border-color: var(--color-champagne-gold, #C9A96E);
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 4px 18px rgba(201, 169, 110, 0.3);
    }

    .intro-bottom-caption {
      position: absolute;
      bottom: 28px;
      color: rgba(245, 239, 230, 0.55);
      font-size: 11px;
      letter-spacing: 0.1em;
      text-align: center;
      padding: 0 20px;
      z-index: 10;
    }

    @media (prefers-reduced-motion: reduce) {
      .spray-intro-overlay:not(.force-intro) {
        display: none !important;
      }
    }
  `]
})
export class IntroSprayComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() completed = new EventEmitter<void>();
  @ViewChild('mistCanvas') mistCanvasRef?: ElementRef<HTMLCanvasElement>;

  isSpraying = false;
  isDissolving = false;
  isFinished = false;
  forceIntro = false;

  private animFrameId: number | null = null;
  private particles: Particle[] = [];
  private isBrowser: boolean;
  private timeouts: any[] = [];

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private ngZone: NgZone,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      this.isFinished = true;
      return;
    }

    // Check ?intro=1 URL override for testing
    try {
      const urlParams = new URLSearchParams(window.location.search);
      this.forceIntro = urlParams.get('intro') === '1';
    } catch {
      this.forceIntro = false;
    }

    // Check if session has already experienced intro unless overridden by ?intro=1
    try {
      if (!this.forceIntro) {
        const seen = sessionStorage.getItem('zs_intro_seen');
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (seen || prefersReduced) {
          this.isFinished = true;
          this.completed.emit();
          return;
        }
      }
    } catch {
      // Storage unavailable or disabled
    }

    // Pre-warm the backend API during the 2-3s animation so hero data is ready immediately
    this.productService.getProducts().subscribe({
      next: () => {},
      error: () => {}
    });
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser || this.isFinished) return;

    this.initCanvasAndAnimation();
  }

  private initCanvasAndAnimation(): void {
    const canvas = this.mistCanvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    // Trigger spray after 400ms
    const sprayTimer = setTimeout(() => {
      this.isSpraying = true;
      this.spawnMistBurst(canvas.width / 2, canvas.height * 0.38);
      this.cdr.markForCheck();
    }, 400);
    this.timeouts.push(sprayTimer);

    // Run animation outside Angular zone for high performance
    this.ngZone.runOutsideAngular(() => {
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.radius += 0.35;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            this.particles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color.replace('ALPHA', p.alpha.toFixed(3));
          ctx.shadowColor = 'rgba(201, 169, 110, 0.4)';
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.restore();
        }

        this.animFrameId = requestAnimationFrame(render);
      };

      this.animFrameId = requestAnimationFrame(render);
    });

    // Dissolve overlay at 2.4s and finish at 3.0s
    const dissolveTimer = setTimeout(() => {
      this.isDissolving = true;
      this.cdr.markForCheck();
    }, 2400);
    this.timeouts.push(dissolveTimer);

    const finishTimer = setTimeout(() => {
      this.finishIntro();
    }, 3100);
    this.timeouts.push(finishTimer);
  }

  private spawnMistBurst(originX: number, originY: number): void {
    const count = 120;
    const colors = [
      'rgba(245, 239, 230, ALPHA)',
      'rgba(201, 169, 110, ALPHA)',
      'rgba(223, 199, 150, ALPHA)',
      'rgba(255, 255, 255, ALPHA)'
    ];

    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
      const speed = 2.5 + Math.random() * 8.5;
      this.particles.push({
        x: originX + (Math.random() - 0.5) * 20,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        radius: 2 + Math.random() * 4,
        alpha: 0.85 + Math.random() * 0.15,
        decay: 0.008 + Math.random() * 0.012,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  skipIntro(): void {
    this.finishIntro();
  }

  private finishIntro(): void {
    this.isDissolving = true;
    this.cdr.markForCheck();
    const t = setTimeout(() => {
      this.isFinished = true;
      this.cdr.markForCheck();
      try {
        sessionStorage.setItem('zs_intro_seen', 'true');
      } catch {}
      this.completed.emit();
    }, 350);
    this.timeouts.push(t);
  }

  ngOnDestroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.timeouts.forEach(t => clearTimeout(t));
  }
}


