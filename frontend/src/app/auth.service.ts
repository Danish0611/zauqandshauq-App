import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, OrderReceipt, UserProfile } from './product.model';
import { environment } from '../environments/environment';

const API = `${environment.apiUrl}/auth`;
const TOKEN_KEY = 'zs-jwt-token-v1';
const USER_KEY = 'zs-user-profile-v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<UserProfile | null>(this.loadStoredUser());
  readonly user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  get currentUser(): UserProfile | null {
    return this.userSubject.value;
  }

  get token(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  get isLoggedIn(): boolean {
    return !!this.token && !!this.currentUser;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  get authHeaders(): HttpHeaders {
    const t = this.token;
    return t ? new HttpHeaders({ Authorization: `Bearer ${t}` }) : new HttpHeaders();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/login`, { email, password }).pipe(
      tap(res => this.saveSession(res))
    );
  }

  register(name: string, email: string, password: string, phone: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/register`, { name, email, password, phone }).pipe(
      tap(res => this.saveSession(res))
    );
  }

  fetchMe(): Observable<{ user: UserProfile; orders: OrderReceipt[] }> {
    return this.http.get<{ user: UserProfile; orders: OrderReceipt[] }>(`${API}/me`, {
      headers: this.authHeaders
    }).pipe(
      tap(res => {
        this.userSubject.next(res.user);
        this.persistUser(res.user);
      })
    );
  }

  updateProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${API}/profile`, profile, {
      headers: this.authHeaders
    }).pipe(
      tap(user => {
        this.userSubject.next(user);
        this.persistUser(user);
      })
    );
  }

  logout(): void {
    this.userSubject.next(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
  }

  private saveSession(res: AuthResponse): void {
    this.userSubject.next(res.user);
    try {
      localStorage.setItem(TOKEN_KEY, res.token);
      this.persistUser(res.user);
    } catch {}
  }

  private persistUser(user: UserProfile): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
  }

  private loadStoredUser(): UserProfile | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  }
}

