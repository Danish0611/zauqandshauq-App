import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface PyramidTier {
  level: 'top' | 'heart' | 'base';
  title: string;
  duration: string;
  notes: string[];
  description: string;
  limbicRole: string;
}

@Component({
  selector: 'app-scent-notes-pyramid',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="scent-pyramid-container">
      <div class="pyramid-header">
        <span class="pyramid-kicker">✦ OLFACTORY ARCHITECTURE</span>
        <h3 class="pyramid-title">The Three Olfactory Movements</h3>
        <p class="pyramid-subtitle">How our pure extraits unfold upon warm pulse points over 24 hours.</p>
      </div>

      <!-- Pyramid Visual Stack -->
      <div class="pyramid-stack" role="tablist" aria-label="Olfactory note tiers">
        <!-- TOP NOTES TIER -->
        <div
          class="pyramid-tier tier-top"
          [class.active-tier]="activeTier === 'top'"
          (click)="selectTier('top')"
          role="tab"
          [attr.aria-selected]="activeTier === 'top'"
          tabindex="0">
          <div class="tier-shape">
            <span class="tier-level-num">I</span>
            <div class="tier-info">
              <div class="tier-header-row">
                <strong class="tier-name">Top Notes</strong>
                <span class="tier-time">0 – 30 mins</span>
              </div>
              <p class="tier-summary">The vibrant first impression · Volatile sparkling citrus & aromatics</p>
            </div>
          </div>
          <div class="tier-expanded-panel" *ngIf="activeTier === 'top'">
            <div class="notes-chip-row">
              <span class="pyramid-note-chip" *ngFor="let note of topNotes">{{ note }}</span>
            </div>
            <p class="tier-desc">Luminous botanicals greet the senses immediately upon spritzing, creating an invigorating opening veil.</p>
          </div>
        </div>

        <!-- HEART NOTES TIER -->
        <div
          class="pyramid-tier tier-heart"
          [class.active-tier]="activeTier === 'heart'"
          (click)="selectTier('heart')"
          role="tab"
          [attr.aria-selected]="activeTier === 'heart'"
          tabindex="0">
          <div class="tier-shape">
            <span class="tier-level-num">II</span>
            <div class="tier-info">
              <div class="tier-header-row">
                <strong class="tier-name">Heart Notes</strong>
                <span class="tier-time">1 – 4 hours</span>
              </div>
              <p class="tier-summary">The true identity & soul · Rare damask rose, golden saffron & spiced spices</p>
            </div>
          </div>
          <div class="tier-expanded-panel" *ngIf="activeTier === 'heart'">
            <div class="notes-chip-row">
              <span class="pyramid-note-chip" *ngFor="let note of heartNotes">{{ note }}</span>
            </div>
            <p class="tier-desc">As the initial radiance settles, the heart blooms to reveal the authentic signature of the composition.</p>
          </div>
        </div>

        <!-- BASE NOTES TIER -->
        <div
          class="pyramid-tier tier-base"
          [class.active-tier]="activeTier === 'base'"
          (click)="selectTier('base')"
          role="tab"
          [attr.aria-selected]="activeTier === 'base'"
          tabindex="0">
          <div class="tier-shape">
            <span class="tier-level-num">III</span>
            <div class="tier-info">
              <div class="tier-header-row">
                <strong class="tier-name">Base Notes & Dry-down</strong>
                <span class="tier-time">5 – 24+ hours</span>
              </div>
              <p class="tier-summary">The enduring memory · Wild Assam agarwood, ambergris & Mysore sandalwood</p>
            </div>
          </div>
          <div class="tier-expanded-panel" *ngIf="activeTier === 'base'">
            <div class="notes-chip-row">
              <span class="pyramid-note-chip" *ngFor="let note of baseNotes">{{ note }}</span>
            </div>
            <p class="tier-desc">Heavy molecular resins, natural fixatives, and ancient woods that bond intimately with your skin chemistry.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scent-pyramid-container {
      background: rgba(32, 42, 28, 0.65);
      border: 1px solid rgba(201, 169, 110, 0.25);
      border-radius: var(--radius-md, 14px);
      padding: 1.8rem;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 16px 40px rgba(13, 15, 11, 0.45);
      color: var(--color-warm-ivory, #F5EFE6);
    }

    .pyramid-header {
      margin-bottom: 1.5rem;
    }

    .pyramid-kicker {
      font-size: 10px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--color-champagne-gold, #C9A96E);
      font-weight: 600;
    }

    .pyramid-title {
      font-family: var(--font-heading, 'Cormorant Garamond', serif);
      font-size: 24px;
      color: var(--color-warm-ivory, #F5EFE6);
      margin: 4px 0 6px;
      font-weight: 600;
    }

    .pyramid-subtitle {
      font-size: 12px;
      color: var(--color-ivory-dim, rgba(245, 239, 230, 0.8));
      margin: 0;
      line-height: 1.5;
    }

    .pyramid-stack {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .pyramid-tier {
      background: rgba(13, 15, 11, 0.7);
      border: 1px solid rgba(201, 169, 110, 0.2);
      border-radius: var(--radius-sm, 8px);
      padding: 14px 18px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      outline: none;
    }

    .pyramid-tier:hover {
      background: rgba(32, 42, 28, 0.85);
      border-color: rgba(201, 169, 110, 0.45);
      transform: translateX(4px);
    }

    .pyramid-tier.active-tier {
      background: rgba(32, 42, 28, 0.95);
      border-color: var(--color-champagne-gold, #C9A96E);
      box-shadow: 0 8px 24px rgba(13, 15, 11, 0.6), 0 0 16px rgba(201, 169, 110, 0.2);
    }

    .tier-shape {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .tier-level-num {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(201, 169, 110, 0.15);
      border: 1px solid rgba(201, 169, 110, 0.4);
      color: var(--color-champagne-gold, #C9A96E);
      font-family: var(--font-heading, 'Cormorant Garamond', serif);
      font-weight: 600;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .tier-info {
      flex: 1;
    }

    .tier-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .tier-name {
      font-family: var(--font-heading, 'Cormorant Garamond', serif);
      font-size: 16px;
      color: var(--color-warm-ivory, #F5EFE6);
    }

    .tier-time {
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--color-champagne-gold, #C9A96E);
      background: rgba(201, 169, 110, 0.12);
      padding: 3px 8px;
      border-radius: 999px;
    }

    .tier-summary {
      font-size: 11px;
      color: var(--color-ivory-dim, rgba(245, 239, 230, 0.7));
      margin: 3px 0 0;
    }

    .tier-expanded-panel {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(201, 169, 110, 0.18);
      animation: fadeIn 0.3s ease;
    }

    .notes-chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 8px;
    }

    .pyramid-note-chip {
      background: rgba(201, 169, 110, 0.16);
      border: 1px solid rgba(201, 169, 110, 0.35);
      color: var(--color-warm-ivory, #F5EFE6);
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 999px;
      font-weight: 500;
    }

    .tier-desc {
      font-size: 11.5px;
      line-height: 1.5;
      color: var(--color-ivory-dim, rgba(245, 239, 230, 0.8));
      margin: 0;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ScentNotesPyramidComponent {
  @Input() topNotes: string[] = ['Calabrian Bergamot', 'French Pear', 'Pink Pepper', 'Bitter Almond'];
  @Input() heartNotes: string[] = ['Damask Rose Otto', 'Grasse Jasmine', 'Kashmiri Saffron', 'Wild Lavender'];
  @Input() baseNotes: string[] = ['20-Year Assam Agarwood', 'Mysore Sandalwood', 'Golden Ambergris', 'Dark Vanilla Resins'];

  activeTier: 'top' | 'heart' | 'base' = 'heart';

  selectTier(tier: 'top' | 'heart' | 'base'): void {
    this.activeTier = tier;
  }
}
