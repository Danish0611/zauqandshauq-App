import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { CsvUploadResponse, Product } from './product.model';
import { environment } from '../environments/environment';

const API = environment.apiUrl;
const SAMPLES: Product[] = [
  {id:1,productCode:'ZS-OUD-01',name:'Noir Oud',brand:'Z&S Atelier',category:'For Him',concentration:'Eau de Parfum',size:'100 ml',price:3499,originalPrice:4299,rating:4.8,reviews:126,description:'A deep, smoky oud softened with warm amber and polished woods. Confident, considered, unforgettable.',ingredients:'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Linalool, Coumarin, Limonene, Evernia Prunastri (Oakmoss) Extract.',notes:['Oud','Amber','Cedarwood'],image:'/assets/products/noir-oud.svg',badge:'BESTSELLER',featured:true,bestseller:true,newArrival:false,stockQuantity:95},
  {id:2,productCode:'ZS-ROSE-02',name:'Rose Éclat',brand:'Maison Aurore',category:'For Her',concentration:'Eau de Parfum',size:'75 ml',price:2899,originalPrice:3499,rating:4.7,reviews:94,description:'Velvety rose petals meet ripe pear and a soft, skin-like musk.',ingredients:'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Citronellol, Geraniol, Hydroxycitronellal, Benzyl Salicylate.',notes:['Rose','Pear','White Musk'],image:'/assets/products/rose-eclat.svg',badge:'NEW ARRIVAL',featured:true,bestseller:false,newArrival:true,stockQuantity:80},
  {id:3,productCode:'ZS-CITRUS-03',name:'Citrus Drift',brand:'Verde Parfums',category:'Unisex',concentration:'Eau de Toilette',size:'100 ml',price:2199,originalPrice:2699,rating:4.6,reviews:81,description:'A bright, refreshing blend for sunlit mornings and easy evenings.',ingredients:'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Citral, Geraniol.',notes:['Bergamot','Neroli','Vetiver'],image:'/assets/products/citrus-drift.svg',badge:'FRESH PICK',featured:true,bestseller:false,newArrival:false,stockQuantity:110},
  {id:4,productCode:'ZS-AMBER-04',name:'Velvet Amber',brand:'Z&S Atelier',category:'Unisex',concentration:'Extrait de Parfum',size:'50 ml',price:3999,originalPrice:4699,rating:4.9,reviews:57,description:'Rich amber and smooth vanilla wrapped in a long, sensual trail.',ingredients:'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Benzyl Benzoate, Vanillin, Coumarin, Farnesol.',notes:['Amber','Vanilla','Sandalwood'],image:'/assets/products/velvet-amber.svg',badge:'THE ARTISAN EDIT',featured:true,bestseller:true,newArrival:true,stockQuantity:50},
  {id:5,productCode:'ZS-AZURE-05',name:'Azure Coast',brand:'North & Neroli',category:'For Him',concentration:'Eau de Parfum',size:'100 ml',price:2599,originalPrice:3199,rating:4.5,reviews:63,description:'Cool marine notes, crisp citrus and clean aromatic woods.',ingredients:'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Benzyl Salicylate, Citral.',notes:['Sea Salt','Lemon','Driftwood'],image:'/assets/products/azure-coast.svg',badge:'',featured:false,bestseller:false,newArrival:false,stockQuantity:75},
  {id:6,productCode:'ZS-JASM-06',name:'Jasmine Veil',brand:'Maison Aurore',category:'For Her',concentration:'Eau de Parfum',size:'75 ml',price:3199,originalPrice:3799,rating:4.7,reviews:72,description:'Luminous jasmine and orange blossom with a creamy, elegant finish.',ingredients:'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Benzyl Salicylate, Linalool, Hydroxycitronellal.',notes:['Jasmine','Orange Blossom','Musk'],image:'/assets/products/jasmine-veil.svg',badge:'POPULAR',featured:false,bestseller:true,newArrival:false,stockQuantity:65},
  {id:7,productCode:'ZS-SAFF-07',name:'Saffron Smoke',brand:'Oud & Earth',category:'Unisex',concentration:'Extrait de Parfum',size:'50 ml',price:4499,originalPrice:5299,rating:4.8,reviews:41,description:'Golden saffron and incense create a warm, expressive signature.',ingredients:'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Eugenol, Cinnamal, Isoeugenol, Linalool.',notes:['Saffron','Incense','Leather'],image:'/assets/products/saffron-smoke.svg',badge:'LIMITED EDITION',featured:false,bestseller:false,newArrival:true,stockQuantity:40},
  {id:8,productCode:'ZS-FIG-08',name:'Green Reverie',brand:'Verde Parfums',category:'Unisex',concentration:'Eau de Parfum',size:'100 ml',price:2399,originalPrice:2999,rating:4.4,reviews:38,description:'Green fig, aromatic herbs and soft woods in a modern everyday scent.',ingredients:'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Linalool, Limonene, Geraniol.',notes:['Fig Leaf','Basil','Cedar'],image:'/assets/products/green-reverie.svg',badge:'',featured:false,bestseller:false,newArrival:false,stockQuantity:70},
  {id:9,productCode:'ZS-MUSK-09',name:'Midnight Musk',brand:'Z&S Atelier',category:'For Him',concentration:'Eau de Parfum',size:'100 ml',price:2999,originalPrice:3599,rating:4.6,reviews:88,description:'Black pepper, intimate musk and dark woods with quiet confidence.',ingredients:'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Coumarin.',notes:['Black Pepper','Musk','Patchouli'],image:'/assets/products/midnight-musk.svg',badge:'BESTSELLER',featured:false,bestseller:true,newArrival:false,stockQuantity:85},
  {id:10,productCode:'ZS-PETAL-10',name:'Petal Dusk',brand:'Maison Aurore',category:'For Her',concentration:'Eau de Parfum',size:'50 ml',price:1999,originalPrice:2499,rating:4.5,reviews:49,description:'Soft florals and juicy plum settle into a delicate powdery base.',ingredients:'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Alpha-Isomethyl Ionone, Benzyl Salicylate.',notes:['Plum','Peony','Cashmere Woods'],image:'/assets/products/petal-dusk.svg',badge:'GIFT FAVOURITE',featured:false,bestseller:false,newArrival:false,stockQuantity:90},
  {id:11,productCode:'ZS-BLOOM-11',name:'Desert Bloom',brand:'Oud & Earth',category:'Unisex',concentration:'Eau de Parfum',size:'100 ml',price:3699,originalPrice:4399,rating:4.7,reviews:34,description:'Desert rose and resinous woods, shaped into a distinctive composition.',ingredients:'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Geraniol, Citronellol, Farnesol.',notes:['Desert Rose','Labdanum','Oud'],image:'/assets/products/desert-bloom.svg',badge:'',featured:false,bestseller:false,newArrival:false,stockQuantity:55},
  {id:12,productCode:'ZS-LINEN-12',name:'White Linen',brand:'North & Neroli',category:'Unisex',concentration:'Eau de Toilette',size:'100 ml',price:1899,originalPrice:2299,rating:4.3,reviews:29,description:'Clean cotton, airy citrus and gentle musk for effortless freshness.',ingredients:'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Linalool, Limonene, Citral.',notes:['Linen Accord','Mandarin','White Musk'],image:'/assets/products/white-linen.svg',badge:'EVERYDAY LUXE',featured:false,bestseller:false,newArrival:false,stockQuantity:120}
];

@Injectable({providedIn:'root'})
export class ProductService {
  constructor(private http: HttpClient) {}

  getProducts(filter?: { category?: string; q?: string; sort?: string }): Observable<Product[]> {
    let params = new HttpParams();
    if (filter?.category && filter.category !== 'All Fragrances') {
      params = params.set('category', filter.category);
    }
    if (filter?.q && filter.q.trim()) {
      params = params.set('q', filter.q.trim());
    }
    if (filter?.sort) {
      params = params.set('sort', filter.sort);
    }

    return this.http.get<Product[]>(`${API}/products`, { params }).pipe(
      catchError(() => {
        // Fallback offline filtering if backend database is unreachable
        let list = [...SAMPLES];
        if (filter?.category && filter.category !== 'All Fragrances') {
          list = list.filter(p => p.category.toLowerCase() === filter.category!.toLowerCase());
        }
        if (filter?.q && filter.q.trim()) {
          const q = filter.q.trim().toLowerCase();
          list = list.filter(p =>
            `${p.productCode} ${p.name} ${p.brand} ${p.category} ${p.description} ${p.ingredients || ''} ${p.notes.join(' ')}`.toLowerCase().includes(q)
          );
        }
        return of(list);
      })
    );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${API}/categories`).pipe(
      catchError(() => of(['All Fragrances','For Him','For Her','Unisex']))
    );
  }

  uploadCsv(file: File): Observable<CsvUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CsvUploadResponse>(`${API}/products/csv/upload`, formData);
  }

  get templateDownloadUrl(): string {
    return `${API}/products/csv/template`;
  }

  get exportCsvUrl(): string {
    return `${API}/products/csv/export`;
  }

  get apiBase(): string { return API; }
}
