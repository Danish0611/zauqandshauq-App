import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-glass-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="luxury-glass-card"
      [class.card-interactive]="interactive"
      [class.card-deep]="variant === 'deep'"
      [class.card-subtle]="variant === 'subtle'"
      [class.card-gold-accent]="variant === 'accent'"
      [ngStyle]="{ padding: padding }">
      <div class="glass-glare-overlay" aria-hidden="true"></div>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .luxury-glass-card {
      position: relative;
      background: var(--glass-bg, rgba(32, 42, 28, 0.72));
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--color-champagne-border, rgba(201, 169, 110, 0.24));
      border-radius: var(--radius-md, 14px);
      box-shadow: var(--glass-shadow-sm, 0 10px 24px rgba(13, 15, 11, 0.4));
      color: var(--color-warm-ivory, #F5EFE6);
      transition: transform var(--duration-normal, 400ms) var(--ease-luxury, cubic-bezier(0.22, 1, 0.36, 1)),
                  border-color var(--duration-normal, 400ms) ease,
                  box-shadow var(--duration-normal, 400ms) ease,
                  background var(--duration-normal, 400ms) ease;
      overflow: hidden;
    }

    @supports not (backdrop-filter: blur(1px)) {
      .luxury-glass-card {
        background: #1a2317;
      }
    }

    .card-deep {
      background: var(--glass-bg-deep, rgba(13, 15, 11, 0.85));
      border-color: rgba(201, 169, 110, 0.18);
    }

    .card-subtle {
      background: var(--glass-bg-subtle, rgba(32, 42, 28, 0.45));
      border-color: rgba(201, 169, 110, 0.15);
    }

    .card-gold-accent {
      border-color: rgba(201, 169, 110, 0.48);
      box-shadow: 0 12px 32px rgba(13, 15, 11, 0.5), 0 0 20px rgba(201, 169, 110, 0.15);
    }

    .card-interactive {
      cursor: pointer;
    }

    .card-interactive:hover {
      transform: translateY(-4px);
      border-color: var(--color-champagne-gold, #C9A96E);
      box-shadow: var(--glass-shadow, 0 20px 48px rgba(13, 15, 11, 0.65)),
                  0 0 24px rgba(201, 169, 110, 0.2);
    }

    .glass-glare-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 35%;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, transparent 100%);
      pointer-events: none;
    }
  `]
})
export class GlassCardComponent {
  @Input() variant: 'default' | 'deep' | 'subtle' | 'accent' = 'default';
  @Input() interactive = false;
  @Input() padding = '1.75rem';
}
