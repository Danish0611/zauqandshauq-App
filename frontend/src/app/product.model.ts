export interface Product {
  id: number;
  productCode: string;
  name: string;
  brand: string;
  category: string;
  concentration: string;
  size: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  description: string;
  ingredients?: string;
  notes: string[];
  notesText?: string;
  image: string;
  badge: string;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  stockQuantity?: number;
  active?: boolean;
}

export interface CsvUploadResponse {
  success: boolean;
  message: string;
  totalRows: number;
  insertedCount: number;
  updatedCount: number;
  errors: string[];
}

export interface CartItem { product: Product; quantity: number; }
export interface CheckoutLine { productId: number; quantity: number; }
export interface CheckoutRequest {
  name: string; email: string; phone: string; address: string; city: string; state: string; postalCode: string;
  couponCode: string; items: CheckoutLine[];
}
export interface PaymentOrder { gateway: 'DEMO' | 'RAZORPAY'; keyId?: string; orderId: string; amount: number; currency: string; }
export interface OrderReceipt {
  orderNumber: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  items: Array<{ productId: number; name: string; quantity: number; unitPrice: number; lineTotal: number }>;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN';
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface AdminStats {
  totalProducts: number;
  lowStockProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalSubscribers: number;
  totalUsers: number;
}

export interface NewsletterSubscriberItem {
  id: number;
  email: string;
  subscribedAt: string;
  active: boolean;
}

export interface EmailLogItem {
  recipient: string;
  subject: string;
  deliveryMode: string;
  timestamp: string;
}
