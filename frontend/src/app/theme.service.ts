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
      primaryBg: '#0d0f0b',
      accentColor: '#C9A96E',
      cardBg: 'rgba(20, 27, 18, 0.78)',
      isLight: false
    },
    {
      id: 'rose',
      name: 'Rose Éclat',
      tagline: 'Damask Petals & Velvet Noir',
      olfactiveNote: 'Kannauj Damask Rose · Bourbon Vanilla · Peony',
      primaryBg: '#12070e',
      accentColor: '#E6A5B9',
      cardBg: 'rgba(28, 14, 24, 0.8)',
      isLight: false
    },
    {
      id: 'emerald',
      name: 'Emerald Sylvan',
      tagline: 'Imperial Vetiver & Verdant Jade',
      olfactiveNote: 'Haitian Vetiver · Crushed Cypress · Bergamot',
      primaryBg: '#050f0a',
      accentColor: '#86C59E',
      cardBg: 'rgba(10, 24, 18, 0.8)',
      isLight: false
    },
    {
      id: 'saffron',
      name: 'Saffron Dusk',
      tagline: 'Smoked Amber & Twilight Embers',
      olfactiveNote: 'Kashmiri Saffron · Frankincense · Benzoin',
      primaryBg: '#110703',
      accentColor: '#E5A158',
      cardBg: 'rgba(28, 16, 11, 0.82)',
      isLight: false
    },
    {
      id: 'ivory',
      name: 'Ivory Atelier',
      tagline: 'Daylight Alabaster & French Silk',
      olfactiveNote: 'White Tea · Mysore Sandalwood · Neroli',
      primaryBg: '#F8F6F0',
      accentColor: '#B08846',
      cardBg: 'rgba(255, 255, 255, 0.88)',
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

  setTheme(themeId: string): void {
    const theme = this.themes.find(t => t.id === themeId);
    if (!theme) return;

    // Use theme's default accent unless user explicitly set a custom one
    let targetAccent = theme.accentColor;
    try {
      const savedCustom = localStorage.getItem('zs-luxury-accent');
      if (savedCustom) {
        targetAccent = savedCustom;
      }
    } catch { /* use default */ }

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
    const lightHex = this.lightenHex(accentHex, 20);

    // Dynamically inject custom CSS variables into root style
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
