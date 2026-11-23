import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export interface AtelierTheme {
  id: string;
  name: string;
  tagline: string;
  olfactiveNote: string;
  primaryBg: string;
  accentColor: string;
  cardBg: string;
  isLight?: boolean;
}

export interface AccentOption {
  id: string;
  name: string;
  hex: string;
  lightHex: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isBrowser: boolean;

  readonly themes: AtelierTheme[] = [
    {
      id: 'noir',
      name: 'Midnight Oud',
      tagline: 'Imperial Noir & Liquid Gold',
      olfactiveNote: 'Wild Assam Agarwood · Smoked Leather · Saffron',
      primaryBg: '#0a0d09',
      accentColor: '#C9A96E',
      cardBg: 'rgba(20, 27, 18, 0.85)',
      isLight: false
    },
    {
      id: 'rose',
      name: 'Rose Éclat',
      tagline: 'Damask Petals & Velvet Noir',
      olfactiveNote: 'Kannauj Damask Rose · Bourbon Vanilla · Peony',
      primaryBg: '#10070d',
      accentColor: '#E6A5B9',
      cardBg: 'rgba(30, 14, 25, 0.85)',
      isLight: false
    },
    {
      id: 'emerald',
      name: 'Emerald Sylvan',
      tagline: 'Imperial Vetiver & Verdant Jade',
      olfactiveNote: 'Haitian Vetiver · Crushed Cypress · Bergamot',
      primaryBg: '#050e09',
      accentColor: '#86C59E',
      cardBg: 'rgba(12, 29, 20, 0.85)',
      isLight: false
    },
    {
      id: 'saffron',
      name: 'Saffron Dusk',
      tagline: 'Smoked Amber & Twilight Embers',
      olfactiveNote: 'Kashmiri Saffron · Frankincense · Benzoin',
      primaryBg: '#0e0603',
      accentColor: '#E5A158',
      cardBg: 'rgba(29, 14, 7, 0.85)',
      isLight: false
    },
    {
      id: 'ivory',
      name: 'Ivory Atelier',
      tagline: 'Daylight Alabaster & French Silk',
      olfactiveNote: 'White Tea · Mysore Sandalwood · Neroli',
      primaryBg: '#F7F4EE',
      accentColor: '#A88038',
      cardBg: 'rgba(255, 255, 255, 0.94)',
      isLight: true
    }
  ];

  readonly accents: AccentOption[] = [
    {
      id: 'gold',
      name: 'Imperial Gold',
      hex: '#C9A96E',
      lightHex: '#dfc796',
      description: 'Signature Royal Champagne Gold'
    },
    {
      id: 'rose',
      name: 'Damask Rose',
      hex: '#E6A5B9',
      lightHex: '#f6c5d3',
      description: 'Velvety Blush & Rose Quartz'
    },
    {
      id: 'emerald',
      name: 'Emerald Jade',
      hex: '#86C59E',
      lightHex: '#b2e2c5',
      description: 'Luminous Botanical Jade'
    },
    {
      id: 'amber',
      name: 'Saffron Amber',
      hex: '#E5A158',
      lightHex: '#fcd39b',
      description: 'Warm Twilight Resins'
    },
    {
      id: 'azure',
      name: 'Celestial Azure',
      hex: '#8BB8E8',
      lightHex: '#c0dbfc',
      description: 'Riviera Marine & Cool Silver'
    },
    {
      id: 'bronze',
      name: 'Smoked Bronze',
      hex: '#C5A070',
      lightHex: '#e0c49e',
      description: 'Aged Antique Patina'
    }
  ];

  private currentThemeSubject = new BehaviorSubject<string>('noir');
  public currentTheme$ = this.currentThemeSubject.asObservable();

  private currentAccentSubject = new BehaviorSubject<string>('#C9A96E');
  public currentAccent$ = this.currentAccentSubject.asObservable();

  private isCustomizerOpenSubject = new BehaviorSubject<boolean>(false);
  public isCustomizerOpen$ = this.isCustomizerOpenSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.initFromStorage();
    }
  }

  get currentTheme(): string {
    return this.currentThemeSubject.value;
  }

  get currentAccent(): string {
    return this.currentAccentSubject.value;
  }

  get activeThemeObject(): AtelierTheme {
    return this.themes.find(t => t.id === this.currentTheme) || this.themes[0];
  }

  get isCustomizerOpen(): boolean {
    return this.isCustomizerOpenSubject.value;
  }

  openCustomizer(): void {
    this.isCustomizerOpenSubject.next(true);
  }

  closeCustomizer(): void {
    this.isCustomizerOpenSubject.next(false);
  }

  toggleCustomizer(): void {
    this.isCustomizerOpenSubject.next(!this.isCustomizerOpenSubject.value);
  }

  init(): void {
    if (!this.isBrowser) return;
    this.initFromStorage();
  }

  private initFromStorage(): void {
    try {
      const savedTheme = localStorage.getItem('zs-luxury-theme');
      const validTheme = this.themes.find(t => t.id === savedTheme);
      const themeId = validTheme ? validTheme.id : 'noir';

      const savedAccent = localStorage.getItem('zs-luxury-accent') || validTheme?.accentColor || '#C9A96E';
      this.applyTheme(themeId, savedAccent);
    } catch {
      this.applyTheme('noir', '#C9A96E');
    }
  }

  setTheme(themeId: string, keepCustomAccent: boolean = false): void {
    const theme = this.themes.find(t => t.id === themeId);
    if (!theme) return;

    let targetAccent = theme.accentColor;
    if (keepCustomAccent) {
      try {
        const savedCustom = localStorage.getItem('zs-luxury-accent');
        if (savedCustom) targetAccent = savedCustom;
      } catch { /* use theme accent */ }
    }

    this.applyTheme(themeId, targetAccent);
  }

  setAccent(accentHex: string): void {
    if (!accentHex || !accentHex.startsWith('#')) return;
    this.applyTheme(this.currentTheme, accentHex);
  }

  resetToDefault(): void {
    this.applyTheme('noir', '#C9A96E');
    if (this.isBrowser) {
      try {
        localStorage.removeItem('zs-luxury-theme');
        localStorage.removeItem('zs-luxury-accent');
      } catch { /* ignore */ }
    }
  }

  private applyTheme(themeId: string, accentHex: string): void {
    this.currentThemeSubject.next(themeId);
    this.currentAccentSubject.next(accentHex);

    if (!this.isBrowser) return;

    try {
      localStorage.setItem('zs-luxury-theme', themeId);
      localStorage.setItem('zs-luxury-accent', accentHex);
    } catch { /* ignore quota */ }

    const root = document.documentElement;
    const body = document.body;

    // Set attributes for CSS selectors
    root.setAttribute('data-theme', themeId);
    body.setAttribute('data-theme', themeId);

    // Compute RGB for accent variants
    const rgb = this.hexToRgb(accentHex) || { r: 201, g: 169, b: 110 };
    const lightHex = this.lightenHex(accentHex, 18);

    // Dynamically inject accent custom CSS variables
    root.style.setProperty('--color-champagne-gold', accentHex);
    root.style.setProperty('--accent-gold', accentHex);
    root.style.setProperty('--gold', accentHex);
    root.style.setProperty('--color-champagne-light', lightHex);
    root.style.setProperty('--gold-light', lightHex);
    root.style.setProperty('--color-champagne-dim', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)`);
    root.style.setProperty('--color-champagne-border', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.28)`);
    root.style.setProperty('--color-champagne-glow', `0 0 24px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.45)`);
    root.style.setProperty('--cursor-accent', accentHex);
    root.style.setProperty('--cursor-accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);

    // Dynamically inject Theme background & typography variables for complete live sync
    if (themeId === 'ivory') {
      root.style.setProperty('--theme-bg-body', '#F7F4EE');
      root.style.setProperty('--theme-bg-surface', '#EFE9DF');
      root.style.setProperty('--theme-bg-card', 'rgba(255, 255, 255, 0.94)');
      root.style.setProperty('--theme-card-visual', 'radial-gradient(circle at 50% 60%, rgba(201, 169, 110, 0.2) 0%, rgba(245, 240, 232, 0.96) 100%)');
      root.style.setProperty('--theme-details-bg', 'rgba(255, 255, 255, 0.96)');
      root.style.setProperty('--theme-text-primary', '#151912');
      root.style.setProperty('--theme-text-secondary', '#3b4236');
      root.style.setProperty('--theme-text-muted', '#667060');
      root.style.setProperty('--theme-border', 'rgba(168, 128, 56, 0.32)');
      root.style.setProperty('--color-near-black', '#F7F4EE');
      root.style.setProperty('--color-warm-ivory', '#151912');
      root.style.setProperty('--color-olive-base', '#EFE9DF');
      root.style.setProperty('--color-olive-dark', '#E2D9CC');
      root.style.setProperty('--color-olive-light', '#FFFFFF');
    } else if (themeId === 'rose') {
      root.style.setProperty('--theme-bg-body', '#10070d');
      root.style.setProperty('--theme-bg-surface', '#1d0c18');
      root.style.setProperty('--theme-bg-card', 'rgba(30, 14, 25, 0.85)');
      root.style.setProperty('--theme-card-visual', 'radial-gradient(circle at 50% 60%, rgba(230, 165, 185, 0.22) 0%, rgba(16, 7, 13, 0.98) 100%)');
      root.style.setProperty('--theme-details-bg', 'rgba(24, 11, 20, 0.85)');
      root.style.setProperty('--theme-text-primary', '#FDF5F8');
      root.style.setProperty('--theme-text-secondary', '#d8c2cc');
      root.style.setProperty('--theme-text-muted', '#9b848f');
      root.style.setProperty('--theme-border', 'rgba(230, 165, 185, 0.3)');
      root.style.setProperty('--color-near-black', '#10070d');
      root.style.setProperty('--color-warm-ivory', '#FDF5F8');
      root.style.setProperty('--color-olive-base', '#1d0c18');
      root.style.setProperty('--color-olive-dark', '#12070e');
      root.style.setProperty('--color-olive-light', '#2c1224');
    } else if (themeId === 'emerald') {
      root.style.setProperty('--theme-bg-body', '#050e09');
      root.style.setProperty('--theme-bg-surface', '#0a1b12');
      root.style.setProperty('--theme-bg-card', 'rgba(12, 29, 20, 0.85)');
      root.style.setProperty('--theme-card-visual', 'radial-gradient(circle at 50% 60%, rgba(134, 197, 158, 0.22) 0%, rgba(5, 14, 9, 0.98) 100%)');
      root.style.setProperty('--theme-details-bg', 'rgba(9, 22, 15, 0.85)');
      root.style.setProperty('--theme-text-primary', '#F2F8F4');
      root.style.setProperty('--theme-text-secondary', '#bed4c7');
      root.style.setProperty('--theme-text-muted', '#7f998b');
      root.style.setProperty('--theme-border', 'rgba(134, 197, 158, 0.3)');
      root.style.setProperty('--color-near-black', '#050e09');
      root.style.setProperty('--color-warm-ivory', '#F2F8F4');
      root.style.setProperty('--color-olive-base', '#0a1b12');
      root.style.setProperty('--color-olive-dark', '#050e09');
      root.style.setProperty('--color-olive-light', '#132f22');
    } else if (themeId === 'saffron') {
      root.style.setProperty('--theme-bg-body', '#0e0603');
      root.style.setProperty('--theme-bg-surface', '#1c0e07');
      root.style.setProperty('--theme-bg-card', 'rgba(29, 14, 7, 0.85)');
      root.style.setProperty('--theme-card-visual', 'radial-gradient(circle at 50% 60%, rgba(229, 161, 88, 0.22) 0%, rgba(14, 6, 3, 0.98) 100%)');
      root.style.setProperty('--theme-details-bg', 'rgba(22, 11, 5, 0.85)');
      root.style.setProperty('--theme-text-primary', '#FAF4ED');
      root.style.setProperty('--theme-text-secondary', '#dbc9bc');
      root.style.setProperty('--theme-text-muted', '#9b8779');
      root.style.setProperty('--theme-border', 'rgba(229, 161, 88, 0.3)');
      root.style.setProperty('--color-near-black', '#0e0603');
      root.style.setProperty('--color-warm-ivory', '#FAF4ED');
      root.style.setProperty('--color-olive-base', '#1c0e07');
      root.style.setProperty('--color-olive-dark', '#0e0603');
      root.style.setProperty('--color-olive-light', '#2c160b');
    } else {
      // Default: noir
      root.style.setProperty('--theme-bg-body', '#0d0f0b');
      root.style.setProperty('--theme-bg-surface', '#141b12');
      root.style.setProperty('--theme-bg-card', 'rgba(20, 27, 18, 0.85)');
      root.style.setProperty('--theme-card-visual', 'radial-gradient(circle at 50% 60%, rgba(201, 169, 110, 0.18) 0%, rgba(13, 17, 12, 0.98) 100%)');
      root.style.setProperty('--theme-details-bg', 'rgba(16, 22, 14, 0.85)');
      root.style.setProperty('--theme-text-primary', '#F5EFE6');
      root.style.setProperty('--theme-text-secondary', '#c7cebf');
      root.style.setProperty('--theme-text-muted', '#8e9687');
      root.style.setProperty('--theme-border', 'rgba(201, 169, 110, 0.28)');
      root.style.setProperty('--color-near-black', '#0d0f0b');
      root.style.setProperty('--color-warm-ivory', '#F5EFE6');
      root.style.setProperty('--color-olive-base', '#202a1c');
      root.style.setProperty('--color-olive-dark', '#141b12');
      root.style.setProperty('--color-olive-light', '#2c3a27');
    }

    // Trigger custom window event for non-angular canvases or scripts
    window.dispatchEvent(new CustomEvent('zs-theme-change', {
      detail: { theme: themeId, accent: accentHex, rgb }
    }));
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
      const r = parseInt(clean[0] + clean[0], 16);
      const g = parseInt(clean[1] + clean[1], 16);
      const b = parseInt(clean[2] + clean[2], 16);
      return { r, g, b };
    } else if (clean.length === 6) {
      const r = parseInt(clean.substring(0, 2), 16);
      const g = parseInt(clean.substring(2, 4), 16);
      const b = parseInt(clean.substring(4, 6), 16);
      return { r, g, b };
    }
    return null;
  }

  private lightenHex(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;
    const r = Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * (percent / 100)));
    const g = Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * (percent / 100)));
    const b = Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * (percent / 100)));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}
