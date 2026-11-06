import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiChatService, ChatMessage, ChatResponse } from '../../ai-chat.service';
import { Product } from '../../product.model';

@Component({
  selector: 'app-ai-chat-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  template: `
    <!-- Floating Launcher Pill (Visible when chat drawer is closed) -->
    <button
      *ngIf="!open"
      type="button"
      class="ai-concierge-launcher"
      (click)="toggleOpen()"
      aria-label="Open AI Scent Concierge">
      <span class="launcher-pulse"></span>
      <div class="launcher-icon">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2l2.4 7.2L21 12l-6.6 2.8L12 22l-2.4-7.2L3 12l6.6-2.8z"></path>
        </svg>
      </div>
      <div class="launcher-text">
        <span class="launcher-title">Scent Concierge</span>
        <small class="launcher-sub">Ask Nadir · AI Perfumer</small>
      </div>
    </button>

    <!-- Overlay Backdrop -->
    <div
      class="ai-chat-backdrop"
      *ngIf="open"
      (click)="closeDrawer()"
      role="presentation">
    </div>

    <!-- Scent Concierge Chat Drawer / Window -->
    <aside
      class="ai-chat-drawer"
      [class.is-open]="open"
      role="dialog"
      aria-modal="true"
      aria-label="Zauq and Shauq Scent Concierge">

      <!-- Drawer Header -->
      <header class="chat-header">
        <div class="header-emblem-wrap">
          <div class="header-emblem">✦</div>
          <div class="header-titles">
            <div class="concierge-brand-lockup">
              <h3>Nadir · Scent Concierge</h3>
              <span class="live-dot" title="Live Gemini AI Online"></span>
            </div>
            <p class="concierge-subtitle">Master Perfumer · Personal Fragrance Advisor</p>
          </div>
        </div>

        <div class="header-actions">
          <button
            type="button"
            class="header-action-btn"
            title="Reset consultation"
            (click)="resetConversation()"
            *ngIf="messages.length > 1">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
          </button>
          <button
            type="button"
            class="close-button chat-close-btn"
            (click)="closeDrawer()"
            aria-label="Close scent concierge">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </header>

      <!-- Royal Philosophy Strip -->
      <div class="chat-philosophy-strip">
        <span>“Khushboo woh khamosh zubaan hai jo dil se dil tak baat karti hai” · Scent speaks from heart to heart</span>
      </div>

      <!-- Quick Starter Pills -->
      <div class="chat-starter-pills" *ngIf="messages.length <= 1">
        <span class="starter-label">Consult on:</span>
        <div class="starter-scroller">
          <button
            type="button"
            class="starter-pill"
            *ngFor="let prompt of starterPrompts"
            (click)="selectPrompt(prompt)">
            {{ prompt }}
          </button>
        </div>
      </div>

      <!-- Chat Messages Body -->
      <div class="chat-messages-container" #scrollContainer>
        <div
          *ngFor="let msg of messages; let idx = index"
          class="chat-bubble-row"
          [class.user-row]="msg.role === 'user'"
          [class.model-row]="msg.role === 'model'">

          <!-- Model Avatar -->
          <div class="bubble-avatar" *ngIf="msg.role === 'model'">
            <span>Z&amp;S</span>
          </div>

          <div class="bubble-content-wrap">
            <!-- Bubble Message Box -->
            <div
              class="chat-bubble"
              [class.user-bubble]="msg.role === 'user'"
              [class.model-bubble]="msg.role === 'model'">
              <div class="bubble-text" [innerHTML]="formatMessage(msg.content)"></div>
            </div>

            <!-- Embedded Interactive Recommended Products -->
            <div
              class="recommended-products-deck"
              *ngIf="msg.role === 'model' && msg.recommendedProducts && msg.recommendedProducts.length > 0">
              <span class="deck-title">✦ Recommended Flacons from Vault:</span>
              <div class="deck-scroll">
                <div class="product-mini-card" *ngFor="let prod of msg.recommendedProducts">
                  <div class="mini-img-wrap" (click)="onViewProduct(prod)">
                    <img [src]="prod.image" [alt]="prod.name" />
                    <span class="mini-badge" *ngIf="prod.badge">{{ prod.badge }}</span>
                  </div>
                  <div class="mini-info">
                    <span class="mini-cat">{{ prod.brand }} · {{ prod.category }}</span>
                    <strong class="mini-name" (click)="onViewProduct(prod)">{{ prod.name }}</strong>
                    <div class="mini-price-row">
                      <span class="mini-price">{{ prod.price | currency:'INR':'symbol':'1.0-0' }}</span>
                      <small class="mini-conc">{{ prod.concentration || 'Extrait de Parfum' }}</small>
                    </div>
                    <div class="mini-notes-row" *ngIf="prod.notes && prod.notes.length > 0">
                      <span class="mini-note-chip" *ngFor="let note of prod.notes.slice(0, 3)">{{ note }}</span>
                    </div>
                    <div class="mini-actions">
                      <button type="button" class="btn-mini-view" (click)="onViewProduct(prod)">Inspect</button>
                      <button type="button" class="btn-mini-add" (click)="onAddToCart(prod)">+ Bag</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <span class="bubble-time">{{ msg.timestamp | date:'shortTime' }}</span>
          </div>
        </div>

        <!-- Typing Indicator with Scent Diffuser Mist Pulse -->
        <div class="chat-bubble-row model-row typing-row" *ngIf="loading">
          <div class="bubble-avatar">
            <span>Z&amp;S</span>
          </div>
          <div class="chat-bubble model-bubble typing-bubble">
            <div class="diffuser-pulse-wrap">
              <span class="pulse-mist-ring ring-1"></span>
              <span class="pulse-mist-ring ring-2"></span>
              <span class="pulse-core-dot">✦</span>
            </div>
            <span class="typing-label">Nadir is consulting our botanical vault...</span>
          </div>
        </div>
      </div>

      <!-- Chat Input Area -->
      <footer class="chat-footer">
        <form class="chat-form" (submit)="$event.preventDefault(); sendMessage()">
          <input
            #messageInput
            type="text"
            [(ngModel)]="userInput"
            name="chatMessage"
            [disabled]="loading"
            autocomplete="off"
            placeholder="Ask Nadir about notes, long-lasting ouds, gifts, or layering..."
            class="chat-input" />
          <button
            type="submit"
            class="chat-send-btn"
            [disabled]="loading || !userInput.trim()"
            aria-label="Send message">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
        <div class="chat-footer-note">
          <span>Personal Fragrance Advisor · Powered by Google Gemini</span>
        </div>
      </footer>
    </aside>
  `,
  styles: [`
    /* Floating Launcher Pill */
    .ai-concierge-launcher {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1050;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 11px 19px 11px 15px;
      border-radius: 999px;
      background: linear-gradient(135deg, #0a3a2a 0%, #041b13 100%);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(212, 175, 55, 0.55);
      color: #fffefb;
      box-shadow: 0 12px 36px rgba(4, 28, 20, 0.7), 0 0 22px rgba(212, 175, 55, 0.3);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .ai-concierge-launcher:hover {
      transform: translateY(-3px) scale(1.03);
      border-color: #e5c875;
      box-shadow: 0 16px 44px rgba(4, 28, 20, 0.85), 0 0 30px rgba(212, 175, 55, 0.5);
    }

    .launcher-pulse {
      position: absolute;
      top: 6px;
      left: 6px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #e5c875;
      box-shadow: 0 0 12px #e5c875;
      animation: pulseGlow 2s infinite;
    }

    .launcher-icon {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(212, 175, 55, 0.18);
      border: 1px solid rgba(212, 175, 55, 0.4);
      display: grid;
      place-items: center;
      color: #e5c875;
    }

    .launcher-text {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
    }

    .launcher-title {
      font-size: 13px;
      font-weight: 600;
      color: #fffefb;
      letter-spacing: 0.02em;
    }

    .launcher-sub {
      font-size: 10px;
      color: #d6cfc2;
      letter-spacing: 0.03em;
    }

    /* Backdrop */
    .ai-chat-backdrop {
      position: fixed;
      inset: 0;
      z-index: 2500;
      background: rgba(3, 16, 11, 0.78);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      animation: fadeIn 0.25s ease;
    }

    /* Drawer / Window Container (Haute Parfumerie Imperial Emerald & 24K Gold) */
    .ai-chat-drawer {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: min(520px, 100%);
      z-index: 2600;
      background: linear-gradient(165deg, #07241b 0%, #041812 50%, #020e09 100%);
      backdrop-filter: blur(36px) saturate(200%);
      -webkit-backdrop-filter: blur(36px) saturate(200%);
      border-left: 1px solid rgba(212, 175, 55, 0.4);
      box-shadow: -20px 0 60px rgba(0, 0, 0, 0.85);
      display: flex;
      flex-direction: column;
      transform: translateX(105%);
      transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
      box-sizing: border-box;
      color: #faf8f3;
    }

    .ai-chat-drawer.is-open {
      transform: translateX(0);
    }

    /* Drawer Header */
    .chat-header {
      padding: 18px 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(212, 175, 55, 0.25);
      background: rgba(4, 24, 18, 0.96);
      flex-shrink: 0;
    }

    .header-emblem-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-emblem {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(13, 56, 41, 0.6);
      border: 1px solid rgba(212, 175, 55, 0.5);
      display: grid;
      place-items: center;
      font-size: 18px;
      color: #e5c875;
      box-shadow: 0 0 16px rgba(212, 175, 55, 0.3);
    }

    .header-titles {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .concierge-brand-lockup {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .concierge-brand-lockup h3 {
      margin: 0;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 19px;
      font-weight: 600;
      color: #ffffff;
      letter-spacing: -0.2px;
    }

    .live-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #e5c875;
      box-shadow: 0 0 10px #e5c875;
    }

    .concierge-subtitle {
      margin: 0;
      font-size: 10px;
      color: #d6cfc2;
      letter-spacing: 0.04em;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-action-btn {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(212, 175, 55, 0.3);
      color: #d6cfc2;
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .header-action-btn:hover {
      background: rgba(212, 175, 55, 0.2);
      color: #e5c875;
      border-color: #e5c875;
    }

    .chat-close-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(4, 24, 18, 0.95);
      border: 1px solid rgba(212, 175, 55, 0.45);
      color: #fffefb;
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
    }

    .chat-close-btn:hover {
      background: rgba(212, 175, 55, 0.25);
      color: #e5c875;
      transform: rotate(90deg) scale(1.08);
      border-color: #e5c875;
    }

    /* Philosophy Strip */
    .chat-philosophy-strip {
      padding: 8px 18px;
      background: rgba(9, 41, 30, 0.55);
      border-bottom: 1px solid rgba(212, 175, 55, 0.2);
      text-align: center;
      font-size: 11px;
      color: #e5c875;
      letter-spacing: 0.04em;
      flex-shrink: 0;
    }

    /* Starter Pills */
    .chat-starter-pills {
      padding: 12px 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(0, 0, 0, 0.25);
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex-shrink: 0;
    }

    .starter-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #d6cfc2;
      font-weight: 600;
    }

    .starter-scroller {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: none;
    }

    .starter-scroller::-webkit-scrollbar {
      display: none;
    }

    .starter-pill {
      white-space: nowrap;
      padding: 6px 13px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(212, 175, 55, 0.35);
      color: #f7f3ec;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .starter-pill:hover {
      background: rgba(212, 175, 55, 0.22);
      border-color: #e5c875;
      color: #ffffff;
      transform: translateY(-1px);
    }

    /* Messages Container */
    .chat-messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px 18px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      background: radial-gradient(circle at 75% 15%, rgba(13, 56, 41, 0.32) 0%, rgba(4, 20, 15, 0.98) 70%);
    }

    .chat-bubble-row {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      max-width: 100%;
    }

    .chat-bubble-row.user-row {
      justify-content: flex-end;
    }

    .chat-bubble-row.model-row {
      justify-content: flex-start;
    }

    .bubble-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(13, 56, 41, 0.7);
      border: 1px solid rgba(212, 175, 55, 0.5);
      display: grid;
      place-items: center;
      font-size: 10px;
      font-weight: 700;
      color: #e5c875;
      flex-shrink: 0;
      margin-top: 4px;
    }

    .bubble-content-wrap {
      display: flex;
      flex-direction: column;
      max-width: calc(100% - 46px);
    }

    .user-row .bubble-content-wrap {
      align-items: flex-end;
      max-width: 82%;
    }

    .chat-bubble {
      padding: 13px 17px;
      border-radius: 18px;
      font-size: 12.5px;
      line-height: 1.65;
      word-break: break-word;
      box-shadow: 0 6px 22px rgba(0, 0, 0, 0.45);
    }

    /* USER BUBBLE: IMPERIAL EMERALD SILK ACCENT */
    .user-bubble {
      background: linear-gradient(135deg, #0e4533 0%, #082d21 100%);
      color: #ffffff;
      border: 1px solid rgba(212, 175, 55, 0.55);
      border-bottom-right-radius: 4px;
      box-shadow: 0 4px 18px rgba(4, 28, 20, 0.5);
    }

    /* MODEL BUBBLE: ROYAL MALACHITE GLASS WITH GOLD TRIM */
    .model-bubble {
      background: rgba(8, 32, 24, 0.94);
      color: #fbf9f5;
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-left: 3px solid #d4af37;
      border-bottom-left-radius: 4px;
    }

    .bubble-text p {
      margin: 0 0 8px;
    }

    .bubble-text p:last-child {
      margin-bottom: 0;
    }

    .bubble-text strong {
      color: #e5c875;
      font-weight: 600;
    }

    .bubble-text em {
      color: #d6cfc2;
    }

    .bubble-time {
      font-size: 9px;
      color: rgba(247, 237, 226, 0.5);
      margin-top: 4px;
      padding: 0 4px;
    }

    /* Diffuser Mist Pulse in Typing Indicator */
    .typing-bubble {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 18px;
    }

    .diffuser-pulse-wrap {
      position: relative;
      width: 20px;
      height: 20px;
      display: grid;
      place-items: center;
    }

    .pulse-core-dot {
      color: #e5c178;
      font-size: 13px;
      animation: pulseCore 1.5s infinite ease-in-out;
    }

    .pulse-mist-ring {
      position: absolute;
      border: 1px solid rgba(229, 193, 120, 0.6);
      border-radius: 50%;
      animation: expandMistRing 2s infinite ease-out;
    }

    .pulse-mist-ring.ring-1 { width: 14px; height: 14px; animation-delay: 0s; }
    .pulse-mist-ring.ring-2 { width: 14px; height: 14px; animation-delay: 0.8s; }

    @keyframes expandMistRing {
      0% { transform: scale(0.6); opacity: 0.9; }
      100% { transform: scale(2.4); opacity: 0; }
    }

    @keyframes pulseCore {
      0%, 100% { transform: scale(0.9); opacity: 0.7; }
      50% { transform: scale(1.2); opacity: 1; }
    }

    .typing-label {
      font-size: 11.5px;
      color: #e5c178;
      font-style: italic;
    }

    /* Recommended Product Mini Cards Deck */
    .recommended-products-deck {
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }

    .deck-title {
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #e5c178;
      font-weight: 600;
    }

    .deck-scroll {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .product-mini-card {
      display: flex;
      gap: 12px;
      padding: 11px 13px;
      background: rgba(6, 26, 19, 0.95);
      border: 1px solid rgba(212, 175, 55, 0.32);
      border-radius: 12px;
      align-items: center;
      transition: all 0.2s ease;
    }

    .product-mini-card:hover {
      border-color: #e5c875;
      background: rgba(10, 38, 28, 0.98);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
    }

    .mini-img-wrap {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.08);
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
      cursor: pointer;
    }

    .mini-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .mini-badge {
      position: absolute;
      top: 3px;
      left: 3px;
      font-size: 7px;
      background: #e5c875;
      color: #041812;
      padding: 2px 4px;
      border-radius: 3px;
      font-weight: 700;
    }

    .mini-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .mini-cat {
      font-size: 8px;
      color: #d6cfc2;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .mini-name {
      font-family: 'Playfair Display', serif;
      font-size: 14px;
      color: #ffffff;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .mini-name:hover {
      color: #e5c875;
    }

    .mini-price-row {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .mini-price {
      font-family: 'Playfair Display', serif;
      font-size: 13px;
      color: #e5c875;
      font-weight: 600;
    }

    .mini-conc {
      font-size: 8px;
      color: #a3b8aa;
    }

    .mini-notes-row {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      margin: 2px 0 4px;
    }

    .mini-note-chip {
      font-size: 8px;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.08);
      color: #faf8f5;
      border: 1px solid rgba(212, 175, 55, 0.15);
    }

    .mini-actions {
      display: flex;
      gap: 6px;
      margin-top: 2px;
    }

    .btn-mini-view,
    .btn-mini-add {
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 9.5px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-mini-view {
      background: transparent;
      border: 1px solid rgba(212, 175, 55, 0.45);
      color: #e5c875;
    }

    .btn-mini-view:hover {
      background: rgba(212, 175, 55, 0.2);
    }

    .btn-mini-add {
      background: #e5c875;
      border: 1px solid #e5c875;
      color: #041812;
      font-weight: 600;
    }

    .btn-mini-add:hover {
      background: #faeed4;
    }

    /* Chat Footer & Input */
    .chat-footer {
      padding: 14px 18px 18px;
      border-top: 1px solid rgba(212, 175, 55, 0.22);
      background: #041812;
      flex-shrink: 0;
    }

    .chat-form {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(7, 30, 22, 0.95);
      border: 1px solid rgba(212, 175, 55, 0.35);
      border-radius: 999px;
      padding: 5px 6px 5px 16px;
      transition: all 0.25s ease;
    }

    .chat-form:focus-within {
      border-color: #e5c875;
      box-shadow: 0 0 16px rgba(212, 175, 55, 0.28);
    }

    .chat-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      font-size: 11.5px;
      color: #fbf9f5;
    }

    .chat-input::placeholder {
      color: #8fa89b;
    }

    .chat-send-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #faeed4 0%, #e5c875 50%, #c4a15d 100%);
      color: #041812;
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .chat-send-btn:hover:not(:disabled) {
      transform: scale(1.08);
      box-shadow: 0 0 14px rgba(229, 193, 120, 0.6);
    }

    .chat-send-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .chat-footer-note {
      text-align: center;
      font-size: 9px;
      color: #99847A;
      margin-top: 8px;
      letter-spacing: 0.03em;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes pulseGlow {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.3); opacity: 1; }
    }
  `]
})
export class AiChatDrawerComponent implements OnInit {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  @Output() viewProduct = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef;
  @ViewChild('messageInput') private messageInput?: ElementRef;

  userInput = '';
  loading = false;
  messages: ChatMessage[] = [];

  starterPrompts: string[] = [
    '👑 Find my signature perfume',
    '🪵 Long-lasting Oud for evening parties',
    '🌹 Best daily floral (Rose or Jasmine)',
    '☀️ Fresh citrus & aquatic for summer',
    '🎁 Luxury gift set under ₹3,500'
  ];

  constructor(
    private aiChatService: AiChatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initial royal greeting in Indian English
    this.messages.push({
      role: 'model',
      content: 'Welcome to House of Zauq & Shauq. I am Nadir, your personal perfume consultant. Please let me know what fragrance notes, occasion (office wear, weddings, festive dinners, daily wear), or budget you have in mind, and I will recommend the best flacons from our collection.',
      timestamp: new Date()
    });
  }

  toggleOpen(): void {
    this.open = !this.open;
    if (this.open) {
      setTimeout(() => this.focusInput(), 200);
    }
  }

  closeDrawer(): void {
    this.open = false;
    this.close.emit();
  }

  selectPrompt(promptText: string): void {
    this.userInput = promptText;
    this.sendMessage();
  }

  sendMessage(): void {
    const text = this.userInput.trim();
    if (!text || this.loading) return;

    // Add user message to thread immediately
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    this.messages.push(userMsg);
    this.userInput = '';
    this.loading = true;
    this.cdr.detectChanges();
    this.scrollToBottom();

    // Call backend AI service
    this.aiChatService.sendMessage(text, this.messages).subscribe({
      next: (res: ChatResponse) => {
        this.loading = false;
        this.messages.push({
          role: 'model',
          content: res.reply,
          timestamp: new Date(),
          recommendedProducts: res.recommendedProducts || []
        });
        this.aiChatService.cacheResponse(text, res);
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: (err) => {
        this.loading = false;
        console.error('AI Concierge error:', err);
        this.messages.push({
          role: 'model',
          content: 'I apologize, dear patron. A brief connection delay occurred. Please ask again, and I will be delighted to assist you.',
          timestamp: new Date()
        });
        this.cdr.detectChanges();
        this.scrollToBottom();
      }
    });
  }

  resetConversation(): void {
    this.messages = [
      {
        role: 'model',
        content: 'Our consultation has been reset. What fragrance notes, occasion, or budget may I assist you with, dear patron?',
        timestamp: new Date()
      }
    ];
  }

  onViewProduct(prod: Product): void {
    this.viewProduct.emit(prod);
  }

  onAddToCart(prod: Product): void {
    this.addToCart.emit(prod);
  }

  formatMessage(content: string): string {
    if (!content) return '';

    // Normalize broken currency
    let formatted = content.replace(/(?:[\uFFFD?]+1?|Rs\.?\s*|INR\s*)(\d[\d,]*)/gi, '₹$1');

    // Replace [Product: Name] with bold golden title
    formatted = formatted.replace(/\[Product:\s*([^\]]+)\]/gi, '<strong>$1</strong>');

    // Parse simple Markdown bold (**text**)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Parse Markdown italic (*text*)
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Bullet points
    formatted = formatted.replace(/\n\s*•\s*/g, '<br>&nbsp;&nbsp;• ');
    formatted = formatted.replace(/\n\s*✦\s*/g, '<br><br>✦ ');
    formatted = formatted.replace(/\n\n/g, '<br><br>');
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  private focusInput(): void {
    if (this.messageInput) {
      this.messageInput.nativeElement.focus();
    }
  }
}
