import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, Inject, NgZone, OnDestroy, PLATFORM_ID, ViewChild } from '@angular/core';

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
    <canvas #cursorCanvas class="spray-cursor-canvas" aria-hidden="true"></canvas>
    <div #cursorFollower class="luxury-cursor-follower" [class.hover-active]="isHovering" aria-hidden="true">
      <div class="cursor-dot"></div>
      <div class="cursor-ring"></div>
    </div>
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

    .luxury-cursor-follower {
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: width 0.22s var(--ease-luxury, ease),
                  height 0.22s var(--ease-luxury, ease),
                  opacity 0.22s ease;
      opacity: 0;
    }

    .cursor-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--color-champagne-gold, #C9A96E);
      box-shadow: 0 0 8px rgba(201, 169, 110, 0.8);
      transition: transform 0.2s ease;
    }

    .cursor-ring {
      position: absolute;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 1px solid rgba(201, 169, 110, 0.35);
      transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.25s ease;
    }

    .hover-active .cursor-ring {
      transform: scale(1.6);
      border-color: var(--color-champagne-gold, #C9A96E);
      background: rgba(201, 169, 110, 0.08);
    }

    .hover-active .cursor-dot {
      transform: scale(1.4);
    }

    @media (pointer: coarse) {
      .luxury-cursor-follower {
        display: none !important;
      }
    }
  `]
})
export class SprayCursorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('cursorCanvas') canvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('cursorFollower') followerRef?: ElementRef<HTMLDivElement>;

  isHovering = false;
  private isBrowser: boolean;
  private isFinePointer = false;
  private mouseX = -100;
  private mouseY = -100;
  private targetX = -100;
  private targetY = -100;
  private isMouseDown = false;
  private particles: CursorParticle[] = [];
  private animId: number | null = null;
  private cleanups: (() => void)[] = [];

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private ngZone: NgZone
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.isFinePointer = window.matchMedia('(pointer: fine)').matches;

    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    this.cleanups.push(() => window.removeEventListener('resize', resize));

    // Handle tab visibility to pause RAF
    const visibilityListener = () => {
      if (document.hidden && this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      } else if (!document.hidden && !this.animId) {
        this.startLoop(ctx, canvas);
      }
    };
    document.addEventListener('visibilitychange', visibilityListener);
    this.cleanups.push(() => document.removeEventListener('visibilitychange', visibilityListener));

    // Run animation outside Angular zone
    this.ngZone.runOutsideAngular(() => {
      // Event listeners for smooth mouse tracking
      const onMouseMove = (e: MouseEvent) => {
        this.targetX = e.clientX;
        this.targetY = e.clientY;

        if (this.followerRef?.nativeElement) {
          this.followerRef.nativeElement.style.opacity = '1';
        }

        // Spawn a gentle particle on move
        if (Math.random() > 0.6) {
          this.emitParticle(this.targetX, this.targetY, 1, false);
        }
      };
      window.addEventListener('mousemove', onMouseMove, { passive: true });
      this.cleanups.push(() => window.removeEventListener('mousemove', onMouseMove));

      const onMouseDown = (e: MouseEvent) => {
        this.isMouseDown = true;
        this.emitBurst(e.clientX, e.clientY, 18);
      };
      window.addEventListener('mousedown', onMouseDown, { passive: true });
      this.cleanups.push(() => window.removeEventListener('mousedown', onMouseDown));

      const onMouseUp = () => {
        this.isMouseDown = false;
      };
      window.addEventListener('mouseup', onMouseUp, { passive: true });
      this.cleanups.push(() => window.removeEventListener('mouseup', onMouseUp));

      // Touch tap mist puff
      const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          const t = e.touches[0];
          this.emitBurst(t.clientX, t.clientY, 10);
        }
      };
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      this.cleanups.push(() => window.removeEventListener('touchstart', onTouchStart));

      // Detect hover over interactive elements with direct DOM update
      const onMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        const matches = target && !!target.closest('a, button, [role="button"], .product-card, .luxury-cat-card, input, select');
        if (this.followerRef?.nativeElement) {
          this.followerRef.nativeElement.classList.toggle('hover-active', !!matches);
        }
      };
      document.addEventListener('mouseover', onMouseOver, { passive: true });
      this.cleanups.push(() => document.removeEventListener('mouseover', onMouseOver));

      this.startLoop(ctx, canvas);
    });
  }

  private startLoop(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const loop = () => {
      // Ease cursor follower position
      this.mouseX += (this.targetX - this.mouseX) * 0.18;
      this.mouseY += (this.targetY - this.mouseY) * 0.18;

      if (this.followerRef?.nativeElement) {
        this.followerRef.nativeElement.style.transform = `translate3d(${this.mouseX}px, ${this.mouseY}px, 0)`;
      }

      // If mouse held down, continuously emit mist stream
      if (this.isMouseDown) {
        this.emitParticle(this.targetX, this.targetY, 3, true);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.size += 0.08;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(201, 169, 110, ${p.alpha.toFixed(3)})`
          : `rgba(245, 239, 230, ${p.alpha.toFixed(3)})`;
        ctx.shadowColor = 'rgba(201, 169, 110, 0.3)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      }

      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  }

  private emitParticle(x: number, y: number, count: number, strong: boolean): void {
    if (this.particles.length > 80) return; // Cap particles for performance

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = strong ? 1.5 + Math.random() * 3 : 0.4 + Math.random() * 1.2;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.3,
        size: 1.2 + Math.random() * 2.2,
        alpha: 0.6 + Math.random() * 0.3,
        decay: 0.015 + Math.random() * 0.02,
        gold: Math.random() > 0.4
      });
    }
  }

  private emitBurst(x: number, y: number, count: number): void {
    if (this.particles.length > 80) return;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 4.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        size: 1.5 + Math.random() * 3,
        alpha: 0.8 + Math.random() * 0.2,
        decay: 0.02 + Math.random() * 0.025,
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

