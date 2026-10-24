import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { AdminStats, EmailLogItem, NewsletterSubscriberItem, OrderReceipt, Product } from './product.model';
import { environment } from '../environments/environment';

const API = `${environment.apiUrl}/admin`;

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${API}/stats`, { headers: this.auth.authHeaders });
  }

  getOrders(): Observable<OrderReceipt[]> {
    return this.http.get<OrderReceipt[]>(`${API}/orders`, { headers: this.auth.authHeaders });
  }

  updateOrderStatus(orderNumber: string, status: string): Observable<OrderReceipt> {
    return this.http.patch<OrderReceipt>(
      `${API}/orders/${encodeURIComponent(orderNumber)}/status`,
      { status },
      { headers: this.auth.authHeaders }
    );
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API}/products`, { headers: this.auth.authHeaders });
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${API}/products`, product, { headers: this.auth.authHeaders });
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${API}/products/${id}`, product, { headers: this.auth.authHeaders });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/products/${id}`, { headers: this.auth.authHeaders });
  }

  getSubscribers(): Observable<NewsletterSubscriberItem[]> {
    return this.http.get<NewsletterSubscriberItem[]>(`${API}/subscribers`, { headers: this.auth.authHeaders });
  }

  getEmailLogs(): Observable<EmailLogItem[]> {
    return this.http.get<EmailLogItem[]>(`${API}/emails`, { headers: this.auth.authHeaders });
  }

  getPaymentConfig(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/payments/config`);
  }

  updatePaymentConfig(config: Record<string, string>): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/payments/config`, config, { headers: this.auth.authHeaders });
  }
}

