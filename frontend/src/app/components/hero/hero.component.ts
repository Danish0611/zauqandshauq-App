import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../product.model';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="hero-section" id="home">
      <div class="hero-grain"></div>
      <div class="hero-inner page-shell">
        <div class="hero-copy">
          <div class="eyebrow eyebrow-light">
            <span class="eyebrow-line"></span> THE ART OF A PERSONAL SCENT · HAUTE PARFUMERIE
          </div>

          <h1>
            More Than Fragrance.<br>
            <em>It's a&nbsp;</em><span class="hero-last-line">Feeling.</span>
          </h1>

          <p class="hero-description">
            Hand-poured luxury extraits crafted for every mood, every memory, every story. When inhaled, pure botanicals bypass rational thought to calm the nervous system and awaken timeless confidence.
          </p>

          <div class="hero-actions">
            <button type="button" class="button button-gold" (click)="explore.emit('All Fragrances')">
              Shop Now <span>↗</span>
            </button>
            <button type="button" class="button button-glass-hero" (click)="explore.emit('All Fragrances')">
              Explore Collection <span>→</span>
            </button>
          </div>

          <!-- Authentic Persian & Urdu Quotes with Translation -->
          <div class="hero-quotes-strip">
            <div class="hero-quote-item">
              <span class="quote-script" dir="rtl">خوشبو وہ خاموش زبان ہے جو دل سے دل تک بات کرتی ہے</span>
              <span class="quote-eng">“Fragrance is the silent tongue that speaks from heart to heart.” — Urdu Tradition</span>
            </div>
            <div class="hero-quote-item">
              <span class="quote-script" dir="rtl">بوی گل و ریحان همه از لطف حبیب است</span>
              <span class="quote-eng">“The perfume of rose and basil flows from the grace of the Beloved.” — Hafez Shirazi</span>
            </div>
          </div>

          <!-- Neuro-Calm & Uniqueness Value Proof -->
          <div class="hero-proof">
            <div class="proof-avatars">
              <span>ZS</span>
              <span>♥</span>
              <span>✦</span>
            </div>
            <div>
              <strong>Pure Botanical Resonance · Uniqueness Over Noise</strong>
              <small>Natural extracts formulated to ground heart rate &amp; soothe the limbic senses</small>
            </div>
          </div>
        </div>

        <div class="hero-art-wrap">
          <div class="hero-art-frame">
            <img class="hero-art" src="/assets/hero-fragrance.svg" alt="Royal Oud Royale emerald perfume bottle with gold crown and crest">
          </div>
          <div class="hero-side-note">
            <span class="side-note-rule"></span>
            <span>THE SIGNATURE EDIT</span>
            <span class="side-note-sub">01 / 04</span>
          </div>
          <div class="hero-product-note">
            <span class="note-kicker">ROYAL HOUSE FAVOURITE</span>
            <strong>{{ heroProduct?.name || 'Oud Royale' }}</strong>
            <span>{{ heroProduct?.notes?.join(' · ') || 'Assam Oud · Ambergris · Taif Rose · Mysore Sandal' }}</span>
            <button type="button" (click)="heroProduct && viewProduct.emit(heroProduct)" *ngIf="heroProduct">
              Discover Scent Profile <span>↗</span>
            </button>
          </div>
          <div class="hero-stamp">
            <span>EST.</span>
            <strong>ZS</strong>
            <span>PARIS · JAIPUR</span>
          </div>
        </div>
      </div>

      <div class="hero-bottom-rule">
        <span>01</span>
        <div></div>
        <span>MORE THAN FRAGRANCE · IT'S A FEELING</span>
        <div></div>
        <span>SCROLL TO DISCOVER ↓</span>
      </div>
    </section>
  `
})
export class HeroComponent {
  @Input() heroProduct?: Product;
  @Output() explore = new EventEmitter<string>();
  @Output() viewProduct = new EventEmitter<Product>();
}
