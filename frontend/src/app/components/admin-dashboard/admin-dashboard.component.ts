import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../admin.service';
import { ProductService } from '../../product.service';
import {
  AdminStats,
  CsvUploadResponse,
  EmailLogItem,
  NewsletterSubscriberItem,
  OrderReceipt,
  Product
} from '../../product.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="modal-backdrop" *ngIf="open" (click)="close.emit()" role="presentation">
      <section class="checkout-modal" style="width: min(1160px, 100%); max-height: calc(100dvh - 40px); padding: 32px;" role="dialog" aria-modal="true" aria-label="Admin Dashboard" (click)="$event.stopPropagation()">
        <button type="button" class="close-button checkout-close" (click)="close.emit()" aria-label="Close admin dashboard">×</button>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; border-bottom: 1px solid #e4e0d2; padding-bottom: 18px; margin-bottom: 22px;">
          <div>
            <div class="eyebrow"><span class="eyebrow-line"></span> BACK-OFFICE &amp; POSTGRESQL MANAGEMENT</div>
            <h2 style="font-family: 'Playfair Display', serif; font-weight: 400; font-size: 34px; margin: 8px 0 0;">
              Z&amp;S Atelier <em>Admin Portal</em>
            </h2>
          </div>
          <div class="category-pills">
            <button type="button" [class.active]="tab === 'orders'" (click)="tab = 'orders'">Orders ({{ orders.length }})</button>
            <button type="button" [class.active]="tab === 'products'" (click)="tab = 'products'">Fragrances &amp; Stock ({{ products.length }})</button>
            <button type="button" [class.active]="tab === 'csv'" (click)="tab = 'csv'">CSV Bulk Sync</button>
            <button type="button" [class.active]="tab === 'subscribers'" (click)="tab = 'subscribers'">Subscribers &amp; Emails</button>
            <button type="button" [class.active]="tab === 'payments'" (click)="tab = 'payments'; loadPaymentSettings()">Payment &amp; UPI (Live)</button>
          </div>
        </div>

        <div *ngIf="stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 24px;">
          <div style="padding: 16px; background: #202a1c; color: #f7f4eb;">
            <span style="font-size: 8px; letter-spacing: 1.5px; color: #c4a15d;">TOTAL REVENUE</span>
            <strong style="display: block; font-family: 'Playfair Display', serif; font-size: 24px; margin-top: 6px;">{{ stats.totalRevenue | currency:'INR':'symbol':'1.0-0' }}</strong>
          </div>
          <div style="padding: 16px; background: #f0ede2; border: 1px solid #ded9ca;">
            <span style="font-size: 8px; letter-spacing: 1.5px; color: #747a68;">RECORDED ORDERS</span>
            <strong style="display: block; font-family: 'Playfair Display', serif; font-size: 24px; margin-top: 6px;">{{ stats.totalOrders }}</strong>
          </div>
          <div style="padding: 16px; background: #f0ede2; border: 1px solid #ded9ca;">
            <span style="font-size: 8px; letter-spacing: 1.5px; color: #747a68;">CATALOG ITEMS</span>
            <strong style="display: block; font-family: 'Playfair Display', serif; font-size: 24px; margin-top: 6px;">{{ stats.totalProducts }} <small style="font-size: 10px; color: #914c3e;" *ngIf="stats.lowStockProducts">({{ stats.lowStockProducts }} low stock)</small></strong>
          </div>
          <div style="padding: 16px; background: #f0ede2; border: 1px solid #ded9ca;">
            <span style="font-size: 8px; letter-spacing: 1.5px; color: #747a68;">SUBSCRIBERS / USERS</span>
            <strong style="display: block; font-family: 'Playfair Display', serif; font-size: 24px; margin-top: 6px;">{{ stats.totalSubscribers }} / {{ stats.totalUsers }}</strong>
          </div>
        </div>

        <div class="checkout-error" *ngIf="errorMessage" style="margin-bottom: 16px;">{{ errorMessage }}</div>

        <!-- ORDERS TAB -->
        <div *ngIf="tab === 'orders'">
          <div *ngIf="!orders.length" style="text-align: center; padding: 40px; background: #f4f0e3;">
            <p style="font-size: 11px; color: #707666;">No orders recorded in PostgreSQL yet.</p>
          </div>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div *ngFor="let ord of orders" style="padding: 18px; border: 1px solid #ded7c2; background: #f4f0e3;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 10px;">
                <div>
                  <strong style="font-family: 'Playfair Display', serif; font-size: 19px;">{{ ord.orderNumber }}</strong>
                  <span style="font-size: 10px; color: #626b56; margin-left: 10px;">{{ ord.name }} · {{ ord.email }} <ng-container *ngIf="ord.phone">· {{ ord.phone }}</ng-container></span>
                  <small style="display: block; font-size: 9px; color: #838575; margin-top: 3px;">
                    {{ ord.createdAt | date:'medium' }} · {{ ord.paymentMethod }}
                    <ng-container *ngIf="ord.address"> · Ship to: {{ ord.address }}, {{ ord.city }} {{ ord.postalCode }}</ng-container>
                  </small>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <select [ngModel]="ord.status" (ngModelChange)="changeOrderStatus(ord.orderNumber, $event)"
                          style="padding: 7px 10px; border: 1px solid #b59a58; background: #fffdf7; font-size: 10px; color: #202a1c;">
                    <option value="DEMO_ORDER_RECORDED">DEMO_ORDER_RECORDED</option>
                    <option value="PAID">PAID</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                  <strong style="font-family: 'Playfair Display', serif; font-size: 18px;">{{ ord.total | currency:'INR':'symbol':'1.0-0' }}</strong>
                </div>
              </div>
              <div style="border-top: 1px solid #ded7c7; padding-top: 8px; display: flex; gap: 16px; flex-wrap: wrap; font-size: 10px; color: #424b36;">
                <span *ngFor="let item of ord.items">{{ item.name }} × {{ item.quantity }} ({{ item.lineTotal | currency:'INR':'symbol':'1.0-0' }})</span>
              </div>
            </div>
          </div>
        </div>

        <!-- PRODUCTS & INVENTORY TAB -->
        <div *ngIf="tab === 'products'">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <strong style="font-size: 12px;">PostgreSQL Fragrance Catalog</strong>
            <button type="button" class="button button-gold" (click)="startNewProduct()">+ Add New Fragrance</button>
          </div>

          <form *ngIf="editingProduct" class="checkout-form" style="padding: 20px; background: #f0ede2; border: 1px solid #c5b47d; margin-bottom: 22px;" (ngSubmit)="saveProduct()">
            <h3 style="margin-bottom: 14px;">{{ editingProduct.id ? 'Edit Fragrance: ' + editingProduct.name : 'Create New Fragrance' }}</h3>
            <div class="form-row">
              <label>Unique Product Code (SKU)
                <input type="text" name="pCode" [(ngModel)]="editingProduct.productCode" required placeholder="e.g. ZS-OUD-15">
              </label>
              <label>Fragrance Name
                <input type="text" name="pName" [(ngModel)]="editingProduct.name" required placeholder="Fragrance name">
              </label>
            </div>
            <div class="form-row">
              <label>Brand / Atelier
                <input type="text" name="pBrand" [(ngModel)]="editingProduct.brand" required placeholder="Z&S Atelier">
              </label>
              <label>Category
                <input type="text" name="pCat" [(ngModel)]="editingProduct.category" required placeholder="For Him / For Her / Unisex">
              </label>
            </div>
            <div class="form-row">
              <label>Concentration
                <input type="text" name="pConc" [(ngModel)]="editingProduct.concentration" placeholder="Eau de Parfum">
              </label>
              <label>Bottle Size
                <input type="text" name="pSize" [(ngModel)]="editingProduct.size" placeholder="100 ml">
              </label>
            </div>
            <div class="form-row">
              <label>Selling Price (INR)
                <input type="number" name="pPrice" [(ngModel)]="editingProduct.price" required>
              </label>
              <label>Original MRP (INR)
                <input type="number" name="pOrigPrice" [(ngModel)]="editingProduct.originalPrice">
              </label>
            </div>
            <div class="form-row">
              <label>Stock Quantity
                <input type="number" name="pStock" [(ngModel)]="editingProduct.stockQuantity" required>
              </label>
              <label>Badge / Tag
                <input type="text" name="pBadge" [(ngModel)]="editingProduct.badge" placeholder="BESTSELLER / NEW ARRIVAL">
              </label>
            </div>
            <label>Scent Notes (comma separated)
              <input type="text" name="pNotes" [(ngModel)]="editingNotesInput" placeholder="Oud, Amber, Cedarwood">
            </label>
            <label>Perfume Ingredients
              <input type="text" name="pIngr" [(ngModel)]="editingProduct.ingredients" placeholder="Alcohol Denat., Parfum (Fragrance), Aqua...">
            </label>
            <label>Description
              <input type="text" name="pDesc" [(ngModel)]="editingProduct.description" placeholder="Olfactory description">
            </label>
            <label>Image Path
              <input type="text" name="pImg" [(ngModel)]="editingProduct.image" placeholder="/assets/products/noir-oud.svg">
            </label>
            <div style="display: flex; gap: 18px; margin: 10px 0 16px; font-size: 10px;">
              <label style="flex-direction: row; align-items: center;"><input type="checkbox" name="pFeat" [(ngModel)]="editingProduct.featured" style="width: auto;"> Featured</label>
              <label style="flex-direction: row; align-items: center;"><input type="checkbox" name="pBest" [(ngModel)]="editingProduct.bestseller" style="width: auto;"> Bestseller</label>
              <label style="flex-direction: row; align-items: center;"><input type="checkbox" name="pNew" [(ngModel)]="editingProduct.newArrival" style="width: auto;"> New Arrival</label>
            </div>
            <div style="display: flex; gap: 10px;">
              <button type="submit" class="button button-dark">Save to PostgreSQL <span>→</span></button>
              <button type="button" class="button" style="background: #ded9ca;" (click)="editingProduct = null">Cancel</button>
            </div>
          </form>

          <div style="display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto;">
            <div *ngFor="let p of products" style="display: grid; grid-template-columns: 46px 1.3fr 1fr 0.8fr auto; gap: 12px; align-items: center; padding: 10px 14px; background: #f4f0e3; border: 1px solid #e4e0d2; font-size: 10px;">
              <img [src]="p.image" [alt]="p.name" style="width: 42px; height: 48px; object-fit: cover; background: #dedbce;">
              <div>
                <strong style="font-size: 12px; display: block;">{{ p.name }}</strong>
                <span style="color: #747a68; font-size: 9px;">{{ p.productCode }} · {{ p.brand }} · {{ p.category }}</span>
              </div>
              <div>
                <span>{{ p.size }} · {{ p.concentration }}</span>
                <small style="display: block; color: #747a68;">{{ p.notes.join(', ') }}</small>
              </div>
              <div>
                <strong>{{ p.price | currency:'INR':'symbol':'1.0-0' }}</strong>
                <span style="display: block; font-size: 9px;" [style.color]="(p.stockQuantity || 0) <= 20 ? '#914c3e' : '#3c7049'">
                  Stock: {{ p.stockQuantity ?? 100 }}
                </span>
              </div>
              <div style="display: flex; gap: 8px;">
                <button type="button" class="text-link" style="font-size: 10px; text-decoration: underline;" (click)="editProduct(p)">Edit</button>
                <button type="button" class="text-link" style="font-size: 10px; color: #914c3e; text-decoration: underline;" (click)="removeProduct(p)">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <!-- CSV BULK SYNC TAB -->
        <div *ngIf="tab === 'csv'">
          <p style="font-size: 11px; color: #707666; line-height: 1.8; margin-bottom: 18px;">
            Download the production CSV template, populate fragrance rows with unique <code>product_code</code>, <code>name</code>, <code>category</code>, <code>price</code>, <code>size</code>, <code>ingredients</code>, and <code>notes</code>, then upload below or via Postman.
          </p>
          <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 22px;">
            <a class="button button-gold" [href]="productService.templateDownloadUrl" download="perfumes_template.csv">Download CSV Template <span>↓</span></a>
            <a class="button button-dark" [href]="productService.exportCsvUrl" download="zauq_and_shauq_products.csv">Export Live DB CSV <span>↗</span></a>
          </div>
          <div style="border: 1px dashed #c5b47d; background: #f3f0e3; padding: 20px;">
            <strong style="display: block; font-size: 11px; margin-bottom: 8px; color: #303827;">Upload Production CSV File</strong>
            <input type="file" accept=".csv,text/csv" (change)="onCsvUpload($event)" style="font-size: 10px;">
            <p style="font-size: 9px; color: #838576; margin: 10px 0 0;">
              Postman URL: <code>POST {{ productService.apiBase }}/products/csv/upload</code> (form-data key: <code>file</code>)
            </p>
          </div>
          <div *ngIf="csvResult" style="margin-top: 16px; padding: 14px; background: #e8efe5; border: 1px solid #b8ccb0; font-size: 10px; color: #2d4728;">
            <strong>{{ csvResult.message }}</strong>
            <div style="margin-top: 6px;">Total Rows: {{ csvResult.totalRows }} · Inserted: {{ csvResult.insertedCount }} · Updated: {{ csvResult.updatedCount }}</div>
          </div>
        </div>

        <!-- SUBSCRIBERS & EMAILS TAB -->
        <div *ngIf="tab === 'subscribers'" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <h3 style="font-family: 'Playfair Display', serif; font-weight: 400; font-size: 20px; margin: 0 0 12px;">Newsletter Subscribers ({{ subscribers.length }})</h3>
            <div style="max-height: 320px; overflow-y: auto; border: 1px solid #e4e0d2; background: #f4f0e3; padding: 12px;">
              <div *ngIf="!subscribers.length" style="font-size: 10px; color: #747a68;">No subscribers yet.</div>
              <div *ngFor="let sub of subscribers" style="display: flex; justify-content: space-between; font-size: 10px; padding: 6px 0; border-bottom: 1px solid #e4e0d2;">
                <strong>{{ sub.email }}</strong>
                <span style="color: #747a68;">{{ sub.subscribedAt | date:'shortDate' }}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 style="font-family: 'Playfair Display', serif; font-weight: 400; font-size: 20px; margin: 0 0 12px;">Transactional Email Logs ({{ emailLogs.length }})</h3>
            <div style="max-height: 320px; overflow-y: auto; border: 1px solid #e4e0d2; background: #f4f0e3; padding: 12px;">
              <div *ngIf="!emailLogs.length" style="font-size: 10px; color: #747a68;">No emails dispatched in this session yet.</div>
              <div *ngFor="let log of emailLogs" style="font-size: 10px; padding: 6px 0; border-bottom: 1px solid #e4e0d2;">
                <div style="display: flex; justify-content: space-between;">
                  <strong>{{ log.recipient }}</strong>
                  <span style="font-size: 8px; color: #3c7049;">{{ log.deliveryMode }}</span>
                </div>
                <div style="color: #626b56; margin-top: 2px;">{{ log.subject }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- PAYMENT GATEWAY & UPI TAB -->
        <div *ngIf="tab === 'payments'">
          <div style="background: #202a1c; color: #f7f4eb; padding: 20px; margin-bottom: 22px; border-radius: 4px;">
            <div class="eyebrow eyebrow-emerald"><span class="eyebrow-line"></span> PAYMENT RAILS STATUS</div>
            <div style="display: flex; gap: 24px; align-items: center; margin-top: 8px; flex-wrap: wrap;">
              <div>
                <span style="font-size: 9px; color: #b4baab;">Razorpay Gateway:</span>
                <strong style="display: block; font-size: 15px;" [style.color]="paymentConfig.enabled ? '#65d694' : '#e5c178'">
                  {{ paymentConfig.enabled ? '● LIVE ACTIVE (Key Configured)' : '○ DEMO SANDBOX (No Key Set)' }}
                </strong>
              </div>
              <div style="border-left: 1px solid rgba(255,255,255,0.15); padding-left: 20px;">
                <span style="font-size: 9px; color: #b4baab;">Direct Boutique UPI:</span>
                <strong style="display: block; font-size: 15px; color: #65d694;">
                  ● ACTIVE (VPA: {{ paymentConfig.upiVpa || 'zauqandshauq@icici' }})
                </strong>
              </div>
            </div>
          </div>

          <form class="checkout-form" (submit)="$event.preventDefault(); savePaymentSettings()" style="padding: 24px; background: #f4f0e3; border: 1px solid #ded7c2;">
            <h3 style="font-family: 'Playfair Display', serif; font-size: 20px; margin-bottom: 8px; color: #202a1c;">
              Configure Razorpay &amp; Boutique UPI Credentials
            </h3>
            <p style="font-size: 11px; color: #626b56; line-height: 1.6; margin-bottom: 20px;">
              Enter your Razorpay Test or Live Key ID and Secret below to activate cards, netbanking, and online checkout. Boutique UPI accepts instant customer QR and mobile payments.
            </p>

            <div class="form-row">
              <label style="color: #202a1c !important;">Razorpay Key ID
                <input type="text" name="rKeyId" [(ngModel)]="paymentForm.keyId" placeholder="rzp_test_... or rzp_live_..." style="background: #fff; color: #111 !important; border: 1px solid #bba;">
              </label>
              <label style="color: #202a1c !important;">Razorpay Key Secret
                <input type="password" name="rKeySecret" [(ngModel)]="paymentForm.keySecret" placeholder="••••••••••••" style="background: #fff; color: #111 !important; border: 1px solid #bba;">
              </label>
            </div>

            <div class="form-row">
              <label style="color: #202a1c !important;">Boutique UPI ID (VPA)
                <input type="text" name="rUpiVpa" [(ngModel)]="paymentForm.upiVpa" placeholder="e.g. zauqandshauq@icici" style="background: #fff; color: #111 !important; border: 1px solid #bba;">
              </label>
              <label style="color: #202a1c !important;">UPI Payee / Business Name
                <input type="text" name="rUpiName" [(ngModel)]="paymentForm.upiPayeeName" placeholder="Zauq & Shauq Haute Parfumerie" style="background: #fff; color: #111 !important; border: 1px solid #bba;">
              </label>
            </div>

            <label style="color: #202a1c !important;">Razorpay Webhook Secret (Optional)
              <input type="password" name="rWebhook" [(ngModel)]="paymentForm.webhookSecret" placeholder="Optional webhook secret" style="background: #fff; color: #111 !important; border: 1px solid #bba;">
            </label>

            <div style="display: flex; gap: 12px; align-items: center; margin-top: 18px;">
              <button type="submit" class="button button-dark" [disabled]="paymentSaving">
                {{ paymentSaving ? 'Saving Settings…' : 'Save Payment Configuration →' }}
              </button>
              <span *ngIf="paymentSavedNotice" style="font-size: 11px; color: #2d6b38; font-weight: 600;">
                ✓ Payment settings updated successfully!
              </span>
            </div>
          </form>
        </div>
      </section>
    </div>
  `
})
export class AdminDashboardComponent implements OnChanges {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  @Output() catalogChanged = new EventEmitter<void>();

  tab: 'orders' | 'products' | 'csv' | 'subscribers' | 'payments' = 'orders';
  stats: AdminStats | null = null;
  orders: OrderReceipt[] = [];
  products: Product[] = [];
  subscribers: NewsletterSubscriberItem[] = [];
  emailLogs: EmailLogItem[] = [];
  errorMessage = '';

  paymentConfig = { gateway: 'RAZORPAY', enabled: true, keyId: 'rzp_test_TrnvmqpEGpgwfa', upiVpa: 'zauqandshauq@icici', upiPayeeName: 'Zauq & Shauq Haute Parfumerie' };
  paymentForm = { keyId: 'rzp_test_TrnvmqpEGpgwfa', keySecret: 'Du3jki4aIKD08SxBI4PB3sIu', webhookSecret: '', upiVpa: 'zauqandshauq@icici', upiPayeeName: 'Zauq & Shauq Haute Parfumerie' };
  paymentSaving = false;
  paymentSavedNotice = false;

  editingProduct: Partial<Product> | null = null;
  editingNotesInput = '';
  csvResult: CsvUploadResponse | null = null;

  constructor(private adminService: AdminService, public productService: ProductService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.loadAll();
    }
  }

  loadAll(): void {
    this.errorMessage = '';
    this.adminService.getStats().subscribe({
      next: s => (this.stats = s),
      error: err => (this.errorMessage = err?.error?.message || 'Admin access required. Sign in with admin@zauqandshauq.in / admin123.')
    });
    this.adminService.getOrders().subscribe({ next: o => (this.orders = o), error: () => {} });
    this.adminService.getProducts().subscribe({ next: p => (this.products = p), error: () => {} });
    this.adminService.getSubscribers().subscribe({ next: s => (this.subscribers = s), error: () => {} });
    this.adminService.getEmailLogs().subscribe({ next: e => (this.emailLogs = e), error: () => {} });
    this.loadPaymentSettings();
  }

  changeOrderStatus(orderNumber: string, status: string): void {
    this.adminService.updateOrderStatus(orderNumber, status).subscribe({
      next: updated => {
        const idx = this.orders.findIndex(o => o.orderNumber === orderNumber);
        if (idx >= 0) this.orders[idx] = updated;
        this.loadAll();
      },
      error: err => (this.errorMessage = err?.error?.message || 'Failed to update order status.')
    });
  }

  startNewProduct(): void {
    this.editingProduct = {
      productCode: 'ZS-NEW-' + Math.floor(100 + Math.random() * 900),
      name: '',
      brand: 'Z&S Atelier',
      category: 'Unisex',
      concentration: 'Eau de Parfum',
      size: '100 ml',
      price: 2999,
      originalPrice: 3599,
      rating: 4.8,
      reviews: 1,
      stockQuantity: 50,
      badge: 'NEW ARRIVAL',
      description: '',
      ingredients: 'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Linalool, Limonene.',
      image: '/assets/products/noir-oud.svg',
      featured: false,
      bestseller: false,
      newArrival: true,
      active: true
    };
    this.editingNotesInput = 'Oud, Amber, Sandalwood';
  }

  editProduct(p: Product): void {
    this.editingProduct = { ...p };
    this.editingNotesInput = (p.notes || []).join(', ');
  }

  saveProduct(): void {
    if (!this.editingProduct) return;
    const payload: Partial<Product> = {
      ...this.editingProduct,
      notesText: this.editingNotesInput,
      notes: this.editingNotesInput.split(',').map(s => s.trim()).filter(Boolean)
    };

    const req$ = payload.id
      ? this.adminService.updateProduct(payload.id, payload)
      : this.adminService.createProduct(payload);

    req$.subscribe({
      next: () => {
        this.editingProduct = null;
        this.loadAll();
        this.catalogChanged.emit();
      },
      error: err => (this.errorMessage = err?.error?.message || 'Could not save product.')
    });
  }

  removeProduct(p: Product): void {
    this.adminService.deleteProduct(p.id).subscribe({
      next: () => {
        this.loadAll();
        this.catalogChanged.emit();
      },
      error: err => (this.errorMessage = err?.error?.message || 'Could not delete product.')
    });
  }

  onCsvUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    const file = input.files[0];
    this.productService.uploadCsv(file).subscribe({
      next: res => {
        this.csvResult = res;
        this.loadAll();
        this.catalogChanged.emit();
        input.value = '';
      },
      error: err => {
        this.errorMessage = err?.error?.message || 'CSV upload failed.';
        input.value = '';
      }
    });
  }

  loadPaymentSettings(): void {
    this.adminService.getPaymentConfig().subscribe({
      next: cfg => {
        if (cfg) {
          this.paymentConfig = cfg;
          this.paymentForm.keyId = cfg.keyId || '';
          this.paymentForm.upiVpa = cfg.upiVpa || 'zauqandshauq@icici';
          this.paymentForm.upiPayeeName = cfg.upiPayeeName || 'Zauq & Shauq Haute Parfumerie';
        }
      },
      error: () => {}
    });
  }

  savePaymentSettings(): void {
    this.paymentSaving = true;
    this.paymentSavedNotice = false;
    this.adminService.updatePaymentConfig({
      keyId: this.paymentForm.keyId,
      keySecret: this.paymentForm.keySecret,
      webhookSecret: this.paymentForm.webhookSecret,
      upiVpa: this.paymentForm.upiVpa,
      upiPayeeName: this.paymentForm.upiPayeeName
    }).subscribe({
      next: updated => {
        this.paymentSaving = false;
        this.paymentSavedNotice = true;
        this.paymentConfig = updated;
        setTimeout(() => (this.paymentSavedNotice = false), 4000);
      },
      error: err => {
        this.paymentSaving = false;
        this.errorMessage = err?.error?.message || 'Failed to update payment settings.';
      }
    });
  }
}

