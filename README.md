# Zauq & Shauq — Luxury Fragrance Storefront

A full-stack first draft for the **Zauq & Shauq** perfume shop. The project is built with Angular + TypeScript on the frontend and Java Spring Boot on the backend. It uses a dark olive, ivory, black and antique-gold palette, fictional test products, and original local SVG bottle illustrations.

> **First-draft notice:** the product catalogue, reviews, newsletter subscriptions and orders are sample data held in memory. Demo checkout never charges money. Razorpay is included as a test-mode integration path; it is not enabled until your own Razorpay test credentials are provided. Do not launch this build for production without persistence, authentication/authorization, security hardening, policies and operational checks.

## Features

- Responsive luxury storefront with sticky navigation, custom wordmark, premium hero, olive/ivory/gold theme, category cards, brand story, scent ritual, sample reviews, newsletter and detailed footer.
- 12 fictional perfume products with distinct local SVG product artwork, brand, category, fragrance concentration, volume, notes, ratings, labels and original/current prices.
- Search across product name, brand, category, description and notes; category filters; featured, price, rating and A–Z sorting.
- Product detail quick-view, wishlist (browser local storage), cart drawer, quantity controls, persistent cart, subtotal, free-delivery threshold, coupon `ZAUQ10` (10% demo discount), checkout form and order confirmation.
- Spring Boot REST API for products, categories, health, order quote/order record, newsletter signup and Razorpay payment-order creation/payment-signature verification.
- Backend validation and pricing calculation. The client sends product IDs and quantities; the API gets prices from the sample catalogue rather than trusting client prices.
- Accessible labels, responsive/mobile layouts, reduced-motion support, highlighted custom scrollbar, toast feedback and keyboard Escape to dismiss dialogs.

## Technology

- Angular 21, TypeScript, Angular Forms and HttpClient
- Java 17+, Spring Boot 3.5.7, Spring MVC, Jakarta Validation
- Razorpay Java SDK 1.4.10 for optional checkout/order creation and signature verification
- No database required for this first draft

## Run locally on Windows

Install **Node.js 22 LTS** (includes npm), **Java JDK 17 or newer**, and **Apache Maven 3.9+**. Restart VS Code/PowerShell after installing Node so `node`, `npm`, `java` and `mvn` are available in `PATH`.

### 1. Start Spring Boot

Open PowerShell in `zauqandshauq/backend`:

```powershell
mvn spring-boot:run
```

The API listens on `http://localhost:8080`. By default, payment keys are absent and checkout runs in demo mode.

### 2. Start Angular

Open another PowerShell terminal in `zauqandshauq/frontend`:

```powershell
npm install
npm start
```

Open `http://localhost:4200` in Chrome/Edge. The storefront will use the REST API when it can reach it and falls back to sample catalogue data if the API is offline. Checkout/newsletter submission need the backend running.

### 3. Verify the API

- `http://localhost:8080/api/health`
- `http://localhost:8080/api/products`
- `http://localhost:8080/api/products?category=Unisex`
- `http://localhost:8080/api/products?q=oud`
- `http://localhost:8080/api/categories`
- `http://localhost:8080/api/payments/config`

## Razorpay sandbox setup

1. Create/sign into your Razorpay merchant account and switch to **Test Mode**.
2. Generate test API keys in the Razorpay Dashboard. Keep the `key_secret` on the backend only.
3. Stop the backend process. In the same PowerShell terminal, set environment variables (replace the placeholders with your test credentials):

```powershell
$env:RAZORPAY_KEY_ID = "rzp_test_your_key_id"
$env:RAZORPAY_KEY_SECRET = "your_test_key_secret"
mvn spring-boot:run
```

4. Refresh the storefront and place a test order. The backend creates a Razorpay order, and the frontend opens Razorpay Checkout. The server verifies the payment signature before returning a `PAID` order receipt.
5. Confirm `http://localhost:8080/api/payments/config` reports `"enabled": true` and `"gateway": "RAZORPAY"`.

If the keys are not set, the API reports `"gateway": "DEMO"`; checkout records a demo order with status `DEMO_ORDER_RECORDED`, shows a clear no-charge disclaimer and does not open a real payment flow. Never put `RAZORPAY_KEY_SECRET` in Angular files or commit it to Git. Only use Razorpay's official test credentials for testing. Before production, add webhook handling, durable order/payment state, idempotency, server-side payment-state reconciliation and proper customer authentication.

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Backend health check |
| GET | `/api/products` | Catalogue; optional `category`, `q`, `sort` filters |
| GET | `/api/categories` | Available categories |
| GET | `/api/payments/config` | Says whether Razorpay is configured (does not return the secret) |
| POST | `/api/payments/razorpay/order` | Validate cart and create a server-priced payment order, or return demo mode |
| POST | `/api/payments/razorpay/verify` | Validate Razorpay signature and record a paid order |
| POST | `/api/orders/demo` | Record a no-charge demo order |
| GET | `/api/orders/{orderNumber}` | Fetch an order saved in the current backend process |
| POST | `/api/newsletter/subscribe` | Validate and record a demo email subscription |

Checkout JSON example (the frontend sends this shape):

```json
{
  "name": "Demo Customer",
  "email": "customer@example.com",
  "phone": "9876543210",
  "address": "12 Sample Road",
  "city": "Jaipur",
  "state": "Rajasthan",
  "postalCode": "302001",
  "couponCode": "ZAUQ10",
  "items": [{ "productId": 1, "quantity": 1 }]
}
```

## Project structure

```text
zauqandshauq/
├── frontend/
│   ├── public/assets/       # logo, favicon, hero art, 12 local product illustrations
│   └── src/app/             # storefront component, models, API/fallback data service
└── backend/
    ├── pom.xml
    └── src/main/java/com/zauqandshauq/
        ├── controller/      # catalogue, order, payment and newsletter endpoints
        ├── dto/             # validated checkout request models
        ├── model/           # product and order receipt records
        └── service/         # sample catalogue and server-side pricing/order logic
```

## First-draft limitations

- Orders, pending payment attempts and newsletter signups are stored in memory and are lost when the backend restarts.
- Demo mode intentionally does not charge a card or issue a real payment. A working Razorpay test checkout requires your own test key ID and secret.
- Reviews, stock availability, discounts and original prices are illustrative sample data, not live commerce data.
- Login/registration, admin product management, database integration, shipment tracking, transactional email, refund workflows, tax invoices, privacy/terms policy, production logging and deployment config are not included yet.
- Product images are original vector mockups; replace with licensed product photography in the next draft.

## Build

From `frontend`: `npm install` then `npm run build`.
From `backend`: `mvn test` or `mvn package`.
