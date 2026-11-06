import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, timeout } from 'rxjs';
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

const LOCAL_PRODUCTS: Product[] = [
  {id:1,productCode:'ZS-OUD-01',name:'Noir Oud',brand:'Z&S Atelier',category:'For Him',concentration:'Extrait de Parfum',size:'100 ml',price:3499,originalPrice:4299,rating:4.8,reviews:126,description:'A deep, smoky oud softened with warm amber and polished woods. Confident, considered, unforgettable.',ingredients:'Alcohol Denat., Parfum (Natural Essential Oils), Coumarin, Linalool.',notes:['Oud','Amber','Cedarwood'],image:'/assets/products/noir-oud.svg',badge:'BESTSELLER',featured:true,bestseller:true,newArrival:false,stockQuantity:95},
  {id:2,productCode:'ZS-ROSE-02',name:'Rose Éclat',brand:'Maison Aurore',category:'For Her',concentration:'Eau de Parfum',size:'75 ml',price:2899,originalPrice:3499,rating:4.7,reviews:94,description:'Velvety rose petals meet ripe pear and a soft, skin-like musk.',ingredients:'Alcohol Denat., Parfum (Fragrance), Citronellol, Geraniol.',notes:['Rose','Pear','White Musk'],image:'/assets/products/rose-eclat.svg',badge:'NEW ARRIVAL',featured:true,bestseller:false,newArrival:true,stockQuantity:80},
  {id:3,productCode:'ZS-CITRUS-03',name:'Citrus Drift',brand:'Verde Parfums',category:'Unisex',concentration:'Eau de Toilette',size:'100 ml',price:2199,originalPrice:2699,rating:4.6,reviews:81,description:'A bright, refreshing blend for sunlit mornings and easy evenings.',ingredients:'Alcohol Denat., Parfum (Fragrance), Limonene, Linalool.',notes:['Bergamot','Neroli','Vetiver'],image:'/assets/products/citrus-drift.svg',badge:'FRESH PICK',featured:true,bestseller:false,newArrival:false,stockQuantity:110},
  {id:4,productCode:'ZS-AMBER-04',name:'Velvet Amber',brand:'Z&S Atelier',category:'Unisex',concentration:'Extrait de Parfum',size:'50 ml',price:3999,originalPrice:4699,rating:4.9,reviews:57,description:'Rich amber and smooth vanilla wrapped in a long, sensual trail.',ingredients:'Alcohol Denat., Parfum (Fragrance), Vanillin, Coumarin.',notes:['Amber','Vanilla','Sandalwood'],image:'/assets/products/velvet-amber.svg',badge:'THE ARTISAN EDIT',featured:true,bestseller:true,newArrival:true,stockQuantity:50},
  {id:7,productCode:'ZS-SAFF-07',name:'Saffron Smoke',brand:'Oud & Earth',category:'Unisex',concentration:'Extrait de Parfum',size:'50 ml',price:4499,originalPrice:5299,rating:4.8,reviews:41,description:'Golden saffron and incense create a warm, expressive signature.',ingredients:'Alcohol Denat., Parfum (Fragrance), Eugenol, Cinnamal.',notes:['Saffron','Incense','Leather'],image:'/assets/products/saffron-smoke.svg',badge:'LIMITED EDITION',featured:false,bestseller:false,newArrival:true,stockQuantity:40}
];

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private apiUrl = `${environment.apiUrl}/chat`;
  private responseCache = new Map<string, ChatResponse>();

  constructor(private http: HttpClient) {}

  sendMessage(message: string, history: ChatMessage[]): Observable<ChatResponse> {
    const trimmed = (message || '').trim().toLowerCase();
    
    // Check instant cache
    if (this.responseCache.has(trimmed)) {
      const cached = this.responseCache.get(trimmed)!;
      return of(cached);
    }

    const payload = {
      message,
      history: history.map(h => ({
        role: h.role,
        content: h.content
      }))
    };

    return this.http.post<ChatResponse>(this.apiUrl, payload).pipe(
      timeout(4500),
      catchError((err) => {
        console.warn('Backend chat service unreachable or slow. Providing instant artisanal sommelier response.', err);
        const fallback = this.getInstantClientFallback(message);
        return of(fallback);
      })
    );
  }

  cacheResponse(query: string, response: ChatResponse): void {
    if (query && response) {
      this.responseCache.set(query.trim().toLowerCase(), response);
    }
  }

  private getInstantClientFallback(userQuery: string): ChatResponse {
    const query = (userQuery || '').toLowerCase();
    let matchedProducts: Product[] = [];

    if (query.includes('oud') || query.includes('noir') || query.includes('smok') || query.includes('wood') || query.includes('him') || query.includes('men')) {
      matchedProducts = [LOCAL_PRODUCTS[0]]; // Noir Oud
    } else if (query.includes('rose') || query.includes('floral') || query.includes('her') || query.includes('women') || query.includes('sweet')) {
      matchedProducts = [LOCAL_PRODUCTS[1]]; // Rose Éclat
    } else if (query.includes('amber') || query.includes('vanilla') || query.includes('velvet') || query.includes('party') || query.includes('warm')) {
      matchedProducts = [LOCAL_PRODUCTS[3]]; // Velvet Amber
    } else if (query.includes('saffron') || query.includes('incense') || query.includes('leather') || query.includes('royal')) {
      matchedProducts = [LOCAL_PRODUCTS[4]]; // Saffron Smoke
    } else if (query.includes('fresh') || query.includes('citrus') || query.includes('summer') || query.includes('daily') || query.includes('day')) {
      matchedProducts = [LOCAL_PRODUCTS[2]]; // Citrus Drift
    } else {
      matchedProducts = [LOCAL_PRODUCTS[0], LOCAL_PRODUCTS[1]];
    }

    const leadProduct = matchedProducts[0];
    const replyText = `A warm welcome to House of Zauq & Shauq. As Nadir, your personal master perfumer, I have selected the ideal flacon for your preference:\n\n` +
      `✦ **[Product: ${leadProduct.name}]** (${leadProduct.category}) — *₹${leadProduct.price}*\n` +
      `  • **Olfactory Notes**: ${leadProduct.notes.join(' · ')}\n` +
      `  • **Character**: ${leadProduct.description}\n\n` +
      `Crafted with 100% pure botanical extraits to calm the senses and leave an unforgettable aura. Would you like to inspect its notes or discover matching layering flacons?`;

    return {
      reply: replyText,
      recommendedProducts: matchedProducts,
      modelUsed: 'gemini-sommelier-instant',
      fallbackUsed: true
    };
  }

  checkHealth(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/health`).pipe(
      timeout(5000),
      catchError(() => of({ status: 'OFFLINE_FALLBACK', service: 'Zauq & Shauq Local AI Sommelier' }))
    );
  }
}
