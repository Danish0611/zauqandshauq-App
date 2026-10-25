import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

export interface PyramidTier {
  level: string;
  title: string;
  subtitle: string;
  ratio: string;
  duration: string;
  description: string;
  keyNotes: string[];
  neuroEffect: string;
}

export interface AccordCombination {
  id: string;
  mood: string;
  title: string;
  formula: string[];
  searchKeyword: string;
  whyItWorks: string;
  nerveEffect: string;
  recommendedFor: string;
}

export interface PoeticQuote {
  language: 'Persian' | 'Arabic' | 'Urdu' | 'English';
  languageNative: string;
  isRtl: boolean;
  originalScript: string;
  transliteration?: string;
  translation: string;
  author: string;
  work: string;
}

@Component({
  selector: 'app-scent-experience',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- SECTION 1: THE MANIFESTO — UNIQUENESS OVER LONGEVITY & NEURO-CALM -->
    <section class="glass-manifesto-section" id="craft">
      <div class="glass-orb orb-gold"></div>
      <div class="glass-orb orb-olive"></div>
      <div class="page-shell" style="position: relative; z-index: 2;">
        <div class="section-heading" style="margin-bottom: 42px;">
          <div>
            <div class="eyebrow eyebrow-light"><span class="eyebrow-line"></span> THE ZAUQ &amp; SHAUQ PHILOSOPHY</div>
            <h2 style="color: #f7f4eb;">Longevity is chemistry.<br><em>Uniqueness is soul.</em></h2>
          </div>
          <p style="max-width: 410px; font-size: 12px; line-height: 1.9; color: #c9d0be; margin: 0;">
            Anyone can overload synthetic fixatives to make a loud scent last 24 hours. True luxury is what happens in the first breath: a rare signature that calms your nerves and awakens quiet confidence.
          </p>
        </div>

        <div class="glass-pillars-grid">
          <article class="apple-glass-card">
            <span class="glass-pill-tag">01 · THE MYTH OF LOUDNESS</span>
            <h3>Why Uniqueness Matters More Than Mere Longevity</h3>
            <p>
              Mass-market perfumery chases brute projection—scents that fill an elevator but have no soul. When a fragrance relies on harsh synthetic ambroxan to last all day, it causes olfactory fatigue. At Zauq &amp; Shauq, we prioritize <strong>character over volume</strong>. A truly rare accord doesn't shout; it creates an intimate aura that people lean in to remember.
            </p>
            <div class="glass-metric-row">
              <div><strong>8 – 12 hrs</strong><small>Natural skin evolution</small></div>
              <div><strong>100%</strong><small>Signature individuality</small></div>
            </div>
          </article>

          <article class="apple-glass-card">
            <span class="glass-pill-tag">02 · NEURO-OLFACTION &amp; SERENITY</span>
            <h3>One Breath to Calm Your Nerves &amp; Anchor Confidence</h3>
            <p>
              Smell is the only human sense wired directly to the brain's <strong>limbic system and amygdala</strong>—the seat of emotion, memory, and calm—bypassing conscious noise. Inhaling real Mysore sandalwood, resinous oud, or bergamot slows the heart rate, quiets anxious thoughts, and grounds your presence before you speak a single word.
            </p>
            <div class="glass-metric-row">
              <div><strong>0.2 sec</strong><small>Limbic brain response</small></div>
              <div><strong>Calm + Poise</strong><small>Emotional grounding</small></div>
            </div>
          </article>

          <article class="apple-glass-card">
            <span class="glass-pill-tag">03 · THE ART OF COMPOSITION</span>
            <h3>How Many Notes Create a Masterpiece?</h3>
            <p>
              A great perfume is an orchestra of <strong>12 to 28+ raw botanical extracts</strong> structured into three living movements. Too few notes feel flat; too many without harmony become muddled. We balance <strong>3 primary accords</strong> per bottle so the top spark, emotional heart, and woody base unfold on your skin like chapters of a story.
            </p>
            <div class="glass-metric-row">
              <div><strong>3 Tiers</strong><small>Head · Heart · Base</small></div>
              <div><strong>15 – 30%</strong><small>Pure perfume oil</small></div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- SECTION 2: INTERACTIVE OLFACTORY PYRAMID & NOTE COMBINATIONS -->
    <section class="alchemy-section page-shell" id="alchemy">
      <div class="section-heading">
        <div>
          <div class="eyebrow"><span class="eyebrow-line"></span> OLFACTORY ARCHITECTURE</div>
          <h2>The anatomy of <em>scent &amp; mood.</em></h2>
          <p class="section-intro">Explore how notes are layered—and discover which combinations match your state of mind.</p>
        </div>
        <div class="category-pills">
          <button type="button" [class.active]="activeView === 'combinations'" (click)="activeView = 'combinations'">Note Combinations &amp; Moods</button>
          <button type="button" [class.active]="activeView === 'pyramid'" (click)="activeView = 'pyramid'">The 3-Tier Note Pyramid</button>
        </div>
      </div>

      <!-- INTERACTIVE ACCORD COMBINATIONS -->
      <div *ngIf="activeView === 'combinations'" class="combinations-grid">
        <article *ngFor="let combo of combinations" class="combo-glass-card" [class.is-selected]="selectedCombo.id === combo.id" (click)="selectedCombo = combo">
          <div class="combo-top">
            <span class="combo-mood-badge">{{ combo.mood }}</span>
            <span class="combo-rec">{{ combo.recommendedFor }}</span>
          </div>
          <h3>{{ combo.title }}</h3>
          <div class="combo-formula">
            <span *ngFor="let note of combo.formula; let last = last">
              <strong>{{ note }}</strong><i *ngIf="!last">+</i>
            </span>
          </div>
          <p class="combo-why">{{ combo.whyItWorks }}</p>
          <div class="combo-nerve-box">
            <span>✧ Sensory &amp; Nerve Effect:</span>
            <p>{{ combo.nerveEffect }}</p>
          </div>
          <button type="button" class="text-link" style="margin-top: 14px;" (click)="$event.stopPropagation(); filterByNote.emit(combo.searchKeyword)">
            Explore scents with {{ combo.searchKeyword }} <span>↗</span>
          </button>
        </article>
      </div>

      <!-- INTERACTIVE 3-TIER PYRAMID -->
      <div *ngIf="activeView === 'pyramid'" class="pyramid-Showcase">
        <div class="pyramid-tiers">
          <div *ngFor="let tier of pyramidTiers; let i = index"
               class="pyramid-tier-card"
               [class.active]="activeTierIndex === i"
               (click)="activeTierIndex = i">
            <div class="tier-header">
              <span class="tier-level">{{ tier.level }}</span>
              <span class="tier-ratio">{{ tier.ratio }} · {{ tier.duration }}</span>
            </div>
            <h3>{{ tier.title }} <em>— {{ tier.subtitle }}</em></h3>
            <p>{{ tier.description }}</p>
            <div class="note-list" style="margin-top: 12px;">
              <span *ngFor="let n of tier.keyNotes" (click)="$event.stopPropagation(); filterByNote.emit(n)" style="cursor: pointer;" title="Filter by this note">{{ n }} ↗</span>
            </div>
            <small class="tier-neuro">✦ {{ tier.neuroEffect }}</small>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 3: MULTILINGUAL LITERARY & POETIC ANTHOLOGY (PERSIAN, ARABIC, URDU, ENGLISH) -->
    <section class="poetry-glass-section" id="poetry">
      <div class="page-shell">
        <div class="section-heading" style="margin-bottom: 34px;">
          <div>
            <div class="eyebrow eyebrow-light"><span class="eyebrow-line"></span> ZAUQ &amp; SHAUQ ANTHOLOGY</div>
            <h2 style="color: #f7f4eb;">Verse &amp; fragrance across <em>civilizations.</em></h2>
            <p class="section-intro" style="color: #c1c8b5;">
              In Persian, Arabic, Urdu, and English letters, scent has always been the language of the unseen soul.
            </p>
          </div>
          <div class="category-pills">
            <button type="button" [class.active]="quoteFilter === 'All'" (click)="quoteFilter = 'All'" style="color: #e7dec3;">All Verses</button>
            <button type="button" [class.active]="quoteFilter === 'Persian'" (click)="quoteFilter = 'Persian'" style="color: #e7dec3;">Persian Classics</button>
            <button type="button" [class.active]="quoteFilter === 'Arabic'" (click)="quoteFilter = 'Arabic'" style="color: #e7dec3;">Arabic Traditions</button>
            <button type="button" [class.active]="quoteFilter === 'Urdu'" (click)="quoteFilter = 'Urdu'" style="color: #e7dec3;">Urdu Adab</button>
            <button type="button" [class.active]="quoteFilter === 'English'" (click)="quoteFilter = 'English'" style="color: #e7dec3;">English Literary</button>
          </div>
        </div>

        <div class="poetry-grid">
          <article *ngFor="let q of filteredQuotes" class="apple-glass-card poetry-card">
            <div class="poetry-card-header">
              <span class="glass-pill-tag">{{ q.language }} · {{ q.languageNative }}</span>
              <span class="poetry-ornament">۞</span>
            </div>

            <blockquote class="poetry-original" [attr.dir]="q.isRtl ? 'rtl' : 'ltr'" [class.rtl-script]="q.isRtl">
              {{ q.originalScript }}
            </blockquote>

            <p class="poetry-transliteration" *ngIf="q.transliteration">
              “{{ q.transliteration }}”
            </p>

            <p class="poetry-translation">
              “{{ q.translation }}”
            </p>

            <footer class="poetry-author">
              <strong>{{ q.author }}</strong>
              <small>{{ q.work }}</small>
            </footer>
          </article>
        </div>
      </div>
    </section>
  `
})
export class ScentExperienceComponent {
  @Output() filterByNote = new EventEmitter<string>();

  activeView: 'combinations' | 'pyramid' = 'combinations';
  activeTierIndex = 0;
  quoteFilter: 'All' | 'Persian' | 'Arabic' | 'Urdu' | 'English' = 'All';

  readonly pyramidTiers: PyramidTier[] = [
    {
      level: 'TIER 01 · THE OPENING',
      title: 'Top Notes',
      subtitle: 'The First Impression',
      ratio: '15% – 25% of formula',
      duration: 'First 5 to 30 mins',
      description: 'Light, volatile molecules that greet you the moment the mist touches warm skin. They awaken the senses and clear mental fog.',
      keyNotes: ['Bergamot', 'Lemon', 'Saffron', 'Mandarin', 'Fig Leaf', 'Black Pepper'],
      neuroEffect: 'Immediate sensory uplift; bright citrus and spice awaken alertness and dispel fatigue.'
    },
    {
      level: 'TIER 02 · THE EMOTIONAL HEART',
      title: 'Heart Notes',
      subtitle: 'The Character Within',
      ratio: '30% – 40% of formula',
      duration: '30 mins to 5 hours',
      description: 'As the top notes soften, the true personality of the perfume blooms. Florals, resins, and aromatic herbs wrap around your natural skin chemistry.',
      keyNotes: ['Rose', 'Jasmine', 'Neroli', 'Incense', 'Peony', 'Orange Blossom'],
      neuroEffect: 'Balances mood and lowers stress hormones; floral and herbal esters soothe the nervous system.'
    },
    {
      level: 'TIER 03 · THE SOUL & MEMORY',
      title: 'Base Notes',
      subtitle: 'The Lasting Signature',
      ratio: '45% – 55% of formula',
      duration: '6 to 24+ hours',
      description: 'Deep, heavy molecules that anchor the fragrance. They bind with your skin to leave an intimate, unmistakable trail long after you leave the room.',
      keyNotes: ['Oud', 'Amber', 'Sandalwood', 'White Musk', 'Vetiver', 'Cedarwood', 'Vanilla'],
      neuroEffect: 'Deep vagus-nerve calm and quiet confidence; rich woods and resins create a grounded sense of peace.'
    }
  ];

  readonly combinations: AccordCombination[] = [
    {
      id: 'nerve-calm',
      mood: 'SERENITY & NERVE CALM',
      title: 'The Sanctuary Accord',
      formula: ['Sandalwood', 'Amber', 'Vanilla'],
      searchKeyword: 'Sandalwood',
      recommendedFor: 'Stress Relief · Evening Unwinding · Deep Focus',
      whyItWorks: 'Creamy sandalwood and warm amber wrap volatile notes in a velvety cocoon that never overwhelms the room.',
      nerveEffect: 'Natural santalol and warm vanilla calm racing thoughts, slow breathing, and restore emotional equilibrium.'
    },
    {
      id: 'quiet-confidence',
      mood: 'QUIET AUTHORITY',
      title: 'The Sovereign Woods Accord',
      formula: ['Oud', 'Amber', 'Cedarwood'],
      searchKeyword: 'Oud',
      recommendedFor: 'Boardroom · Formal Evenings · Signature Presence',
      whyItWorks: 'Smoky agarwood (Oud) tempered by dry atlas cedarwood and golden amber creates depth without harsh synthetic sharpness.',
      nerveEffect: 'Instills unshakable composure and grounded self-assurance the moment you catch its trail on your collar.'
    },
    {
      id: 'poetic-allure',
      mood: 'POETIC ELEGANCE',
      title: 'The Velvet Petal Accord',
      formula: ['Rose', 'Pear', 'White Musk'],
      searchKeyword: 'Rose',
      recommendedFor: 'Intimate Gatherings · Celebrations · Gifting',
      whyItWorks: 'Damask rose petals brightened with crisp pear and anchored in skin-like white musk feel luminous and effortless.',
      nerveEffect: 'Damask rose essential oil is clinically shown to ease tension and evoke warmth, openness, and grace.'
    },
    {
      id: 'sunlit-clarity',
      mood: 'EFFORTLESS CLARITY',
      title: 'The Mediterranean Breeze Accord',
      formula: ['Bergamot', 'Neroli', 'Vetiver'],
      searchKeyword: 'Vetiver',
      recommendedFor: 'Morning Rituals · Workdays · Warm Weather',
      whyItWorks: 'Sun-ripened bergamot and orange-blossom neroli grounded by earthy vetiver roots—"the oil of tranquility."',
      nerveEffect: 'Clears mental clutter in seconds while vetiver keeps your nervous system cool and centered under pressure.'
    }
  ];

  selectedCombo: AccordCombination = this.combinations[0];

  readonly quotes: PoeticQuote[] = [
    {
      language: 'Persian',
      languageNative: 'فارسی',
      isRtl: true,
      originalScript: 'گِلی خوشبوی در حمام روزی رسید از دست محبوبی به دستم — بگفتا من گِلی ناچیز بودم، ولیکن مدتی با گل نشستم',
      transliteration: 'Gilī khushbūy dar ḥammām rūzī rasīd az dast-i maḥbūbī ba dastam — Bagoftā man gilī nāchīz būdam, valīkan muddatī bā gul nashastam.',
      translation: 'One day a piece of fragrant clay passed into my hands. I asked: "Are you musk or ambergris, that your soul-enchanting scent intoxicates me?" It replied: "I was humble earth—but for a season, I sat in the company of the rose."',
      author: 'Sheikh Saadi Shirazi',
      work: 'Gulistan (The Rose Garden, 1258 CE)'
    },
    {
      language: 'Persian',
      languageNative: 'فارسی',
      isRtl: true,
      originalScript: 'بوی خوش تو هر که ز باد صبا شنید — از یار آشنا سخن آشنا شنید',
      transliteration: 'Bū-yi khush-i tū har ki zi bād-i ṣabā shanīd — Az yār-i āshnā sukhan-i āshnā shanīd.',
      translation: 'Whoever caught your sweet fragrance upon the morning breeze heard an intimate word from a soul they had always known.',
      author: 'Hafez Shirazi',
      work: 'Divan-e-Hafez'
    },
    {
      language: 'Arabic',
      languageNative: 'العربية',
      isRtl: true,
      originalScript: 'الطِّيبُ غِذَاءُ الرُّوحِ، وَإِذَا طَابَتِ الرُّوحُ هَدَأَتِ النَّفْسُ وَقَوِيَ الْقَلْبُ',
      transliteration: 'Al-ṭību ghidhā’u al-rūḥ, wa idhā ṭābati al-rūḥu hada’ati al-nafsu wa qawiya al-qalb.',
      translation: 'Fragrance is the nourishment of the spirit; when the spirit is perfumed, the nerves grow tranquil and the heart grows strong.',
      author: 'Classical Arabic Wisdom',
      work: 'Treatise on Olfaction & the Soul (Al-Tib)'
    },
    {
      language: 'Arabic',
      languageNative: 'العربية',
      isRtl: true,
      originalScript: 'لَوْلَا العَبِيرُ لَمَا عَرَفْنَا أَنَّ لِلذِّكْرَى جَنَاحًا يَعْبُرُ الأَزْمَانَا',
      transliteration: 'Lawlā al-‘abīru lamā ‘arafnā anna lil-dhikrā janāḥan ya‘buru al-azmānā.',
      translation: 'Were it not for rare fragrance, we would never know that memory possesses wings that cross the boundaries of time.',
      author: 'Arabian Poetic Tradition',
      work: 'Odes of Oud & Amber'
    },
    {
      language: 'Urdu',
      languageNative: 'اردو',
      isRtl: true,
      originalScript: 'وہ تو خوشبو ہے، ہواؤں میں بکھر جائے گا — مسئلہ پھول کا ہے، پھول کدھر جائے گا',
      transliteration: 'Woh toh khushboo hai, hawaon mein bikhar jaayega — Masla phool ka hai, phool kidhar jaayega.',
      translation: 'Fragrance belongs to the breeze and will drift timelessly across the world; the question is of the flower—where shall the flower go without its soul?',
      author: 'Parveen Shakir',
      work: 'Khushboo (1977)'
    },
    {
      language: 'Urdu',
      languageNative: 'اردو',
      isRtl: true,
      originalScript: 'ذوقِ نظر ہو روح میں، اور شوق ہو دل میں — خوشبو ہی بتا دیتی ہے معیارِ نفاست',
      transliteration: 'Zauq-e-nazar ho rooh mein, aur shauq ho dil mein — Khushboo hi bata deti hai mi‘yaar-e-nafaasat.',
      translation: 'When discernment (Zauq) lives in the soul and passion (Shauq) in the heart, a person’s fragrance alone reveals the measure of their grace.',
      author: 'Classical Urdu Adab',
      work: 'Diwan-e-Zauq & Shauq'
    },
    {
      language: 'English',
      languageNative: 'English',
      isRtl: false,
      originalScript: 'Perfume is the unseen, unforgettable, ultimate accessory. It heralds your arrival and prolongs your departure.',
      translation: 'A true signature scent is never chosen for how loudly it shouts, but for how quietly it stays in the memory of those who cross your path.',
      author: 'Coco Chanel',
      work: 'Haute Parfumerie Maxims'
    },
    {
      language: 'English',
      languageNative: 'English',
      isRtl: false,
      originalScript: 'Odors have a power of persuasion stronger than that of words, appearances, emotions, or will. It enters into us like breath into our lungs and imbues us totally.',
      translation: 'A single inhalation of a masterfully balanced accord bypasses doubt, calms the pulse, and restores quiet self-possession.',
      author: 'Patrick Süskind',
      work: 'Perfume: The Story of a Murderer'
    }
  ];

  get filteredQuotes(): PoeticQuote[] {
    if (this.quoteFilter === 'All') return this.quotes;
    return this.quotes.filter(q => q.language === this.quoteFilter);
  }
}

