import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ThemeService, AtelierTheme, AccentOption } from '../../theme.service';

@Component({
  selector: 'app-theme-customizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- FLOATING ATELIER LAUNCHER PILL -->
    <button
      type="button"
      class="theme-floating-trigger"
      (click)="themeService.openCustomizer()"
      aria-label="Customize Atelier Theme and Colors"
      title="Atelier Theme & Chromatics">
      <span class="theme-glow-orb" [style.background]="themeService.currentAccent"></span>
      <span class="theme-trigger-label">
        <span class="theme-spark">✦</span>
        <span class="theme-text">Atelier Mood</span>
      </span>
      <span class="theme-name-tag">{{ activeTheme.name }}</span>
    </button>

    <!-- THEME CUSTOMIZER MODAL / DRAWER -->
    <div
      class="theme-modal-backdrop"
      *ngIf="themeService.isCustomizerOpen$ | async"
      (click)="themeService.closeCustomizer()">
    </div>

    <aside
      class="theme-modal-sheet"
      [class.is-open]="themeService.isCustomizerOpen$ | async"
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-modal-title">
      <!-- HEADER -->
      <div class="theme-sheet-header">
        <div class="theme-header-brand">
          <span class="theme-crest-mini">Z<span>&amp;</span>S</span>
          <div>
            <div class="theme-eyebrow">HAUTE PARFUMERIE · AMRAVATI ATELIER</div>
            <h3 id="theme-modal-title">Atmosphere &amp; <em>Chromatics.</em></h3>
          </div>
        </div>
        <button
          type="button"
          class="theme-close-btn"
          (click)="themeService.closeCustomizer()"
          aria-label="Close theme selector">✕</button>
      </div>

      <div class="theme-sheet-body">
        <p class="theme-sheet-intro">
          Select an olfactory atmosphere and royal chromatic tint. Every section, perfume card, button, and glowing flacon adapts live across the house.
        </p>

        <!-- SECTION 1: CURATED ATELIER MOODS -->
        <div class="theme-section">
          <div class="theme-section-title">
            <span>01 · CURATED OLFACTORY REALMS</span>
            <span class="theme-section-badge">{{ themeService.themes.length }} Moods</span>
          </div>

          <div class="theme-realms-grid">
            <button
              *ngFor="let theme of themeService.themes"
              type="button"
              class="theme-realm-card"
              [class.active]="themeService.currentTheme === theme.id"
              (click)="onSelectTheme(theme.id)">
              <div class="realm-swatch-wrapper">
                <span class="realm-swatch-bg" [style.background]="theme.primaryBg"></span>
                <span class="realm-swatch-accent" [style.background]="theme.accentColor"></span>
                <span class="realm-active-check" *ngIf="themeService.currentTheme === theme.id">✓</span>
              </div>
              <div class="realm-details">
                <div class="realm-title-row">
                  <strong class="realm-name">{{ theme.name }}</strong>
                  <span class="realm-tag" *ngIf="theme.isLight">Light Luxe</span>
                </div>
                <span class="realm-tagline">{{ theme.tagline }}</span>
                <small class="realm-notes">{{ theme.olfactiveNote }}</small>
              </div>
            </button>
          </div>
        </div>

        <!-- SECTION 2: METALLIC CHROMATIC ACCENTS -->
        <div class="theme-section">
          <div class="theme-section-title">
            <span>02 · ROYAL METALLIC ACCENTS</span>
            <span class="theme-section-badge">Fine Tints</span>
          </div>

          <div class="accents-preset-row">
            <button
              *ngFor="let accent of themeService.accents"
              type="button"
              class="accent-chip"
              [class.active]="themeService.currentAccent.toLowerCase() === accent.hex.toLowerCase()"
              (click)="onSelectAccent(accent.hex)"
              [title]="accent.name + ' (' + accent.description + ')'">
              <span class="accent-circle" [style.background]="accent.hex">
                <span class="accent-inner-check" *ngIf="themeService.currentAccent.toLowerCase() === accent.hex.toLowerCase()">✓</span>
              </span>
              <span class="accent-name">{{ accent.name }}</span>
            </button>
          </div>

          <!-- SECTION 3: BESPOKE CUSTOM HEX COLOR PICKER -->
          <div class="custom-color-row">
            <label class="custom-color-label" for="custom-accent-picker">
              <span>Bespoke Hue Picker:</span>
            </label>
            <div class="custom-input-group">
              <input
                id="custom-accent-picker"
                type="color"
                [value]="themeService.currentAccent"
                (input)="onCustomColorChange($event)"
                class="color-native-picker"
                title="Choose custom shade">
              <input
                type="text"
                [(ngModel)]="customHexValue"
                (change)="applyCustomHex()"
                placeholder="#C9A96E"
                maxlength="7"
                class="color-hex-input"
                aria-label="Hex color value">
              <button type="button" class="color-apply-btn" (click)="applyCustomHex()">Apply</button>
            </div>
          </div>
        </div>

        <!-- ACTIVE PALETTE SUMMARY -->
        <div class="theme-summary-card">
          <div class="summary-meta">
            <span class="summary-kicker">ACTIVE REALM</span>
            <strong class="summary-value">{{ activeTheme.name }} · {{ activeTheme.tagline }}</strong>
          </div>
          <button type="button" class="theme-reset-link" (click)="resetDefault()">
            Reset House Default ↺
          </button>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="theme-sheet-footer">
        <button type="button" class="theme-done-btn" (click)="themeService.closeCustomizer()">
          <span>Apply &amp; Continue Exploring</span>
          <span>→</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    /* FLOATING TRIGGER PILL */
    .theme-floating-trigger {
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 80;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 9px 16px 9px 12px;
      border-radius: 999px;
      background: var(--theme-bg-card, rgba(14, 18, 13, 0.92));
      -webkit-backdrop-filter: blur(18px);
      backdrop-filter: blur(18px);
      border: 1px solid var(--color-champagne-border, rgba(201, 169, 110, 0.35));
      color: var(--theme-text-primary, #F5EFE6);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45), 0 0 18px var(--color-champagne-dim, rgba(201, 169, 110, 0.15));
      cursor: pointer;
      transition: all 0.28s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .theme-floating-trigger:hover {
      transform: translateY(-2px) scale(1.02);
      border-color: var(--color-champagne-gold, #C9A96E);
      box-shadow: 0 14px 36px rgba(0, 0, 0, 0.55), 0 0 24px var(--color-champagne-dim, rgba(201, 169, 110, 0.3));
    }
    .theme-glow-orb {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      box-shadow: 0 0 10px currentColor;
      flex-shrink: 0;
      animation: themeGlowPulse 2.8s ease-in-out infinite;
    }
    @keyframes themeGlowPulse {
      0%, 100% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.25); opacity: 1; }
    }
    .theme-trigger-label {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      font-weight: 600;
      color: var(--color-champagne-gold, #C9A96E);
    }
    .theme-spark {
      font-size: 10px;
    }
    .theme-name-tag {
      font-size: 10px;
      color: var(--theme-text-primary, #F5EFE6);
      opacity: 0.85;
      padding-left: 6px;
      border-left: 1px solid var(--theme-border, rgba(201, 169, 110, 0.3));
    }

    /* BACKDROP */
    .theme-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 150;
      background: rgba(5, 7, 5, 0.75);
      -webkit-backdrop-filter: blur(8px);
      backdrop-filter: blur(8px);
      animation: fadeIn 0.25s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* SHEET / DRAWER */
    .theme-modal-sheet {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: min(480px, 100vw);
      z-index: 160;
      background: var(--theme-header-bg, #0d0f0b);
      -webkit-backdrop-filter: blur(24px);
      backdrop-filter: blur(24px);
      border-left: 1px solid var(--theme-border, rgba(201, 169, 110, 0.28));
      color: var(--theme-text-primary, #F5EFE6);
      box-shadow: -20px 0 60px rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), visibility 0.35s ease;
      visibility: hidden;
      pointer-events: none;
    }
    .theme-modal-sheet.is-open {
      transform: translateX(0);
      visibility: visible;
      pointer-events: auto;
    }

    /* HEADER */
    .theme-sheet-header {
      padding: 24px 28px 20px;
      border-bottom: 1px solid var(--theme-border, rgba(201, 169, 110, 0.2));
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .theme-header-brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .theme-crest-mini {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(201, 169, 110, 0.12);
      border: 1px solid var(--color-champagne-gold, #C9A96E);
      font-family: 'Playfair Display', serif;
      font-size: 13px;
      font-weight: 700;
      color: var(--color-champagne-gold, #C9A96E);
    }
    .theme-crest-mini span {
      font-size: 10px;
      font-style: italic;
    }
    .theme-eyebrow {
      font-size: 8.5px;
      letter-spacing: 2.2px;
      text-transform: uppercase;
      color: var(--color-champagne-gold, #C9A96E);
      font-weight: 600;
      margin-bottom: 2px;
    }
    .theme-sheet-header h3 {
      margin: 0;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 20px;
      font-weight: 400;
      color: var(--theme-text-primary, #ffffff);
      letter-spacing: -0.3px;
    }
    .theme-sheet-header h3 em {
      color: var(--color-champagne-gold, #C9A96E);
      font-style: italic;
    }
    .theme-close-btn {
      border: 1px solid var(--theme-border, rgba(201, 169, 110, 0.25));
      background: rgba(255, 255, 255, 0.05);
      color: var(--theme-text-primary, #F5EFE6);
      width: 34px;
      height: 34px;
      border-radius: 50%;
      font-size: 14px;
      cursor: pointer;
      display: grid;
      place-items: center;
      transition: all 0.2s ease;
    }
    .theme-close-btn:hover {
      background: var(--color-champagne-gold, #C9A96E);
      color: #0d0f0b;
      transform: rotate(90deg);
    }

    /* BODY */
    .theme-sheet-body {
      flex: 1;
      overflow-y: auto;
      padding: 24px 28px;
      display: flex;
      flex-direction: column;
      gap: 26px;
    }
    .theme-sheet-intro {
      font-size: 11.5px;
      line-height: 1.7;
      color: var(--theme-text-secondary, #c0c6b8);
      margin: 0;
    }

    /* SECTION */
    .theme-section {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .theme-section-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 9px;
      letter-spacing: 2px;
      font-weight: 700;
      color: var(--color-champagne-gold, #C9A96E);
      border-bottom: 1px solid var(--theme-border, rgba(201, 169, 110, 0.18));
      padding-bottom: 8px;
    }
    .theme-section-badge {
      font-size: 8px;
      padding: 2px 7px;
      border-radius: 999px;
      background: var(--color-champagne-dim, rgba(201, 169, 110, 0.12));
      border: 1px solid var(--color-champagne-border, rgba(201, 169, 110, 0.25));
    }

    /* REALMS GRID */
    .theme-realms-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .theme-realm-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 14px;
      border-radius: 12px;
      background: var(--theme-bg-card, rgba(255, 255, 255, 0.04));
      border: 1px solid var(--theme-border, rgba(201, 169, 110, 0.2));
      text-align: left;
      cursor: pointer;
      transition: all 0.22s ease;
      color: inherit;
    }
    .theme-realm-card:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--color-champagne-gold, #C9A96E);
      transform: translateX(3px);
    }
    .theme-realm-card.active {
      background: var(--color-champagne-dim, rgba(201, 169, 110, 0.14));
      border-color: var(--color-champagne-gold, #C9A96E);
      box-shadow: 0 0 20px var(--color-champagne-dim, rgba(201, 169, 110, 0.22));
    }
    .realm-swatch-wrapper {
      position: relative;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      flex-shrink: 0;
      overflow: hidden;
      border: 1px solid var(--theme-border, rgba(201, 169, 110, 0.4));
      display: grid;
      place-items: center;
    }
    .realm-swatch-bg {
      position: absolute;
      inset: 0;
      border-radius: 50%;
    }
    .realm-swatch-accent {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid #0d0f0b;
    }
    .realm-active-check {
      position: relative;
      z-index: 2;
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      text-shadow: 0 1px 4px #000;
    }
    .realm-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    .realm-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .realm-name {
      font-size: 13.5px;
      font-family: 'Playfair Display', Georgia, serif;
      color: var(--theme-text-primary, #ffffff);
    }
    .realm-tag {
      font-size: 7.5px;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 1px 6px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.15);
      color: var(--color-champagne-gold, #C9A96E);
      font-weight: 600;
    }
    .realm-tagline {
      font-size: 10px;
      color: var(--color-champagne-gold, #C9A96E);
    }
    .realm-notes {
      font-size: 9.5px;
      color: var(--theme-text-muted, #9ba59b);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ACCENTS ROW */
    .accents-preset-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 9px;
    }
    .accent-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 8px;
      background: var(--theme-bg-card, rgba(255, 255, 255, 0.04));
      border: 1px solid var(--theme-border, rgba(201, 169, 110, 0.18));
      cursor: pointer;
      color: var(--theme-text-primary, #F5EFE6);
      transition: all 0.2s ease;
    }
    .accent-chip:hover {
      border-color: var(--color-champagne-gold, #C9A96E);
      background: rgba(255, 255, 255, 0.08);
    }
    .accent-chip.active {
      border-color: var(--color-champagne-gold, #C9A96E);
      background: var(--color-champagne-dim, rgba(201, 169, 110, 0.15));
      font-weight: 600;
    }
    .accent-circle {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      flex-shrink: 0;
      border: 1px solid rgba(255, 255, 255, 0.3);
      display: grid;
      place-items: center;
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
    }
    .accent-inner-check {
      font-size: 9px;
      font-weight: bold;
      color: #0d0f0b;
    }
    .accent-name {
      font-size: 10px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* BESPOKE COLOR ROW */
    .custom-color-row {
      margin-top: 6px;
      padding: 12px 14px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px dashed var(--theme-border, rgba(201, 169, 110, 0.3));
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .custom-color-label {
      font-size: 10.5px;
      color: var(--theme-text-secondary, #c5ccbf);
    }
    .custom-input-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .color-native-picker {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid var(--color-champagne-gold, #C9A96E);
      padding: 0;
      background: transparent;
      cursor: pointer;
    }
    .color-hex-input {
      width: 78px;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--theme-border, rgba(201, 169, 110, 0.3));
      border-radius: 6px;
      color: var(--color-champagne-gold, #C9A96E);
      font-family: monospace;
      font-size: 11px;
      padding: 5px 8px;
      text-transform: uppercase;
      outline: none;
    }
    .color-hex-input:focus {
      border-color: var(--color-champagne-gold, #C9A96E);
    }
    .color-apply-btn {
      padding: 5px 10px;
      border-radius: 6px;
      background: var(--color-champagne-gold, #C9A96E);
      color: #0d0f0b;
      font-size: 9.5px;
      font-weight: 700;
      border: 0;
      cursor: pointer;
      text-transform: uppercase;
    }
    .color-apply-btn:hover {
      background: var(--color-champagne-light, #dfc796);
    }

    /* SUMMARY */
    .theme-summary-card {
      padding: 14px 16px;
      border-radius: 10px;
      background: var(--color-champagne-dim, rgba(201, 169, 110, 0.07));
      border: 1px solid var(--theme-border, rgba(201, 169, 110, 0.22));
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .summary-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .summary-kicker {
      font-size: 8px;
      letter-spacing: 1.5px;
      color: var(--color-champagne-gold, #C9A96E);
      font-weight: 600;
    }
    .summary-value {
      font-size: 11px;
      color: var(--theme-text-primary, #ffffff);
    }
    .theme-reset-link {
      background: transparent;
      border: 0;
      color: var(--color-champagne-gold, #C9A96E);
      font-size: 10px;
      text-decoration: underline;
      cursor: pointer;
      white-space: nowrap;
      padding: 0;
    }
    .theme-reset-link:hover {
      color: var(--theme-text-primary, #ffffff);
    }

    /* FOOTER */
    .theme-sheet-footer {
      padding: 18px 28px;
      border-top: 1px solid var(--theme-border, rgba(201, 169, 110, 0.2));
      background: var(--theme-header-bg, rgba(10, 14, 10, 0.9));
    }
    .theme-done-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 13px 20px;
      border-radius: 999px;
      background: var(--color-champagne-gold, #C9A96E);
      color: #0d0f0b;
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      font-weight: 700;
      border: 1px solid var(--color-champagne-light, #ffd875);
      cursor: pointer;
      box-shadow: 0 6px 20px var(--color-champagne-dim, rgba(201, 169, 110, 0.35));
      transition: all 0.25s ease;
    }
    .theme-done-btn:hover {
      background: var(--color-champagne-light, #dfc796);
      transform: translateY(-2px);
    }

    @media (max-width: 600px) {
      .theme-floating-trigger {
        bottom: 18px;
        left: 14px;
        padding: 7px 12px 7px 10px;
      }
      .theme-name-tag {
        display: none;
      }
      .theme-modal-sheet {
        width: 100vw;
      }
      .theme-sheet-header, .theme-sheet-body, .theme-sheet-footer {
        padding-inline: 18px;
      }
      .accents-preset-row {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class ThemeCustomizerComponent implements OnInit {
  customHexValue = '#C9A96E';

  constructor(public themeService: ThemeService) {}

  ngOnInit(): void {
    this.customHexValue = this.themeService.currentAccent;
    this.themeService.currentAccent$.subscribe(accent => {
      this.customHexValue = accent;
    });
  }

  get activeTheme(): AtelierTheme {
    return this.themeService.activeThemeObject;
  }

  onSelectTheme(themeId: string): void {
    this.themeService.setTheme(themeId, false);
    this.customHexValue = this.themeService.currentAccent;
  }

  onSelectAccent(hex: string): void {
    this.themeService.setAccent(hex);
    this.customHexValue = hex;
  }

  onCustomColorChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.value) {
      this.customHexValue = input.value;
      this.themeService.setAccent(input.value);
    }
  }

  applyCustomHex(): void {
    let hex = this.customHexValue.trim();
    if (!hex.startsWith('#')) {
      hex = '#' + hex;
    }
    if (/^#[0-9A-Fa-f]{6}$/.test(hex) || /^#[0-9A-Fa-f]{3}$/.test(hex)) {
      this.themeService.setAccent(hex);
      this.customHexValue = hex;
    }
  }

  resetDefault(): void {
    this.themeService.resetToDefault();
    this.customHexValue = '#C9A96E';
  }
}
