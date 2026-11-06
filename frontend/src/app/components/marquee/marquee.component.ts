import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-marquee',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="luxury-marquee-wrap" [class.reverse]="reverse" aria-hidden="true">
      <div class="marquee-track" [style.animation-duration]="speed + 's'">
        <div class="marquee-group">
          <span class="marquee-item" *ngFor="let item of items">
            <span class="marquee-star">✦</span>
            <span class="marquee-text">{{ item }}</span>
          </span>
        </div>
        <div class="marquee-group" aria-hidden="true">
          <span class="marquee-item" *ngFor="let item of items">
            <span class="marquee-star">✦</span>
            <span class="marquee-text">{{ item }}</span>
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      overflow: hidden;
    }

    .luxury-marquee-wrap {
      width: 100%;
      overflow: hidden;
      padding: 12px 0;
      background: linear-gradient(90deg, rgba(13, 15, 11, 0.95) 0%, rgba(32, 42, 28, 0.95) 50%, rgba(13, 15, 11, 0.95) 100%);
      border-top: 1px solid rgba(201, 169, 110, 0.18);
      border-bottom: 1px solid rgba(201, 169, 110, 0.18);
      white-space: nowrap;
      user-select: none;
    }

    .marquee-track {
      display: flex;
      width: max-content;
      animation: marqueeScroll linear infinite;
    }

    .luxury-marquee-wrap:hover .marquee-track {
      animation-play-state: paused;
    }

    .reverse .marquee-track {
      animation-direction: reverse;
    }

    .marquee-group {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .marquee-item {
      display: inline-flex;
      align-items: center;
      gap: 1.5rem;
      padding: 0 1.5rem;
    }

    .marquee-star {
      color: var(--color-champagne-gold, #C9A96E);
      font-size: 11px;
      opacity: 0.85;
      animation: starSpin 8s linear infinite;
    }

    .marquee-text {
      font-family: var(--font-heading, 'Cormorant Garamond', serif);
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--color-warm-ivory, #F5EFE6);
      opacity: 0.92;
    }

    @keyframes marqueeScroll {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(-50%);
      }
    }

    @keyframes starSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (prefers-reduced-motion: reduce) {
      .marquee-track {
        animation: none;
      }
      .marquee-star {
        animation: none;
      }
    }
  `]
})
export class MarqueeComponent {
  @Input() items: string[] = [
    'SCENT, WITH SOUL',
    'PURE EXTRAIT DE PARFUM',
    'WILD ASSAM AGARWOOD',
    'MYSORE SANDALWOOD',
    'GRASSE DAMASK ROSE',
    '24-HOUR PROJECTION',
    'HAND-POURED IN SMALL BATCHES',
    'HAUTE PARFUMERIE EDITORIAL'
  ];
  @Input() speed = 28;
  @Input() reverse = false;
}
