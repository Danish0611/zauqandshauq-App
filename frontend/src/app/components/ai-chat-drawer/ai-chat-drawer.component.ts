import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
            <p class="concierge-subtitle">Haute Parfumerie Master · Grounded in Live Vault</p>
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
        <span>“خوشبو وہ خاموش زبان ہے جو دل سے دل تک بات کرتی ہے”</span>
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
                      <small class="mini-conc">{{ prod.concentration || 'Eau de Parfum' }}</small>
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

        <!-- Typing Indicator -->
        <div class="chat-bubble-row model-row typing-row" *ngIf="loading">
          <div class="bubble-avatar">
            <span>Z&amp;S</span>
          </div>
          <div class="chat-bubble model-bubble typing-bubble">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-label">Nadir is distilling an olfactory response...</span>
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
            placeholder="Ask Nadir about notes, ouds, layering, or gifts..."
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
          <span>Official House Concierge · Formulated with Google Gemini 2.5/3.8 Flash</span>
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
      padding: 10px 18px 10px 14px;
      border-radius: 999px;
      background: linear-gradient(135deg, rgba(14, 32, 26, 0.96) 0%, rgba(6, 18, 14, 0.98) 100%);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(229, 193, 120, 0.45);
      color: #fffbf5;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5), 0 0 20px rgba(196, 161, 93, 0.2);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .ai-concierge-launcher:hover {
      transform: translateY(-3px) scale(1.03);
      border-color: #e5c178;
      box-shadow: 0 16px 44px rgba(0, 0, 0, 0.6), 0 0 28px rgba(229, 193, 120, 0.35);
    }

    .launcher-pulse {
      position: absolute;
      top: 6px;
      left: 6px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #8ed0b5;
      box-shadow: 0 0 10px #8ed0b5;
      animation: pulseGlow 2s infinite;
    }

    .launcher-icon {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(229, 193, 120, 0.15);
      border: 1px solid rgba(229, 193, 120, 0.35);
      display: grid;
      place-items: center;
      color: #e5c178;
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
      color: #fffbf5;
      letter-spacing: 0.02em;
    }

    .launcher-sub {
      font-size: 10px;
      color: #d8bfa7;
      letter-spacing: 0.03em;
    }

    /* Backdrop */
    .ai-chat-backdrop {
      position: fixed;
      inset: 0;
      z-index: 2500;
      background: rgba(3, 8, 6, 0.7);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      animation: fadeIn 0.25s ease;
    }

    /* Drawer / Window Container */
    .ai-chat-drawer {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: min(520px, 100%);
      z-index: 2600;
      background: linear-gradient(165deg, rgba(14, 28, 23, 0.98) 0%, rgba(6, 14, 11, 0.99) 100%);
      backdrop-filter: blur(36px) saturate(200%);
      -webkit-backdrop-filter: blur(36px) saturate(200%);
      border-left: 1px solid rgba(229, 193, 120, 0.3);
      box-shadow: -20px 0 60px rgba(0, 0, 0, 0.75);
      display: flex;
      flex-direction: column;
      transform: translateX(105%);
      transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
      box-sizing: border-box;
      color: #f7f2ea;
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
      border-bottom: 1px solid rgba(229, 193, 120, 0.2);
      background: rgba(9, 21, 17, 0.6);
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
      background: rgba(229, 193, 120, 0.15);
      border: 1px solid rgba(229, 193, 120, 0.4);
      display: grid;
      place-items: center;
      font-size: 20px;
      color: #e5c178;
      box-shadow: 0 0 14px rgba(229, 193, 120, 0.25);
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
      font-family: var(--font-display, 'Cormorant Garamond', Georgia, serif);
      font-size: 19px;
      font-weight: 600;
      color: #fffbf5;
      letter-spacing: -0.2px;
    }

    .live-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #8ed0b5;
      box-shadow: 0 0 8px #8ed0b5;
    }

    .concierge-subtitle {
      margin: 0;
      font-size: 10px;
      color: #d8bfa7;
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
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #d8bfa7;
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .header-action-btn:hover {
      background: rgba(229, 193, 120, 0.2);
      color: #e5c178;
      border-color: #e5c178;
    }

    .chat-close-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(14, 28, 24, 0.9);
      border: 1px solid rgba(229, 193, 120, 0.4);
      color: #fffdf7;
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
    }

    .chat-close-btn:hover {
      background: rgba(229, 193, 120, 0.25);
      color: #e5c178;
      transform: rotate(90deg) scale(1.08);
      border-color: #e5c178;
    }

    /* Philosophy Strip */
    .chat-philosophy-strip {
      padding: 7px 18px;
      background: rgba(229, 193, 120, 0.08);
      border-bottom: 1px solid rgba(229, 193, 120, 0.15);
      text-align: center;
      font-size: 11px;
      color: #e5c178;
      letter-spacing: 0.05em;
      flex-shrink: 0;
    }

    /* Starter Pills */
    .chat-starter-pills {
      padding: 12px 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      background: rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex-shrink: 0;
    }

    .starter-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #d8bfa7;
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
      padding: 6px 12px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(229, 193, 120, 0.3);
      color: #f7f2ea;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .starter-pill:hover {
      background: rgba(229, 193, 120, 0.18);
      border-color: #e5c178;
      color: #e5c178;
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
      background: radial-gradient(circle at 80% 20%, rgba(9, 61, 53, 0.15) 0%, transparent 60%);
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
      background: rgba(229, 193, 120, 0.2);
      border: 1px solid rgba(229, 193, 120, 0.45);
      display: grid;
      place-items: center;
      font-size: 10px;
      font-weight: 700;
      color: #e5c178;
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
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 12.5px;
      line-height: 1.6;
      word-break: break-word;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.3);
    }

    .user-bubble {
      background: linear-gradient(135deg, #0d5e50 0%, #09473d 100%);
      color: #fffbf5;
      border: 1px solid rgba(142, 208, 181, 0.35);
      border-bottom-right-radius: 4px;
    }

    .model-bubble {
      background: rgba(18, 36, 29, 0.85);
      color: #f7f2ea;
      border: 1px solid rgba(229, 193, 120, 0.25);
      border-bottom-left-radius: 4px;
    }

    .bubble-text p {
      margin: 0 0 8px;
    }

    .bubble-text p:last-child {
      margin-bottom: 0;
    }

    .bubble-text strong {
      color: #e5c178;
      font-weight: 600;
    }

    .bubble-text em {
      color: #d8bfa7;
    }

    .bubble-time {
      font-size: 9px;
      color: rgba(247, 242, 234, 0.45);
      margin-top: 4px;
      padding: 0 4px;
    }

    /* Recommended Product Mini Cards Deck */
    .recommended-products-deck {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
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
      gap: 10px;
      overflow-x: auto;
      padding: 4px 2px 8px;
      scrollbar-width: thin;
      scrollbar-color: #c4a15d rgba(0,0,0,0.2);
    }

    .product-mini-card {
      min-width: 220px;
      max-width: 240px;
      border-radius: 14px;
      background: rgba(8, 20, 16, 0.95);
      border: 1px solid rgba(229, 193, 120, 0.35);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      transition: all 0.25s ease;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    }

    .product-mini-card:hover {
      transform: translateY(-2px);
      border-color: #e5c178;
      box-shadow: 0 10px 24px rgba(229, 193, 120, 0.2);
    }

    .mini-img-wrap {
      position: relative;
      width: 100%;
      height: 110px;
      background: radial-gradient(circle at 50% 50%, rgba(9, 61, 53, 0.5) 0%, rgba(4, 18, 15, 0.9) 100%);
      display: grid;
      place-items: center;
      cursor: pointer;
    }

    .mini-img-wrap img {
      width: 80px;
      height: 80px;
      object-fit: contain;
      filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.6));
      transition: transform 0.3s ease;
    }

    .mini-img-wrap:hover img {
      transform: scale(1.08);
    }

    .mini-badge {
      position: absolute;
      top: 6px;
      left: 6px;
      background: #c89d54;
      color: #060b09;
      font-size: 7.5px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 999px;
      letter-spacing: 0.05em;
    }

    .mini-info {
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .mini-cat {
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #d8bfa7;
    }

    .mini-name {
      font-family: var(--font-display, 'Cormorant Garamond', Georgia, serif);
      font-size: 15px;
      color: #fffbf5;
      cursor: pointer;
      line-height: 1.2;
    }

    .mini-name:hover {
      color: #e5c178;
    }

    .mini-price-row {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-top: 2px;
    }

    .mini-price {
      font-size: 13px;
      font-weight: 600;
      color: #e5c178;
    }

    .mini-conc {
      font-size: 9px;
      color: rgba(247, 242, 234, 0.5);
    }

    .mini-notes-row {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 4px;
    }

    .mini-note-chip {
      font-size: 8px;
      padding: 1px 5px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
      color: #d8bfa7;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .mini-actions {
      display: flex;
      gap: 6px;
      margin-top: 8px;
    }

    .btn-mini-view {
      flex: 1;
      padding: 6px 0;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(229, 193, 120, 0.3);
      color: #f7f2ea;
      font-size: 10px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-mini-view:hover {
      background: rgba(229, 193, 120, 0.2);
      border-color: #e5c178;
      color: #e5c178;
    }

    .btn-mini-add {
      flex: 1;
      padding: 6px 0;
      border-radius: 8px;
      background: linear-gradient(135deg, #09473d 0%, #0d5e50 100%);
      border: 1px solid #14806e;
      color: #fffbf5;
      font-size: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-mini-add:hover {
      background: linear-gradient(135deg, #0d5e50 0%, #117866 100%);
      box-shadow: 0 4px 12px rgba(9, 61, 53, 0.5);
    }

    /* Typing Animation */
    .typing-row {
      align-items: center;
    }

    .typing-bubble {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 14px;
    }

    .typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #e5c178;
      animation: typingBounce 1.4s infinite ease-in-out;
    }

    .typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    .typing-label {
      margin-left: 6px;
      font-size: 10.5px;
      color: #d8bfa7;
      font-style: italic;
    }

    /* Chat Footer / Input Form */
    .chat-footer {
      padding: 14px 18px 18px;
      border-top: 1px solid rgba(229, 193, 120, 0.2);
      background: rgba(7, 16, 13, 0.95);
      flex-shrink: 0;
    }

    .chat-form {
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
    }

    .chat-input {
      flex: 1;
      min-width: 0;
      height: 44px;
      padding: 0 16px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(229, 193, 120, 0.3);
      color: #ffffff;
      font-size: 12.5px;
      outline: none;
      transition: all 0.2s ease;
    }

    .chat-input:focus {
      background: rgba(255, 255, 255, 0.1);
      border-color: #e5c178;
      box-shadow: 0 0 14px rgba(229, 193, 120, 0.2);
    }

    .chat-input::placeholder {
      color: rgba(247, 242, 234, 0.4);
    }

    .chat-send-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #c89d54 0%, #aa8643 100%);
      border: 1px solid #e5c178;
      color: #060b09;
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .chat-send-btn:hover:not(:disabled) {
      transform: scale(1.06);
      box-shadow: 0 0 16px rgba(229, 193, 120, 0.4);
    }

    .chat-send-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .chat-footer-note {
      text-align: center;
      margin-top: 8px;
      font-size: 9px;
      color: rgba(247, 242, 234, 0.4);
      letter-spacing: 0.04em;
    }

    /* Keyframes */
    @keyframes pulseGlow {
      0%, 100% {
        transform: scale(1);
        opacity: 0.9;
      }
      50% {
        transform: scale(1.4);
        opacity: 0.4;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes typingBounce {
      0%, 80%, 100% {
        transform: scale(0.6);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }

    /* Mobile Responsive */
    @media (max-width: 600px) {
      .ai-concierge-launcher {
        bottom: 16px;
        right: 16px;
        padding: 8px 14px 8px 10px;
      }
      .ai-chat-drawer {
        width: 100%;
        max-width: 100%;
        border-left: none;
      }
      .chat-header {
        padding: 14px 16px;
      }
      .chat-messages-container {
        padding: 14px 12px;
      }
      .product-mini-card {
        min-width: 200px;
      }
      .chat-footer {
        padding: 10px 14px 14px;
      }
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
    '👑 Find my signature scent',
    '🪵 Intense Oud for evening wear',
    '🌹 Romantic Rose or Jasmine flacon',
    '✨ How to layer perfumes?',
    '🎁 Luxury gift under ₹3,500'
  ];

  constructor(private aiChatService: AiChatService) {}

  ngOnInit(): void {
    // Initial royal greeting
    this.messages.push({
      role: 'model',
      content: 'Salam and warm welcome to House Zauq & Shauq. I am Nadir, your private Master Perfumer. Tell me what mood, occasion, or notes you seek, and I shall compose your signature flacon from our living vault.',
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

    // Add user message to thread
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    this.messages.push(userMsg);
    this.userInput = '';
    this.loading = true;
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
        this.scrollToBottom();
      },
      error: (err) => {
        this.loading = false;
        console.error('AI Concierge error:', err);
        this.messages.push({
          role: 'model',
          content: 'I apologize, noble patron. A brief tremor in our communications has occurred. Let me assure you, our vault remains full of exquisite creations. Please ask again in a moment.',
          timestamp: new Date()
        });
        this.scrollToBottom();
      }
    });
  }

  resetConversation(): void {
    this.messages = [
      {
        role: 'model',
        content: 'Our olfactory journey has been reset. What fragrance essence or occasion may I curate for you next, esteemed patron?',
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

    // Remove [Product: Name] tags from raw text to avoid cluttered text, replacing with bold name
    let formatted = content.replace(/\[Product:\s*([^\]]+)\]/gi, '<strong>$1</strong>');

    // Parse simple Markdown bold (**text**)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Parse Markdown italic (*text*)
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert bullet points
    formatted = formatted.replace(/^\s*[-•]\s*(.+)$/gm, '• $1<br/>');

    // Convert line breaks to <p> or <br>
    const paragraphs = formatted.split(/\n\n+/);
    return paragraphs.map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('');
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
