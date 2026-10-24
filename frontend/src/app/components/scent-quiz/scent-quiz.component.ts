import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../product.model';

export interface QuizOption {
  id: string;
  symbol: string;
  title: string;
  subtitle: string;
  nerveBenefit: string;
  archetypeKey: 'serene' | 'sovereign' | 'luminous' | 'velvet';
  affinityNotes: string[];
  categoryHint: string[];
}

export interface QuizStep {
  stepNumber: string;
  eyebrow: string;
  question: string;
  subtext: string;
  options: QuizOption[];
}

export interface ArchetypeResult {
  key: 'serene' | 'sovereign' | 'luminous' | 'velvet';
  badge: string;
  title: string;
  subtitle: string;
  limbicAnalysis: string;
  uniquenessVerdict: string;
  pyramid: {
    top: string[];
    heart: string[];
    base: string[];
  };
  quote: {
    language: string;
    script: string;
    transliteration: string;
    translation: string;
    author: string;
  };
}

export interface ScoredProduct {
  product: Product;
  matchPercent: number;
  matchedNotes: string[];
  whyItFits: string;
}

@Component({
  selector: 'app-scent-quiz',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <section class="quiz-section" id="scent-quiz">
      <div class="quiz-ambient-orb orb-a"></div>
      <div class="quiz-ambient-orb orb-b"></div>
      <div class="quiz-ambient-orb orb-c"></div>

      <div class="page-shell quiz-container">
        <!-- Header -->
        <div class="quiz-header">
          <div class="eyebrow eyebrow-gold">
            <span class="eyebrow-line"></span> INTERACTIVE OLFACTORY CONCIERGE
          </div>
          <h2>Find the scent that <em>calms your nerves</em> &amp; speaks your soul.</h2>
          <p class="quiz-lead">
            Forget blind buying. Answer four sensory questions on how you want your mind to feel,
            and our neuro-olfactory engine will prescribe your personal 3-tier note architecture
            and match you with our rarest compositions.
          </p>
        </div>

        <!-- Quiz Glass Card -->
        <div class="liquid-glass-quiz-card">
          <!-- Progress Bar & Step Indicators -->
          <div class="quiz-topbar" *ngIf="!quizCompleted">
            <div class="quiz-steps-pills">
              <button
                type="button"
                *ngFor="let s of steps; let idx = index"
                class="step-pill"
                [class.active]="idx === currentStep"
                [class.completed]="idx < currentStep"
                [disabled]="idx > currentStep"
                (click)="goToStep(idx)">
                <span class="step-pill-num">{{ s.stepNumber }}</span>
                <span class="step-pill-label">{{ s.eyebrow }}</span>
              </button>
            </div>
            <div class="quiz-progress-track">
              <div class="quiz-progress-fill" [style.width.%]="((currentStep + 1) / steps.length) * 100"></div>
            </div>
          </div>

          <!-- Active Question View -->
          <div class="quiz-question-stage" *ngIf="!quizCompleted && steps[currentStep] as step">
            <div class="question-meta">
              <span class="question-step-tag">STEP {{ step.stepNumber }} OF 04 · {{ step.eyebrow }}</span>
              <h3>{{ step.question }}</h3>
              <p>{{ step.subtext }}</p>
            </div>

            <div class="quiz-options-grid">
              <button
                type="button"
                class="quiz-option-glass"
                *ngFor="let opt of step.options"
                [class.selected]="selectedOptions[currentStep]?.id === opt.id"
                (click)="selectOption(opt)">
                <div class="option-top">
                  <span class="option-symbol">{{ opt.symbol }}</span>
                  <span class="option-nerve-tag">{{ opt.nerveBenefit }}</span>
                </div>
                <h4>{{ opt.title }}</h4>
                <p>{{ opt.subtitle }}</p>
                <div class="option-notes-preview">
                  <span *ngFor="let n of opt.affinityNotes.slice(0, 4)">{{ n }}</span>
                </div>
              </button>
            </div>

            <div class="quiz-nav-footer">
              <button
                type="button"
                class="quiz-back-btn"
                *ngIf="currentStep > 0"
                (click)="prevStep()">
                ← Previous Step
              </button>
              <span class="quiz-hint">Select an answer to continue automatically</span>
            </div>
          </div>

          <!-- Diagnosis & Results View -->
          <div class="quiz-results-stage" *ngIf="quizCompleted && activeArchetype as arch">
            <div class="result-top-banner">
              <div class="result-archetype-copy">
                <span class="result-badge">✦ {{ arch.badge }}</span>
                <h3>{{ arch.title }}</h3>
                <p class="result-subtitle">{{ arch.subtitle }}</p>

                <div class="diagnosis-boxes">
                  <div class="diagnosis-box">
                    <span class="diag-label">🧠 NERVE &amp; LIMBIC SYSTEM EFFECT</span>
                    <p>{{ arch.limbicAnalysis }}</p>
                  </div>
                  <div class="diagnosis-box">
                    <span class="diag-label">💎 UNIQUENESS VS. LONGEVITY VERDICT</span>
                    <p>{{ arch.uniquenessVerdict }}</p>
                  </div>
                </div>
              </div>

              <!-- Personal 3-Tier Note Prescription & Quote -->
              <div class="result-sidebar-glass">
                <span class="sidebar-eyebrow">YOUR BESPOKE NOTE ARCHITECTURE</span>
                <div class="mini-pyramid">
                  <div class="mini-tier">
                    <strong>TOP (20% · Awakening)</strong>
                    <div class="mini-chips">
                      <button type="button" *ngFor="let n of arch.pyramid.top" (click)="onPickNote(n)">{{ n }} ↗</button>
                    </div>
                  </div>
                  <div class="mini-tier">
                    <strong>HEART (35% · Emotion)</strong>
                    <div class="mini-chips">
                      <button type="button" *ngFor="let n of arch.pyramid.heart" (click)="onPickNote(n)">{{ n }} ↗</button>
                    </div>
                  </div>
                  <div class="mini-tier">
                    <strong>BASE (45% · Skin Soul)</strong>
                    <div class="mini-chips">
                      <button type="button" *ngFor="let n of arch.pyramid.base" (click)="onPickNote(n)">{{ n }} ↗</button>
                    </div>
                  </div>
                </div>

                <div class="result-poetry-box">
                  <span class="poetry-lang">{{ arch.quote.language }}</span>
                  <p class="poetry-rtl" dir="rtl">{{ arch.quote.script }}</p>
                  <p class="poetry-translit">{{ arch.quote.transliteration }}</p>
                  <p class="poetry-eng">“{{ arch.quote.translation }}”</p>
                  <small>— {{ arch.quote.author }}</small>
                </div>
              </div>
            </div>

            <!-- Matched Fragrances from PostgreSQL Catalog -->
            <div class="matched-bottles-section">
              <div class="matched-header">
                <div>
                  <span class="matched-eyebrow">CURATED FROM OUR LIVE COLLECTION</span>
                  <h4>Your Signature Bottle Prescriptions</h4>
                </div>
                <button type="button" class="retake-btn" (click)="resetQuiz()">
                  ↻ Retake Olfactory Quiz
                </button>
              </div>

              <div class="matched-grid">
                <article class="matched-bottle-glass" *ngFor="let item of recommendedProducts; let i = index">
                  <div class="match-score-ribbon">
                    <span class="rank-pill">#{{ i + 1 }} Prescription</span>
                    <strong class="match-pct">{{ item.matchPercent }}% Olfactory Match</strong>
                  </div>

                  <div class="matched-bottle-main">
                    <button type="button" class="matched-img-wrap" (click)="openProduct.emit(item.product)">
                      <img [src]="item.product.image" [alt]="item.product.name" loading="lazy" />
                      <span class="conc-tag">{{ item.product.concentration }} · {{ item.product.size }}</span>
                    </button>

                    <div class="matched-info">
                      <span class="matched-brand">{{ item.product.brand }} · {{ item.product.category }}</span>
                      <h5>{{ item.product.name }}</h5>
                      <p class="matched-why">{{ item.whyItFits }}</p>

                      <div class="matched-note-pills">
                        <span
                          *ngFor="let note of item.product.notes"
                          [class.highlighted]="item.matchedNotes.includes(note)">
                          {{ note }}
                        </span>
                      </div>

                      <div class="matched-price-row">
                        <div class="price-stack">
                          <strong>{{ item.product.price | currency:'INR':'symbol':'1.0-0' }}</strong>
                          <small *ngIf="item.product.originalPrice">{{ item.product.originalPrice | currency:'INR':'symbol':'1.0-0' }}</small>
                        </div>
                        <div class="matched-actions">
                          <button type="button" class="btn-glass-ghost" (click)="openProduct.emit(item.product)">
                            Inspect Notes
                          </button>
                          <button type="button" class="btn-glass-gold" (click)="addToCart.emit(item.product)">
                            Add to Bag +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .quiz-section {
      position: relative;
      padding: 6.5rem 0;
      background:
        radial-gradient(circle at 12% 20%, rgba(214, 173, 96, 0.16), transparent 42%),
        radial-gradient(circle at 88% 80%, rgba(164, 92, 92, 0.14), transparent 45%),
        linear-gradient(180deg, #0b0908 0%, #14100e 50%, #0d0a08 100%);
      color: #f8f3eb;
      overflow: hidden;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .quiz-ambient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(95px);
      pointer-events: none;
      z-index: 0;
    }
    .orb-a {
      width: 440px;
      height: 440px;
      background: rgba(214, 173, 96, 0.18);
      top: -100px;
      left: -80px;
    }
    .orb-b {
      width: 500px;
      height: 500px;
      background: rgba(180, 118, 92, 0.14);
      bottom: -140px;
      right: -100px;
    }
    .orb-c {
      width: 320px;
      height: 320px;
      background: rgba(255, 235, 195, 0.08);
      top: 40%;
      left: 45%;
    }

    .quiz-container {
      position: relative;
      z-index: 1;
    }

    .quiz-header {
      text-align: center;
      max-width: 780px;
      margin: 0 auto 3rem;
    }

    .eyebrow-gold {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      color: #e5c178;
      font-size: 0.76rem;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }

    .eyebrow-gold .eyebrow-line {
      width: 30px;
      height: 1px;
      background: #e5c178;
    }

    .quiz-header h2 {
      font-family: var(--font-display, 'Cormorant Garamond', Georgia, serif);
      font-size: clamp(2.2rem, 4.2vw, 3.5rem);
      font-weight: 500;
      line-height: 1.12;
      margin: 0 0 1rem;
      color: #fffaf1;
    }

    .quiz-header h2 em {
      color: #e5c178;
      font-style: italic;
    }

    .quiz-lead {
      color: rgba(248, 243, 235, 0.74);
      font-size: 1.03rem;
      line-height: 1.72;
      margin: 0;
    }

    /* Apple Liquid Glass Container */
    .liquid-glass-quiz-card {
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.025) 100%);
      backdrop-filter: blur(28px) saturate(185%);
      -webkit-backdrop-filter: blur(28px) saturate(185%);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow:
        0 30px 65px rgba(0, 0, 0, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.28);
      border-radius: 30px;
      padding: 2.6rem;
    }

    .quiz-topbar {
      margin-bottom: 2.2rem;
    }

    .quiz-steps-pills {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .step-pill {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.7rem 1rem;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: rgba(248, 243, 235, 0.5);
      text-align: left;
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .step-pill:disabled {
      cursor: default;
      opacity: 0.45;
    }

    .step-pill.active {
      background: rgba(229, 193, 120, 0.14);
      border-color: rgba(229, 193, 120, 0.5);
      color: #fffaf1;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .step-pill.completed {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(229, 193, 120, 0.28);
      color: #e5c178;
    }

    .step-pill-num {
      font-family: var(--font-display, 'Cormorant Garamond', serif);
      font-size: 1.15rem;
      font-weight: 600;
      color: #e5c178;
    }

    .step-pill-label {
      font-size: 0.74rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 600;
    }

    .quiz-progress-track {
      height: 4px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      overflow: hidden;
    }

    .quiz-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #c89d54, #f0d59c);
      border-radius: 999px;
      transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* Question Stage */
    .question-meta {
      text-align: center;
      max-width: 680px;
      margin: 0 auto 2.2rem;
    }

    .question-step-tag {
      display: inline-block;
      font-size: 0.72rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #e5c178;
      margin-bottom: 0.65rem;
    }

    .question-meta h3 {
      font-family: var(--font-display, 'Cormorant Garamond', serif);
      font-size: clamp(1.75rem, 3vw, 2.4rem);
      font-weight: 500;
      margin: 0 0 0.6rem;
      color: #fffaf1;
    }

    .question-meta p {
      margin: 0;
      font-size: 0.96rem;
      color: rgba(248, 243, 235, 0.7);
    }

    .quiz-options-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }

    .quiz-option-glass {
      position: relative;
      text-align: left;
      padding: 1.65rem;
      border-radius: 22px;
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02));
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
      color: #f8f3eb;
      cursor: pointer;
      transition: transform 0.28s ease, border-color 0.28s ease, background 0.28s ease, box-shadow 0.28s ease;
    }

    .quiz-option-glass:hover {
      transform: translateY(-4px);
      background: linear-gradient(145deg, rgba(229, 193, 120, 0.14), rgba(255, 255, 255, 0.04));
      border-color: rgba(229, 193, 120, 0.5);
      box-shadow:
        0 18px 36px rgba(0, 0, 0, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }

    .quiz-option-glass.selected {
      background: linear-gradient(145deg, rgba(229, 193, 120, 0.22), rgba(229, 193, 120, 0.06));
      border-color: #e5c178;
    }

    .option-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.85rem;
    }

    .option-symbol {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(229, 193, 120, 0.15);
      border: 1px solid rgba(229, 193, 120, 0.35);
      color: #e5c178;
      font-size: 1.1rem;
    }

    .option-nerve-tag {
      font-size: 0.7rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 0.28rem 0.65rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.07);
      color: #e5c178;
    }

    .quiz-option-glass h4 {
      font-family: var(--font-display, 'Cormorant Garamond', serif);
      font-size: 1.45rem;
      font-weight: 600;
      margin: 0 0 0.45rem;
      color: #fffaf1;
    }

    .quiz-option-glass p {
      font-size: 0.9rem;
      line-height: 1.6;
      color: rgba(248, 243, 235, 0.74);
      margin: 0 0 1rem;
    }

    .option-notes-preview {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .option-notes-preview span {
      font-size: 0.72rem;
      padding: 0.22rem 0.6rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(248, 243, 235, 0.82);
    }

    .quiz-nav-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.8rem;
      padding-top: 1.2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .quiz-back-btn {
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.16);
      color: #fffaf1;
      padding: 0.55rem 1.1rem;
      border-radius: 999px;
      font-size: 0.84rem;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .quiz-back-btn:hover {
      background: rgba(255, 255, 255, 0.14);
    }

    .quiz-hint {
      font-size: 0.8rem;
      color: rgba(248, 243, 235, 0.52);
      margin-left: auto;
    }

    /* Results Stage */
    .result-top-banner {
      display: grid;
      grid-template-columns: 1.35fr 1fr;
      gap: 2rem;
      padding-bottom: 2.4rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      margin-bottom: 2.4rem;
    }

    .result-badge {
      display: inline-block;
      padding: 0.35rem 0.9rem;
      border-radius: 999px;
      background: rgba(229, 193, 120, 0.16);
      border: 1px solid rgba(229, 193, 120, 0.4);
      color: #e5c178;
      font-size: 0.74rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      margin-bottom: 0.9rem;
    }

    .result-archetype-copy h3 {
      font-family: var(--font-display, 'Cormorant Garamond', serif);
      font-size: clamp(2rem, 3.5vw, 3rem);
      margin: 0 0 0.5rem;
      color: #fffaf1;
    }

    .result-subtitle {
      font-size: 1.05rem;
      color: #e5c178;
      margin: 0 0 1.5rem;
    }

    .diagnosis-boxes {
      display: grid;
      gap: 1rem;
    }

    .diagnosis-box {
      padding: 1.2rem 1.4rem;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.045);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .diag-label {
      display: block;
      font-size: 0.72rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #e5c178;
      margin-bottom: 0.45rem;
      font-weight: 600;
    }

    .diagnosis-box p {
      margin: 0;
      font-size: 0.93rem;
      line-height: 1.65;
      color: rgba(248, 243, 235, 0.84);
    }

    .result-sidebar-glass {
      padding: 1.6rem;
      border-radius: 22px;
      background: rgba(0, 0, 0, 0.28);
      border: 1px solid rgba(229, 193, 120, 0.25);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1.25rem;
    }

    .sidebar-eyebrow {
      font-size: 0.72rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #e5c178;
    }

    .mini-pyramid {
      display: grid;
      gap: 0.85rem;
    }

    .mini-tier strong {
      display: block;
      font-size: 0.75rem;
      color: rgba(248, 243, 235, 0.7);
      margin-bottom: 0.35rem;
      letter-spacing: 0.06em;
    }

    .mini-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .mini-chips button {
      background: rgba(229, 193, 120, 0.12);
      border: 1px solid rgba(229, 193, 120, 0.32);
      color: #fffaf1;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      font-size: 0.76rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .mini-chips button:hover {
      background: #e5c178;
      color: #120e0b;
    }

    .result-poetry-box {
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .poetry-lang {
      font-size: 0.68rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #e5c178;
    }

    .poetry-rtl {
      font-size: 1.25rem;
      line-height: 1.75;
      color: #fffaf1;
      margin: 0.4rem 0;
    }

    .poetry-translit {
      font-size: 0.8rem;
      font-style: italic;
      color: #e5c178;
      margin: 0 0 0.35rem;
    }

    .poetry-eng {
      font-size: 0.86rem;
      line-height: 1.55;
      color: rgba(248, 243, 235, 0.86);
      margin: 0 0 0.35rem;
    }

    .result-poetry-box small {
      color: rgba(248, 243, 235, 0.55);
      font-size: 0.74rem;
    }

    /* Matched Bottles */
    .matched-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .matched-eyebrow {
      display: block;
      font-size: 0.72rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #e5c178;
      margin-bottom: 0.3rem;
    }

    .matched-header h4 {
      font-family: var(--font-display, 'Cormorant Garamond', serif);
      font-size: 1.9rem;
      margin: 0;
      color: #fffaf1;
    }

    .retake-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fffaf1;
      padding: 0.6rem 1.2rem;
      border-radius: 999px;
      font-size: 0.84rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .retake-btn:hover {
      background: #e5c178;
      color: #120e0b;
      border-color: #e5c178;
    }

    .matched-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.35rem;
    }

    .matched-bottle-glass {
      border-radius: 22px;
      background: linear-gradient(155deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
      border: 1px solid rgba(255, 255, 255, 0.14);
      padding: 1.35rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.25s ease, border-color 0.25s ease;
    }

    .matched-bottle-glass:hover {
      transform: translateY(-4px);
      border-color: rgba(229, 193, 120, 0.55);
    }

    .match-score-ribbon {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .rank-pill {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 0.24rem 0.6rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      color: rgba(248, 243, 235, 0.8);
    }

    .match-pct {
      font-size: 0.78rem;
      color: #e5c178;
      background: rgba(229, 193, 120, 0.14);
      border: 1px solid rgba(229, 193, 120, 0.35);
      padding: 0.24rem 0.65rem;
      border-radius: 999px;
    }

    .matched-img-wrap {
      position: relative;
      width: 100%;
      height: 190px;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: #1a1410;
      padding: 0;
      cursor: pointer;
      margin-bottom: 1rem;
    }

    .matched-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .matched-img-wrap:hover img {
      transform: scale(1.05);
    }

    .conc-tag {
      position: absolute;
      bottom: 8px;
      left: 8px;
      background: rgba(12, 10, 8, 0.78);
      backdrop-filter: blur(8px);
      color: #f8f3eb;
      font-size: 0.68rem;
      padding: 0.22rem 0.55rem;
      border-radius: 999px;
    }

    .matched-brand {
      font-size: 0.72rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #e5c178;
    }

    .matched-info h5 {
      font-family: var(--font-display, 'Cormorant Garamond', serif);
      font-size: 1.5rem;
      margin: 0.25rem 0 0.5rem;
      color: #fffaf1;
    }

    .matched-why {
      font-size: 0.84rem;
      line-height: 1.55;
      color: rgba(248, 243, 235, 0.74);
      margin: 0 0 0.9rem;
    }

    .matched-note-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-bottom: 1.1rem;
    }

    .matched-note-pills span {
      font-size: 0.7rem;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
      color: rgba(248, 243, 235, 0.75);
    }

    .matched-note-pills span.highlighted {
      background: rgba(229, 193, 120, 0.22);
      border: 1px solid rgba(229, 193, 120, 0.5);
      color: #fffaf1;
    }

    .matched-price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      padding-top: 0.9rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .price-stack strong {
      display: block;
      font-size: 1.1rem;
      color: #fffaf1;
    }

    .price-stack small {
      font-size: 0.76rem;
      color: rgba(248, 243, 235, 0.45);
      text-decoration: line-through;
    }

    .matched-actions {
      display: flex;
      gap: 0.45rem;
    }

    .btn-glass-ghost {
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.16);
      color: #fffaf1;
      padding: 0.48rem 0.8rem;
      border-radius: 999px;
      font-size: 0.76rem;
      cursor: pointer;
    }

    .btn-glass-gold {
      background: linear-gradient(135deg, #e5c178, #c49746);
      border: none;
      color: #140f0c;
      font-weight: 600;
      padding: 0.48rem 0.9rem;
      border-radius: 999px;
      font-size: 0.76rem;
      cursor: pointer;
    }

    @media (max-width: 980px) {
      .quiz-steps-pills,
      .quiz-options-grid,
      .result-top-banner,
      .matched-grid {
        grid-template-columns: 1fr;
      }
      .liquid-glass-quiz-card {
        padding: 1.5rem;
      }
    }
  `]
})
export class ScentQuizComponent {
  @Input() products: Product[] = [];
  @Output() openProduct = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();
  @Output() filterByNote = new EventEmitter<string>();

  currentStep = 0;
  quizCompleted = false;
  selectedOptions: (QuizOption | null)[] = [null, null, null, null];
  activeArchetype: ArchetypeResult | null = null;
  recommendedProducts: ScoredProduct[] = [];

  readonly steps: QuizStep[] = [
    {
      stepNumber: '01',
      eyebrow: 'Nerve & Limbic Intention',
      question: 'When you first inhale your fragrance on your wrist, how should your nerves and mind feel?',
      subtext: 'Smell reaches the emotional brain in 150ms. Choose the emotional shift you seek most.',
      options: [
        {
          id: 's1-serene',
          symbol: '🌿',
          title: 'Calm Nerves & Grounded Peace',
          subtitle: 'Quiet a racing mind, lower daily stress, and wrap yourself in warm, centered stillness.',
          nerveBenefit: 'Parasympathetic Calm',
          archetypeKey: 'serene',
          affinityNotes: ['Sandalwood', 'Cardamom', 'Vetiver', 'White Tea', 'Cedarwood'],
          categoryHint: ['Unisex', 'For Him']
        },
        {
          id: 's1-sovereign',
          symbol: '👑',
          title: 'Sovereign Presence & Quiet Authority',
          subtitle: 'Command respect without shouting—deep, resinous warmth that anchors unshakeable confidence.',
          nerveBenefit: 'Deep Grounded Power',
          archetypeKey: 'sovereign',
          affinityNotes: ['Oud', 'Saffron', 'Amber', 'Leather', 'Patchouli'],
          categoryHint: ['For Him', 'Unisex']
        },
        {
          id: 's1-luminous',
          symbol: '☀️',
          title: 'Luminous Clarity & Effortless Poise',
          subtitle: 'Dissolve mental fog immediately with sun-drenched citrus, crisp botanicals, and clean woods.',
          nerveBenefit: 'Dopamine & Focus Lift',
          archetypeKey: 'luminous',
          affinityNotes: ['Bergamot', 'Neroli', 'Lemon', 'Fig', 'Cedarwood'],
          categoryHint: ['Unisex', 'For Her', 'For Him']
        },
        {
          id: 's1-velvet',
          symbol: '🌹',
          title: 'Intimate Mystery & Velvet Grace',
          subtitle: 'A poetic, skin-close embrace that draws people closer and lingers in memory.',
          nerveBenefit: 'Heart-Warming Oxytocin',
          archetypeKey: 'velvet',
          affinityNotes: ['Rose', 'Jasmine', 'Musk', 'Vanilla', 'Peony'],
          categoryHint: ['For Her', 'Unisex']
        }
      ]
    },
    {
      stepNumber: '02',
      eyebrow: 'Tactile Texture',
      question: 'If your signature aura had a physical texture on the skin, what would it feel like?',
      subtext: 'Fine perfumery translates touch into scent molecules through balanced Top, Heart, and Base tiers.',
      options: [
        {
          id: 's2-serene',
          symbol: '🪵',
          title: 'Warm Mysore Wood & Raw Cashmere',
          subtitle: 'Creamy sandalwood, earthy roots, and soft spiced warmth that feels like a second skin.',
          nerveBenefit: 'Warm & Meditative',
          archetypeKey: 'serene',
          affinityNotes: ['Sandalwood', 'Vetiver', 'Cedarwood', 'Cardamom'],
          categoryHint: ['Unisex']
        },
        {
          id: 's2-sovereign',
          symbol: '🔥',
          title: 'Spun Gold Resin & Crushed Saffron',
          subtitle: 'Smoky aged agarwood, golden ambergris, and royal spices steeped in centuries of heritage.',
          nerveBenefit: 'Rich & Opulent',
          archetypeKey: 'sovereign',
          affinityNotes: ['Oud', 'Saffron', 'Amber', 'Incense'],
          categoryHint: ['For Him', 'Unisex']
        },
        {
          id: 's2-luminous',
          symbol: '🍃',
          title: 'Crisp Sunlit Linen & Morning Dew',
          subtitle: 'Airy bergamot, green fig leaf, and mineral musk—effortlessly clean and quietly aristocratic.',
          nerveBenefit: 'Crisp & Restorative',
          archetypeKey: 'luminous',
          affinityNotes: ['Bergamot', 'Neroli', 'Green Tea', 'Musk'],
          categoryHint: ['Unisex', 'For Him']
        },
        {
          id: 's2-velvet',
          symbol: '🌸',
          title: 'Midnight Silk & Damask Petals',
          subtitle: 'Velvety rose otto, night-blooming jasmine, and warm vanilla-musk melting into pulse points.',
          nerveBenefit: 'Sensual & Soothing',
          archetypeKey: 'velvet',
          affinityNotes: ['Rose', 'Jasmine', 'Vanilla', 'Musk'],
          categoryHint: ['For Her', 'Unisex']
        }
      ]
    },
    {
      stepNumber: '03',
      eyebrow: 'The Ritual Moment',
      question: 'When do you most want this composition to speak for you?',
      subtext: 'Different moments call for different volatility curves across your 12–28 botanical notes.',
      options: [
        {
          id: 's3-serene',
          symbol: '🍵',
          title: 'Morning Sanctuary & Deep Creative Work',
          subtitle: 'When you want an intimate halo that keeps you calm, clear-headed, and unhurried.',
          nerveBenefit: 'Steady Alpha-Wave Calm',
          archetypeKey: 'serene',
          affinityNotes: ['Sandalwood', 'Cardamom', 'Bergamot', 'Vetiver'],
          categoryHint: ['Unisex']
        },
        {
          id: 's3-sovereign',
          symbol: '🌙',
          title: 'Candlelit Evenings & Royal Gatherings',
          subtitle: 'When the air cools and you want a magnetic, unforgettable trail of rare woods and spices.',
          nerveBenefit: 'Commanding Presence',
          archetypeKey: 'sovereign',
          affinityNotes: ['Oud', 'Amber', 'Saffron', 'Rose'],
          categoryHint: ['For Him', 'Unisex']
        },
        {
          id: 's3-luminous',
          symbol: '🏛️',
          title: 'Signature Daytime & High-Stakes Meetings',
          subtitle: 'Refined, tailored elegance that projects composure and sharpness from morning to dusk.',
          nerveBenefit: 'Composed Confidence',
          archetypeKey: 'luminous',
          affinityNotes: ['Bergamot', 'Cedarwood', 'Vetiver', 'Musk'],
          categoryHint: ['For Him', 'For Her', 'Unisex']
        },
        {
          id: 's3-velvet',
          symbol: '🕯️',
          title: 'Golden Hour & Intimate Conversations',
          subtitle: 'Close-range poetry—designed to be noticed only by those who lean in close.',
          nerveBenefit: 'Warm Emotional Resonance',
          archetypeKey: 'velvet',
          affinityNotes: ['Rose', 'Jasmine', 'Amber', 'Musk', 'Vanilla'],
          categoryHint: ['For Her', 'Unisex']
        }
      ]
    },
    {
      stepNumber: '04',
      eyebrow: 'Philosophy of Uniqueness',
      question: 'What matters most to you in the art of fine perfumery?',
      subtext: 'True luxury is never about harsh synthetic loudness—it is about how a rare accord becomes yours.',
      options: [
        {
          id: 's4-serene',
          symbol: '🧘',
          title: 'Calming My Nerves First',
          subtitle: 'I wear fragrance for my own peace of mind—one inhale on my wrist should steady my spirit.',
          nerveBenefit: 'Inner Equilibrium',
          archetypeKey: 'serene',
          affinityNotes: ['Sandalwood', 'Vetiver', 'Cardamom', 'Musk'],
          categoryHint: ['Unisex']
        },
        {
          id: 's4-sovereign',
          symbol: '⚜️',
          title: 'Unmatched Uniqueness Over Crowd Trends',
          subtitle: 'Longevity means nothing if it smells generic. I want a rare signature nobody else wears.',
          nerveBenefit: 'Distinctive Identity',
          archetypeKey: 'sovereign',
          affinityNotes: ['Oud', 'Saffron', 'Leather', 'Amber'],
          categoryHint: ['For Him', 'Unisex']
        },
        {
          id: 's4-luminous',
          symbol: '✨',
          title: 'Effortless Grace & Quiet Luxury',
          subtitle: 'A refined, breathable composition that never overwhelms a room yet radiates poise.',
          nerveBenefit: 'Refined Freshness',
          archetypeKey: 'luminous',
          affinityNotes: ['Bergamot', 'Neroli', 'Cedarwood', 'Fig'],
          categoryHint: ['Unisex', 'For Her']
        },
        {
          id: 's4-velvet',
          symbol: '📜',
          title: 'Poetic Soul & Timeless Adab',
          subtitle: 'Inspired by Persian, Arabic, and Urdu verses—where rose, musk, and amber tell a story.',
          nerveBenefit: 'Romantic Depth',
          archetypeKey: 'velvet',
          affinityNotes: ['Rose', 'Jasmine', 'Oud', 'Musk'],
          categoryHint: ['For Her', 'Unisex']
        }
      ]
    }
  ];

  readonly archetypes: Record<'serene' | 'sovereign' | 'luminous' | 'velvet', ArchetypeResult> = {
    serene: {
      key: 'serene',
      badge: 'OLFACTORY ARCHETYPE · THE SERENE ALCHEMIST',
      title: 'Sanctuary of Warm Woods & Spiced Stillness',
      subtitle: 'Your nervous system thrives on creamy botanical woods, green cardamom, and grounding roots.',
      limbicAnalysis:
        'Natural α-santalol in Mysore Sandalwood and linalool in Green Cardamom signal your parasympathetic nervous system within 150ms of inhalation—quieting mental noise, slowing a racing pulse, and anchoring you in calm, unshakeable self-assurance.',
      uniquenessVerdict:
        'Rather than harsh synthetic projection that causes olfactory fatigue, your skin chemistry amplifies intimate, creamy wood-and-musk molecules that stay close and evolve uniquely hour after hour.',
      pyramid: {
        top: ['Green Cardamom', 'Calabrian Bergamot', 'White Tea'],
        heart: ['Florentine Iris', 'Violet Leaf', 'Nutmeg'],
        base: ['Mysore Sandalwood', 'Haitian Vetiver', 'Cashmere Musk']
      },
      quote: {
        language: 'Urdu · Classical Adab',
        script: 'عطر کی اصل خوبی اس کی طوالت نہیں بلکہ اس کی انفرادیت ہے؛ وہ خوشبو جو سانس لیتے ہی اعصاب کو پرسکون کر دے۔',
        transliteration: 'Itr kī asal khūbī us kī tawālat nahīn balki us kī infirādiyat hai; woh khushbū jo sāns lete hī a’sāb ko pur-sukūn kar de.',
        translation: 'The true nobility of a perfume lies not in how loudly or long it shouts, but in its uniqueness—the scent that calms the nerves upon the very first inhale.',
        author: 'Zauq & Shauq House Philosophy'
      }
    },
    sovereign: {
      key: 'sovereign',
      badge: 'OLFACTORY ARCHETYPE · THE SOVEREIGN MYSTIC',
      title: 'Royal Alchemy of Aged Oud, Saffron & Amber',
      subtitle: 'You are drawn to rare resins, warm spices, and noble woods that leave an unforgettable signature.',
      limbicAnalysis:
        'Precious agarwood (Oud) and Kashmiri Saffron contain natural sesquiterpenes that stimulate deep limbic warmth—instilling quiet authority, composure, and magnetic confidence before you even speak a word.',
      uniquenessVerdict:
        'True luxury is rarity. While commercial fragrances rely on synthetic fixatives for longevity, natural Oud and Ambergris bind to your skin lipids to create a regal signature that belongs solely to you.',
      pyramid: {
        top: ['Kashmiri Saffron', 'Pink Pepper', 'Bitter Orange'],
        heart: ['Damask Rose Otto', 'Incense', 'Geranium'],
        base: ['Aged Assam Oud', 'Golden Amber', 'Leather Accord']
      },
      quote: {
        language: 'Arabic · Classical Wisdom',
        script: 'يَغِيبُ الشَّخْصُ وَيَبْقَى عَبِيرُهُ شَاهِدًا عَلَى فَرَادَةِ حُضُورِهِ',
        transliteration: 'Yaghību ash-shakhsu wa yabqā ‘abīruhu shāhidan ‘alā farādati hudūrih.',
        translation: 'A person may depart the room, yet their rare fragrance remains behind—a silent witness to the uniqueness of their presence.',
        author: 'Classical Arabian Adab'
      }
    },
    luminous: {
      key: 'luminous',
      badge: 'OLFACTORY ARCHETYPE · THE LUMINOUS FLÂNEUR',
      title: 'Sun-Drenched Citrus, Neroli & Tailored Cedar',
      subtitle: 'You seek clarity, effortless poise, and breathable sophistication that elevates every morning.',
      limbicAnalysis:
        'Cold-pressed Bergamot and Neroli blossoms release bright limonene and linalyl acetate esters that immediately lift mental fatigue, sharpen cognitive focus, and wrap your nerves in sunlit optimism.',
      uniquenessVerdict:
        'Freshness does not have to be fleeting or generic. By anchoring bright Mediterranean citrus in dry Atlas Cedarwood and mineral Vetiver, your scent stays crisp, distinctive, and deeply personal.',
      pyramid: {
        top: ['Calabrian Bergamot', 'Neroli Blossom', 'Mandarin'],
        heart: ['Mediterranean Fig', 'Petitgrain', 'Jasmine Tea'],
        base: ['Atlas Cedarwood', 'Vetiver Root', 'White Musk']
      },
      quote: {
        language: 'Arabic · Prophetic & Classical Tradition',
        script: 'الطِّيبُ غِذَاءُ الرُّوحِ، وَمَطِيَّةُ القَلْبِ، يَسْكُنُ بِهِ النَّفْسُ وَيَشْرَحُ الصَّدْرَ',
        transliteration: 'Al-tību ghidhā’u ar-rūh, wa matiyyatu al-qalb, yaskunu bihi an-nafsu wa yashrahu as-sadr.',
        translation: 'Fine fragrance is the nourishment of the spirit and the chariot of the heart; through a single breath of it, the restless soul finds stillness.',
        author: 'Classical Treatise on Al-Tīb'
      }
    },
    velvet: {
      key: 'velvet',
      badge: 'OLFACTORY ARCHETYPE · THE VELVET POET',
      title: 'Damask Rose, Night Jasmine & Skin-Close Musk',
      subtitle: 'You wear fragrance as an intimate poem—soft, magnetic, and deeply memorable.',
      limbicAnalysis:
        'Natural Damask Rose Otto and Jasmine Sambac harmonize emotional centers in the brain, soothing nervous tension while evoking warmth, empathy, and effortless romantic confidence.',
      uniquenessVerdict:
        'Instead of loud synthetic florals, your ideal composition pairs dewy petals with warm amber and skin-musk so the fragrance blooms exclusively with your body heat.',
      pyramid: {
        top: ['Pink Pepper', 'Lychee Dew', 'Bergamot'],
        heart: ['Damask Rose', 'Jasmine Sambac', 'Peony'],
        base: ['Velvet Musk', 'Madagascar Vanilla', 'Warm Amber']
      },
      quote: {
        language: 'Persian (Farsi) · Sheikh Saadi Shirazi',
        script: 'گفت من گِلی ناچیزم ولیکن مدتی با گل نشستم، کمال همنشین در من اثر کرد',
        transliteration: 'Guft man gilī nāchīzam walīkin / Muddatī bā gul nishastam, kamāl-e hamnishīn dar man asar kard.',
        translation: 'I was once humble earth, yet I sat for a season beside the rose—and the perfection of my companion became my very soul.',
        author: 'Saadi Shirazi (Gulistan, 1258 CE)'
      }
    }
  };

  selectOption(option: QuizOption): void {
    this.selectedOptions[this.currentStep] = option;
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    } else {
      this.computeResults();
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  goToStep(idx: number): void {
    if (idx <= this.currentStep) {
      this.currentStep = idx;
    }
  }

  resetQuiz(): void {
    this.currentStep = 0;
    this.quizCompleted = false;
    this.selectedOptions = [null, null, null, null];
    this.activeArchetype = null;
    this.recommendedProducts = [];
  }

  onPickNote(note: string): void {
    const clean = note.replace(/^(Calabrian |Mysore |Kashmiri |Damask |Aged Assam |Haitian |Atlas |Florentine |Green |Velvet |Warm |Golden |Madagascar )/, '');
    this.filterByNote.emit(clean);
  }

  private computeResults(): void {
    const counts: Record<'serene' | 'sovereign' | 'luminous' | 'velvet', number> = {
      serene: 0,
      sovereign: 0,
      luminous: 0,
      velvet: 0
    };

    const chosenNotes = new Set<string>();
    const chosenCategories = new Set<string>();

    for (const opt of this.selectedOptions) {
      if (!opt) continue;
      counts[opt.archetypeKey] += 1;
      opt.affinityNotes.forEach(n => chosenNotes.add(n.toLowerCase()));
      opt.categoryHint.forEach(c => chosenCategories.add(c.toLowerCase()));
    }

    // Determine winning archetype (tie-breaker favors Step 1 nerve intention)
    let winningKey: 'serene' | 'sovereign' | 'luminous' | 'velvet' =
      this.selectedOptions[0]?.archetypeKey || 'serene';
    let maxScore = -1;
    (Object.keys(counts) as Array<'serene' | 'sovereign' | 'luminous' | 'velvet'>).forEach(k => {
      if (counts[k] > maxScore) {
        maxScore = counts[k];
        winningKey = k;
      }
    });

    this.activeArchetype = this.archetypes[winningKey];

    // Score products from catalog
    const catalog = this.products && this.products.length ? this.products : [];
    const scored: ScoredProduct[] = catalog.map(product => {
      let score = 68;
      const matchedNotes: string[] = [];

      for (const note of product.notes || []) {
        const noteLower = note.toLowerCase();
        const isMatch = Array.from(chosenNotes).some(
          cn => noteLower.includes(cn) || cn.includes(noteLower)
        );
        if (isMatch) {
          score += 9;
          matchedNotes.push(note);
        }
      }

      const descLower = `${product.name} ${product.description || ''} ${product.ingredients || ''}`.toLowerCase();
      Array.from(chosenNotes).forEach(cn => {
        if (descLower.includes(cn)) {
          score += 3;
        }
      });

      if (chosenCategories.has((product.category || '').toLowerCase())) {
        score += 5;
      }

      const clampedPercent = Math.min(99, Math.max(82, score));

      const whyMap: Record<'serene' | 'sovereign' | 'luminous' | 'velvet', string> = {
        serene: `Crafted to steady the pulse and calm the nerves with ${product.notes.slice(0, 2).join(' & ')}, settling into an intimate, grounded skin signature.`,
        sovereign: `A rare, high-character composition where ${product.notes.slice(0, 2).join(' & ')} project quiet authority and unforgettable uniqueness.`,
        luminous: `Opens with immediate mental clarity through ${product.notes.slice(0, 2).join(' & ')}, keeping your aura crisp, poised, and effortless.`,
        velvet: `Blooms with body heat—pairing ${product.notes.slice(0, 2).join(' & ')} for a poetic, velvet trail that lingers in memory.`
      };

      return {
        product,
        matchPercent: clampedPercent,
        matchedNotes,
        whyItFits: whyMap[winningKey]
      };
    });

    scored.sort((a, b) => b.matchPercent - a.matchPercent);
    this.recommendedProducts = scored.slice(0, 3);
    this.quizCompleted = true;
  }
}

