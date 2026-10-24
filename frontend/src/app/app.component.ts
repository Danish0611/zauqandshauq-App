import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { Product, CartItem, CheckoutRequest, PaymentOrder, OrderReceipt, CsvUploadResponse, UserProfile } from './product.model';
import { ProductService } from './product.service';
import { AuthService } from './auth.service';
import { HeroComponent } from './components/hero/hero.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ProductDetailModalComponent } from './components/product-detail-modal/product-detail-modal.component';
import { CartDrawerComponent } from './components/cart-drawer/cart-drawer.component';
import { OrderLookupModalComponent } from './components/order-lookup-modal/order-lookup-modal.component';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ScentExperienceComponent } from './components/scent-experience/scent-experience.component';
import { ScentQuizComponent } from './components/scent-quiz/scent-quiz.component';
import { DiscoverySetComponent } from './components/discovery-set/discovery-set.component';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: (response: { error?: { description?: string } }) => void) => void;
    };
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    HeroComponent,
    ProductCardComponent,
    ProductDetailModalComponent,
    CartDrawerComponent,
    OrderLookupModalComponent,
    AuthModalComponent,
    AdminDashboardComponent,
    ScentExperienceComponent,
    ScentQuizComponent,
    DiscoverySetComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  currentView: 'home' | 'shop' | 'quiz' | 'discovery' | 'philosophy' = 'home';
  allProducts: Product[] = [];
  products: Product[] = [];
  categories = ['All Fragrances', 'For Him', 'For Her', 'Unisex'];
  activeCategory = 'All Fragrances';
  searchTerm = '';
  sortBy = 'featured';
  loadingProducts = false;

  cart: CartItem[] = [];
  wishlist = new Set<number>();
  cartOpen = false;
  mobileMenuOpen = false;
  showTop = false;
  showWishlistOnly = false;
  activeProduct: Product | null = null;
  checkoutOpen = false;
  submitting = false;
  orderError = '';
  orderReceipt: OrderReceipt | null = null;
  toast = '';
  newsletterEmail = '';
  newsletterMessage = '';
  newsletterBusy = false;
  couponInput = '';
  appliedCoupon = '';

  // Modals & Portals
  csvModalOpen = false;
  csvUploading = false;
  csvResult: CsvUploadResponse | null = null;
  csvError = '';
  orderLookupOpen = false;
  authModalOpen = false;
  adminDashboardOpen = false;

  private toastTimer?: ReturnType<typeof setTimeout>;
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  checkout = { name: '', email: '', phone: '', address: '', city: '', state: 'Rajasthan', postalCode: '', couponCode: '' };
  selectedPaymentMethod: 'RAZORPAY' | 'UPI' | 'COD' | 'DEMO' = 'RAZORPAY';
  upiUtr = '';
  upiVpa = 'zauqandshauq@icici';
  upiPayeeName = 'Zauq & Shauq Haute Parfumerie';
  paymentConfig: { gateway: string; enabled: boolean; keyId: string; upiVpa: string; upiPayeeName: string } = {
    gateway: 'RAZORPAY',
    enabled: true,
    keyId: 'rzp_test_TrnvmqpEGpgwfa',
    upiVpa: 'zauqandshauq@icici',
    upiPayeeName: 'Zauq & Shauq Haute Parfumerie'
  };
  fieldErrors: Record<string, string> = {};
  orderLookupQuery = '';

  readonly reviews = [
    { initials: 'AM', name: 'Aarav M.', title: 'A scent that feels personal', body: 'Noir Oud has the depth I was looking for. It opens beautifully and settles into a warm, polished scent that lasts through the evening.', product: 'Noir Oud' },
    { initials: 'SR', name: 'Sana R.', title: 'Beautifully considered', body: 'Rose Éclat feels soft without being too sweet. The packaging and the whole experience feel thoughtful and genuinely premium.', product: 'Rose Éclat' },
    { initials: 'KV', name: 'Kabir V.', title: 'My everyday signature', body: 'Citrus Drift is fresh, clean and easy to wear. I keep reaching for it before work and on weekends.', product: 'Citrus Drift' }
  ];

  constructor(
    public productService: ProductService,
    public authService: AuthService,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadInitialCatalog();
    this.loadProducts();
    this.loadPaymentConfig();

    this.searchSub = this.searchSubject.pipe(
      debounceTime(280),
      distinctUntilChanged()
    ).subscribe(() => {
      this.showWishlistOnly = false;
      this.loadProducts();
    });

    this.prefillFromUser(this.authService.currentUser);

    this.route.data.subscribe(data => {
      if (data['view'] === 'admin') this.openAdminPortal();
      else if (data['view'] === 'orders') this.orderLookupOpen = true;
      else if (data['view'] === 'account') this.authModalOpen = true;
      else if (data['view'] && ['home', 'shop', 'quiz', 'discovery', 'philosophy'].includes(data['view'])) {
        this.currentView = data['view'];
      }
    });

    try {
      const saved = localStorage.getItem('zs-cart-v1');
      if (saved) this.cart = JSON.parse(saved) as CartItem[];
      const liked = localStorage.getItem('zs-wishlist-v1');
      if (liked) this.wishlist = new Set<number>(JSON.parse(liked) as number[]);
    } catch { /* Ignore invalid local browser data and start with an empty bag. */ }
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  onUserAuthenticated(user: UserProfile): void {
    this.prefillFromUser(user);
    this.notify(`Signed in as ${user.name}`);
  }

  prefillFromUser(user: UserProfile | null): void {
    if (!user) return;
    if (!this.checkout.name) this.checkout.name = user.name || '';
    if (!this.checkout.email) this.checkout.email = user.email || '';
    if (!this.checkout.phone) this.checkout.phone = user.phone || '';
    if (!this.checkout.address) this.checkout.address = user.address || '';
    if (!this.checkout.city) this.checkout.city = user.city || '';
    if (user.state) this.checkout.state = user.state;
    if (!this.checkout.postalCode) this.checkout.postalCode = user.postalCode || '';
  }

  openAdminPortal(): void {
    if (!this.authService.isLoggedIn || !this.authService.isAdmin) {
      this.authModalOpen = true;
      this.notify('Please sign in with an Admin account to access the Admin Portal');
      return;
    }
    this.adminDashboardOpen = true;
  }

  onAdminCatalogChanged(): void {
    this.loadInitialCatalog();
    this.loadProducts();
    this.notify('Catalog updated in PostgreSQL');
  }

  loadInitialCatalog(): void {
    this.productService.getProducts().subscribe(items => {
      this.allProducts = items;
    });
    this.productService.getCategories().subscribe(items => {
      this.categories = items;
    });
  }

  loadProducts(): void {
    this.loadingProducts = true;
    this.productService.getProducts({
      category: this.activeCategory,
      q: this.searchTerm,
      sort: this.sortBy
    }).subscribe({
      next: items => {
        this.products = items;
        this.loadingProducts = false;
      },
      error: () => {
        this.loadingProducts = false;
      }
    });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm);
  }

  get filteredProducts(): Product[] {
    if (this.showWishlistOnly) {
      return this.allProducts.filter(p => this.wishlist.has(p.id));
    }
    return this.products;
  }

  get featuredProducts(): Product[] {
    const source = this.allProducts.length ? this.allProducts : this.products;
    return source.filter(p => p.featured).slice(0, 4);
  }

  get newArrivals(): Product[] {
    const source = this.allProducts.length ? this.allProducts : this.products;
    return source.filter(p => p.newArrival).slice(0, 4);
  }

  get cartCount(): number { return this.cart.reduce((sum, item) => sum + item.quantity, 0); }
  get cartSubtotal(): number { return this.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0); }
  get freeShippingRemaining(): number { return Math.max(0, 2499 - this.cartSubtotal); }
  get shippingEstimate(): number { return this.cartSubtotal === 0 || this.cartSubtotal >= 2499 ? 0 : 99; }
  get discountEstimate(): number {
    const code = (this.appliedCoupon || '').trim().toUpperCase();
    if (code === 'ZAUQ10') return Math.round(this.cartSubtotal * 0.10);
    if (code === 'ROYAL20') return Math.round(this.cartSubtotal * 0.20);
    if (code === 'DISCOVER999') return Math.min(this.cartSubtotal, 999);
    if (code === 'WELCOME500') return this.cartSubtotal >= 2000 ? 500 : 0;
    return 0;
  }
  get checkoutTotal(): number {
    const sub = this.cartSubtotal;
    const disc = this.discountEstimate;
    const ship = this.shippingEstimate;
    return sub > 0 ? Math.max(0, sub - disc) + ship : 0;
  }

  setView(view: 'home' | 'shop' | 'quiz' | 'discovery' | 'philosophy'): void {
    this.currentView = view;
    this.mobileMenuOpen = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetOrderAndClose(): void {
    this.checkoutOpen = false;
    this.orderReceipt = null;
    this.cart = [];
    this.persistCart();
    this.setView('home');
  }

  selectCategory(category: string): void {
    this.activeCategory = category;
    this.showWishlistOnly = false;
    this.mobileMenuOpen = false;
    this.currentView = 'shop';
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onCategoryPillClick(category: string): void {
    this.activeCategory = category;
    this.showWishlistOnly = false;
    this.loadProducts();
  }

  filterByNote(note: string): void {
    this.activeCategory = 'All Fragrances';
    this.searchTerm = note;
    this.showWishlistOnly = false;
    this.currentView = 'shop';
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.notify(`Showing compositions featuring ${note}`);
  }

  onSortChange(): void {
    this.loadProducts();
  }

  searchProducts(): void {
    this.showWishlistOnly = false;
    this.currentView = 'shop';
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFilters(): void {
    this.activeCategory = 'All Fragrances';
    this.searchTerm = '';
    this.showWishlistOnly = false;
    this.sortBy = 'featured';
    this.loadProducts();
  }

  showWishlist(): void {
    this.showWishlistOnly = !this.showWishlistOnly;
    this.activeCategory = 'All Fragrances';
    this.mobileMenuOpen = false;
    this.scrollTo('collection');
  }

  addToCart(product: Product): void {
    const existing = this.cart.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= 10) {
        this.notify('For this first draft, a maximum of 10 per fragrance is available.');
        return;
      }
      existing.quantity++;
    } else {
      this.cart.push({ product, quantity: 1 });
    }
    this.persistCart();
    this.cartOpen = true;
    this.notify(`${product.name} added to your bag`);
  }

  onBuyNow(event: { product: Product; quantity: number }): void {
    const existing = this.cart.find(entry => entry.product.id === event.product.id);
    if (existing) {
      existing.quantity += event.quantity;
    } else {
      this.cart.push({ product: event.product, quantity: event.quantity });
    }
    this.persistCart();
    this.cartOpen = false;
    this.openCheckout();
  }

  changeQuantity(item: CartItem, delta: number): void {
    if (delta > 0 && item.quantity >= 10) {
      this.notify('For this first draft, a maximum of 10 per fragrance is available.');
      return;
    }
    item.quantity += delta;
    if (item.quantity <= 0) this.removeFromCart(item);
    else this.persistCart();
  }

  removeFromCart(item: CartItem): void {
    this.cart = this.cart.filter(entry => entry !== item);
    this.persistCart();
  }

  toggleWishlist(product: Product): void {
    if (this.wishlist.has(product.id)) this.wishlist.delete(product.id);
    else this.wishlist.add(product.id);
    this.persistWishlist();
    this.notify(this.wishlist.has(product.id) ? 'Saved to your wishlist' : 'Removed from wishlist');
  }

  isWishlisted(product: Product): boolean {
    return this.wishlist.has(product.id);
  }

  openProduct(product: Product): void {
    this.activeProduct = product;
  }

  closeProduct(): void {
    this.activeProduct = null;
  }

  openCsvModal(): void {
    this.csvModalOpen = true;
    this.csvResult = null;
    this.csvError = '';
  }

  closeCsvModal(): void {
    if (!this.csvUploading) {
      this.csvModalOpen = false;
    }
  }

  onCsvSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    const file = input.files[0];
    this.csvUploading = true;
    this.csvError = '';
    this.csvResult = null;

    this.productService.uploadCsv(file).subscribe({
      next: res => {
        this.csvUploading = false;
        this.csvResult = res;
        this.loadInitialCatalog();
        this.loadProducts();
        this.notify('Products synced from CSV to PostgreSQL');
        input.value = '';
      },
      error: (err: HttpErrorResponse) => {
        this.csvUploading = false;
        this.csvError = err?.error?.message || err?.message || 'Could not upload CSV. Make sure the backend and PostgreSQL are running.';
        input.value = '';
      }
    });
  }

  openCheckout(): void {
    if (!this.cart.length) {
      this.notify('Your bag is waiting for something lovely');
      return;
    }
    this.loadPaymentConfig();
    this.upiUtr = '';
    this.prefillFromUser(this.authService.currentUser);
    this.cartOpen = false;
    this.checkoutOpen = true;
    this.orderError = '';
    this.orderReceipt = null;
  }

  loadPaymentConfig(): void {
    this.http.get<{ gateway: string; enabled: boolean; keyId: string; upiVpa: string; upiPayeeName: string }>(
      `${this.productService.apiBase}/payments/config`
    ).subscribe({
      next: cfg => {
        if (cfg) {
          this.paymentConfig = cfg;
          if (cfg.upiVpa) this.upiVpa = cfg.upiVpa;
          if (cfg.upiPayeeName) this.upiPayeeName = cfg.upiPayeeName;
        }
      },
      error: () => {}
    });
  }

  get upiPaymentUri(): string {
    const amount = this.checkoutTotal.toFixed(2);
    const note = encodeURIComponent('Zauq and Shauq Luxury Order');
    const name = encodeURIComponent(this.upiPayeeName || 'Zauq and Shauq');
    return `upi://pay?pa=${this.upiVpa}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
  }

  get upiQrCodeUrl(): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(this.upiPaymentUri)}&margin=4`;
  }

  copyUpiId(): void {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(this.upiVpa).then(() => {
        this.notify(`Boutique UPI ID copied: ${this.upiVpa}`);
      }).catch(() => {
        this.notify(`Boutique UPI ID: ${this.upiVpa}`);
      });
    } else {
      this.notify(`Boutique UPI ID: ${this.upiVpa}`);
    }
  }

  closeCheckout(): void {
    if (!this.submitting) this.checkoutOpen = false;
  }

  applyCoupon(): void {
    const code = this.couponInput.trim().toUpperCase();
    if (code === 'ZAUQ10') {
      this.appliedCoupon = code;
      this.checkout.couponCode = code;
      this.notify('ZAUQ10 applied. 10% saved.');
    } else if (code === 'ROYAL20') {
      this.appliedCoupon = code;
      this.checkout.couponCode = code;
      this.notify('ROYAL20 applied. 20% royal discount saved.');
    } else if (code === 'DISCOVER999') {
      this.appliedCoupon = code;
      this.checkout.couponCode = code;
      this.notify('DISCOVER999 applied. ₹999 Discovery Coffret credit applied.');
    } else if (code === 'WELCOME500') {
      if (this.cartSubtotal < 2000) {
        this.notify('WELCOME500 requires a minimum order value of ₹2,000.');
        return;
      }
      this.appliedCoupon = code;
      this.checkout.couponCode = code;
      this.notify('WELCOME500 applied. ₹500 welcome credit saved.');
    } else {
      this.appliedCoupon = '';
      this.checkout.couponCode = '';
      this.notify('That code is not valid. Try ZAUQ10, ROYAL20, or DISCOVER999.');
    }
  }

  quickApplyCoupon(code: string): void {
    this.couponInput = code;
    this.applyCoupon();
  }

  removeCoupon(): void {
    this.appliedCoupon = '';
    this.checkout.couponCode = '';
    this.couponInput = '';
    this.notify('Voucher removed.');
  }

  setPaymentMethod(method: 'RAZORPAY' | 'UPI' | 'COD' | 'DEMO'): void {
    this.selectedPaymentMethod = method;
  }

  validateCheckout(): boolean {
    this.fieldErrors = {};
    if (!this.checkout.name || !this.checkout.name.trim()) {
      this.fieldErrors['name'] = 'Full name is required';
    }
    if (!this.checkout.email || !this.checkout.email.trim()) {
      this.fieldErrors['email'] = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.checkout.email.trim())) {
      this.fieldErrors['email'] = 'Enter a valid email address';
    }
    if (!this.checkout.phone || !this.checkout.phone.trim()) {
      this.fieldErrors['phone'] = 'Contact phone number is required';
    } else if (!/^[0-9+()\s-]{8,18}$/.test(this.checkout.phone.trim())) {
      this.fieldErrors['phone'] = 'Enter a valid phone number (min 8 digits)';
    }
    if (!this.checkout.address || !this.checkout.address.trim()) {
      this.fieldErrors['address'] = 'Street address is required';
    }
    if (!this.checkout.city || !this.checkout.city.trim()) {
      this.fieldErrors['city'] = 'City is required';
    }
    if (!this.checkout.state || !this.checkout.state.trim()) {
      this.fieldErrors['state'] = 'State / Region is required';
    }
    if (!this.checkout.postalCode || !this.checkout.postalCode.trim()) {
      this.fieldErrors['postalCode'] = '6-digit PIN code is required';
    } else if (!/^[0-9]{6}$/.test(this.checkout.postalCode.trim())) {
      this.fieldErrors['postalCode'] = 'Enter a valid 6-digit PIN code';
    }
    return Object.keys(this.fieldErrors).length === 0;
  }

  placeOrder(): void {
    if (this.submitting) return;
    if (!this.cart.length) {
      this.orderError = 'Your bag is empty. Please add a fragrance first.';
      return;
    }
    this.orderError = '';
    if (!this.validateCheckout()) {
      this.orderError = 'Please complete the highlighted delivery details above.';
      return;
    }
    this.submitting = true;

    const request: CheckoutRequest = {
      ...this.checkout,
      name: this.checkout.name.trim(),
      email: this.checkout.email.trim(),
      phone: this.checkout.phone.trim(),
      address: this.checkout.address.trim(),
      city: this.checkout.city.trim(),
      state: this.checkout.state.trim(),
      postalCode: this.checkout.postalCode.trim(),
      couponCode: this.appliedCoupon,
      items: this.cart.map(item => ({ productId: item.product.id, quantity: item.quantity }))
    };

    if (this.selectedPaymentMethod === 'UPI') {
      const cleanUtr = (this.upiUtr || '').trim();
      if (!cleanUtr) {
        this.orderError = 'Please enter the 12-digit UPI Reference / UTR Number after completing your payment.';
        this.submitting = false;
        return;
      }
      if (cleanUtr.length < 8) {
        this.orderError = 'The UPI Reference / UTR Number must be at least 8–12 digits (found on your payment receipt).';
        this.submitting = false;
        return;
      }
      this.http.post<OrderReceipt>(`${this.productService.apiBase}/orders/upi`, {
        checkout: request,
        utrNumber: cleanUtr
      }, {
        headers: this.authService.authHeaders
      }).subscribe({
        next: receipt => {
          this.completeOrder(receipt);
          this.notify('Boutique UPI payment confirmed and registered with atelier!');
        },
        error: error => this.failOrder(error)
      });
      return;
    }

    if (this.selectedPaymentMethod === 'COD') {
      this.http.post<OrderReceipt>(`${this.productService.apiBase}/orders/cod`, request, {
        headers: this.authService.authHeaders
      }).subscribe({
        next: receipt => {
          this.completeOrder(receipt);
          this.notify('Cash on Delivery order confirmed!');
        },
        error: error => this.failOrder(error)
      });
      return;
    }

    if (this.selectedPaymentMethod === 'DEMO') {
      this.http.post<OrderReceipt>(`${this.productService.apiBase}/orders/demo`, request, {
        headers: this.authService.authHeaders
      }).subscribe({
        next: receipt => {
          this.completeOrder(receipt);
          this.notify('Sandbox demo order recorded in PostgreSQL!');
        },
        error: error => this.failOrder(error)
      });
      return;
    }

    // Razorpay Online
    this.http.post<PaymentOrder>(`${this.productService.apiBase}/payments/razorpay/order`, request, {
      headers: this.authService.authHeaders
    }).subscribe({
      next: paymentOrder => {
        if (paymentOrder.gateway === 'DEMO') {
          this.http.post<OrderReceipt>(`${this.productService.apiBase}/orders/demo`, request, {
            headers: this.authService.authHeaders
          }).subscribe({
            next: receipt => {
              this.completeOrder(receipt);
              this.notify('Razorpay credentials unconfigured on backend; order placed in Sandbox Demo Mode.');
            },
            error: error => this.failOrder(error)
          });
        } else {
          this.openRazorpay(paymentOrder, request);
        }
      },
      error: error => this.failOrder(error)
    });
  }

  copyOrderNumber(orderNum: string): void {
    if (!orderNum) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(orderNum).then(() => {
        this.notify(`Order reference ${orderNum} copied!`);
      }).catch(() => {
        this.notify(`Order reference: ${orderNum}`);
      });
    } else {
      this.notify(`Order reference: ${orderNum}`);
    }
  }

  trackThisOrder(orderNum: string): void {
    this.orderLookupQuery = orderNum;
    this.checkoutOpen = false;
    this.orderLookupOpen = true;
  }

  printReceipt(): void {
    window.print();
  }

  private async openRazorpay(paymentOrder: PaymentOrder, request: CheckoutRequest): Promise<void> {
    try {
      await this.ensureRazorpayScript();
      if (!window.Razorpay) throw new Error('Payment checkout could not be loaded. Please try again.');
      const options: Record<string, unknown> = {
        key: paymentOrder.keyId || 'rzp_test_TrnvmqpEGpgwfa',
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'Zauq & Shauq Haute Parfumerie',
        description: 'Luxury Fragrance Order',
        order_id: paymentOrder.orderId,
        image: `${window.location.origin}/assets/logo.svg`,
        prefill: { name: request.name, email: request.email, contact: request.phone },
        notes: { shipping_city: request.city, postal_code: request.postalCode },
        theme: { color: '#c89d54', backdrop_color: '#060b09' },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay with UPI (GPay, PhonePe, Paytm, QR)',
                instruments: [{ method: 'upi' }]
              },
              cards: {
                name: 'Cards & NetBanking',
                instruments: [{ method: 'card' }, { method: 'netbanking' }, { method: 'wallet' }]
              }
            },
            sequence: ['block.upi', 'block.cards'],
            preferences: { show_default_blocks: true }
          }
        },
        handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          this.http.post<OrderReceipt>(`${this.productService.apiBase}/payments/razorpay/verify`, {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          }, {
            headers: this.authService.authHeaders
          }).subscribe({
            next: receipt => this.completeOrder(receipt),
            error: error => this.failOrder(error)
          });
        },
        modal: { ondismiss: () => { this.submitting = false; } }
      };
      const instance = new window.Razorpay(options);
      instance.on('payment.failed', (response: { error?: { description?: string } }) => {
        this.submitting = false;
        this.orderError = response.error?.description || 'Payment was not completed. You can try again.';
      });
      instance.open();
    } catch (error) {
      this.submitting = false;
      this.orderError = error instanceof Error ? error.message : 'Unable to start payment.';
    }
  }

  private ensureRazorpayScript(): Promise<void> {
    if (window.Razorpay) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-razorpay-checkout]');
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Could not load Razorpay.')), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.dataset['razorpayCheckout'] = 'true';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Could not load Razorpay. Check your internet connection.'));
      document.body.appendChild(script);
    });
  }

  private completeOrder(receipt: OrderReceipt): void {
    this.orderReceipt = receipt;
    this.submitting = false;
    this.cart = [];
    this.persistCart();
    this.appliedCoupon = '';
    this.couponInput = '';
    this.checkoutOpen = true;
    this.cartOpen = false;
    this.loadInitialCatalog();
    this.loadProducts();
  }

  private failOrder(error: unknown): void {
    this.submitting = false;
    const httpError = error as HttpErrorResponse;
    this.orderError = httpError?.error?.message || httpError?.error?.detail || httpError?.message || 'We could not place the order. Please try again.';
  }

  subscribeNewsletter(): void {
    const email = this.newsletterEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.newsletterMessage = 'Please enter a valid email address.';
      return;
    }
    this.newsletterBusy = true;
    this.newsletterMessage = '';
    this.http.post<{ message: string }>(`${this.productService.apiBase}/newsletter/subscribe`, { email }).subscribe({
      next: response => {
        this.newsletterMessage = response.message;
        this.newsletterEmail = '';
        this.newsletterBusy = false;
      },
      error: () => {
        this.newsletterMessage = 'The demo API is offline. Please start the backend and try again.';
        this.newsletterBusy = false;
      }
    });
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  @HostListener('window:scroll') onScroll(): void {
    this.showTop = window.scrollY > 420;
  }

  @HostListener('document:keydown.escape') onEscape(): void {
    if (this.activeProduct) this.activeProduct = null;
    else if (this.adminDashboardOpen) this.adminDashboardOpen = false;
    else if (this.authModalOpen) this.authModalOpen = false;
    else if (this.orderLookupOpen) this.orderLookupOpen = false;
    else if (this.csvModalOpen && !this.csvUploading) this.csvModalOpen = false;
    else if (this.checkoutOpen && !this.submitting) this.checkoutOpen = false;
    else if (this.cartOpen) this.cartOpen = false;
  }

  private persistCart(): void {
    try { localStorage.setItem('zs-cart-v1', JSON.stringify(this.cart)); } catch { /* Storage may be unavailable in private browsing. */ }
  }

  private persistWishlist(): void {
    try { localStorage.setItem('zs-wishlist-v1', JSON.stringify([...this.wishlist])); } catch { /* Storage may be unavailable in private browsing. */ }
  }

  private notify(message: string): void {
    this.toast = message;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast = '', 2800);
  }
}
