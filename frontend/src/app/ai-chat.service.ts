import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Product } from './product.model';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp?: Date;
  recommendedProducts?: Product[];
}

export interface ChatResponse {
  reply: string;
  recommendedProducts: Product[];
  modelUsed: string;
  fallbackUsed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private apiUrl = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) {}

  sendMessage(message: string, history: ChatMessage[]): Observable<ChatResponse> {
    const payload = {
      message,
      history: history.map(h => ({
        role: h.role,
        content: h.content
      }))
    };
    return this.http.post<ChatResponse>(this.apiUrl, payload);
  }

  checkHealth(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/health`);
  }
}
