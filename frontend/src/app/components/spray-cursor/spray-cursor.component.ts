import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, NgZone, OnDestroy, PLATFORM_ID, ViewChild } from '@angular/core';
import { ThemeService } from '../../theme.service';

interface CursorParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  gold: boolean;
}

@Component({
  selector: 'app-spray-cursor',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="themeService.cursorEnabled$ | async">
      <canvas #cursorCanvas class="spray-cursor-canvas" aria-hidden="true"></canvas>
      <div #cursorDot class="luxury-cursor-dot" aria-hidden="true"></div>
      <div #cursorRing class="luxury-cursor-ring" aria-hidden="true"></div>
    </ng-container>
  `,
  styles: [`
    :host {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 999990;
    }

    .spray-cursor-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    /* ZERO-LAG IMMEDIATE PINPOINT DOT */
    .luxury-cursor-dot {
      position: fixed;
      top: 0;
      left: 0;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-champagne-gold, #C9A96E);
      box-shadow: 0 0 6px var(--color-champagne-gold, #C9A96E);
      pointer-events: none;
      z-index: 999993;
      opacity: 0;
      transform: translate3d(-100px, -100px, 0) translate(-50%, -50%);
      will-change: transform;
      transition: opacity 0.15s ease, background-color 0.2s ease;
    }

    /* SNAPPY LIQUID AURA RING */
    .luxury-cursor-ring {
      position: fixed;
      top: 0;
      left: 0;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 1.5px solid var(--color-champagne-border, rgba(201, 169, 110, 0.45));
      pointer-events: none;
      z-index: 999992;
      opacity: 0;
      transform: translate3d(-100px, -100px, 0) translate(-50%, -50%);
      will-change: transform;
      transition: width 0.18s cubic-bezier(0.22, 1, 0.36, 1),
                  height 0.18s cubic-bezier(0.22, 1, 0.36, 1),
                  border-color 0.2s ease,
                  background-color 0.2s ease,
                  opacity 0.2s ease;
    }

    .luxury-cursor-ring.hover-active {
      width: 44px;
      height: 44px;
      border-color: var(--color-champagne-gold, #C9A96E);
      background: var(--color-champagne-dim, rgba(201, 169, 110, 0.1));
    }

    @media (pointer: coarse) {
      .luxury-cursor-dot,
      .luxury-cursor-ring {
        display: none !important;
      }
    }
  `]
})
export class SprayCursorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('cursorCanvas') canvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('cursorDot') dotRef?: ElementRef<HTMLDivElement>;
  @ViewChild('cursorRing') ringRef?: ElementRef<HTMLDivElement>;

  private isBrowser: boolean;
  private ringX = -100;
  private ringY = -100;
  private targetX = -100;
  private targetY = -100;
  private lastEmitX = -100;
  private lastEmitY = -100;
  private isMouseDown = false;
  private particles: CursorParticle[] = [];
  private animId: number | null = null;
  private cleanups: (() => void)[] = [];

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private ngZone: NgZone,
    public themeService: ThemeService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    // Run outside Angular's zone to prevent change detection overhead on mousemove
    this.ngZone.runOutsideAngular(() => {
      this.initCursorEngine();
    });
  }

  private initCursorEngine(): void {
    const canvas = this.canvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d');

    const resize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    this.cleanups.push(() => window.removeEventListener('resize', resize));

    // Visibility listener to pause RAF when tab is hidden
    const visibilityListener = () => {
      if (document.hidden && this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      } else if (!document.hidden && !this.animId && ctx && canvas) {
        this.startLoop(ctx, canvas);
      }
    };
    document.addEventListener('visibilitychange', visibilityListener);
    this.cleanups.push(() => document.removeEventListener('visibilitychange', visibilityListener));

    // INSTANT 1:1 hardware mousemove tracking
    const onMouseMove = (e: MouseEvent) => {
      this.targetX = e.clientX;
      this.targetY = e.clientY;

      // Update inner dot IMMEDIATELY with zero latency
      if (this.dotRef?.nativeElement) {
        const dot = this.dotRef.nativeElement;
        dot.style.opacity = '1';
        dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }

      if (this.ringRef?.nativeElement && this.ringRef.nativeElement.style.opacity !== '1') {
        this.ringRef.nativeElement.style.opacity = '1';
      }

      // Spawn subtle mist droplet only on deliberate motion (> 18px delta)
      const dx = e.clientX - this.lastEmitX;
      const dy = e.clientY - this.lastEmitY;
      if (dx * dx + dy * dy > 324) {
        this.lastEmitX = e.clientX;
        this.lastEmitY = e.clientY;
        this.emitParticle(e.clientX, e.clientY, 1, false);
      }
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    this.cleanups.push(() => window.removeEventListener('mousemove', onMouseMove));

    // Mouse down mist plume burst
    const onMouseDown = (e: MouseEvent) => {
      this.isMouseDown = true;
      this.emitBurst(e.clientX, e.clientY, 12);
    };
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    this.cleanups.push(() => window.removeEventListener('mousedown', onMouseDown));

    const onMouseUp = () => {
      this.isMouseDown = false;
    };
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    this.cleanups.push(() => window.removeEventListener('mouseup', onMouseUp));

    // Touch tap mist burst for touchscreens
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        this.emitBurst(t.clientX, t.clientY, 8);
      }
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    this.cleanups.push(() => window.removeEventListener('touchstart', onTouchStart));

    // Fast magnetic hover detection
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const matches = target && !!target.closest('a, button, [role="button"], .product-card, .luxury-cat-card, input, select');
      if (this.ringRef?.nativeElement) {
        this.ringRef.nativeElement.classList.toggle('hover-active', !!matches);
      }
    };
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    this.cleanups.push(() => document.removeEventListener('mouseover', onMouseOver));

    if (ctx && canvas) {
      this.startLoop(ctx, canvas);
    }
  }

  private startLoop(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const loop = () => {
      // Snappy, liquid follow for the outer ring (lerp 0.55 for zero sluggishness)
      this.ringX += (this.targetX - this.ringX) * 0.55;
      this.ringY += (this.targetY - this.ringY) * 0.55;

      if (this.ringRef?.nativeElement) {
        this.ringRef.nativeElement.style.transform = `translate3d(${this.ringX}px, ${this.ringY}px, 0) translate(-50%, -50%)`;
      }

      // Continuous stream on mouse drag
      if (this.isMouseDown) {
        this.emitParticle(this.targetX, this.targetY, 2, true);
      }

      // Fast GPU-friendly particle rendering (NO shadowBlur!)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (this.particles.length > 0) {
        const accentRgb = (typeof document !== 'undefined' && document.documentElement.style.getPropertyValue('--cursor-accent-rgb')) || '201, 169, 110';

        for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.size += 0.05;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            this.particles.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.gold
            ? `rgba(${accentRgb}, ${p.alpha.toFixed(2)})`
            : `rgba(255, 248, 235, ${p.alpha.toFixed(2)})`;
          ctx.fill();
        }
      }

      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  }

  private emitParticle(x: number, y: number, count: number, strong: boolean): void {
    if (this.particles.length > 50) return; // Strict particle cap for high FPS

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = strong ? 1.5 + Math.random() * 2.5 : 0.4 + Math.random() * 1.0;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.2,
        size: 1.0 + Math.random() * 1.8,
        alpha: 0.5 + Math.random() * 0.3,
        decay: 0.02 + Math.random() * 0.025,
        gold: Math.random() > 0.4
      });
    }
  }

  private emitBurst(x: number, y: number, count: number): void {
    if (this.particles.length > 50) return;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.4,
        size: 1.2 + Math.random() * 2.4,
        alpha: 0.75 + Math.random() * 0.25,
        decay: 0.025 + Math.random() * 0.03,
        gold: Math.random() > 0.3
      });
    }
  }

  ngOnDestroy(): void {
    if (this.animId) cancelAnimationFrame(this.animId);
    this.cleanups.forEach(cleanup => cleanup());
    this.cleanups = [];
  }
}
