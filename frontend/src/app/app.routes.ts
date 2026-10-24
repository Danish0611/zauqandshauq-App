import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

export const routes: Routes = [
  { path: '', component: AppComponent, data: { view: 'home' } },
  { path: 'shop', component: AppComponent, data: { view: 'shop' } },
  { path: 'quiz', component: AppComponent, data: { view: 'quiz' } },
  { path: 'discovery', component: AppComponent, data: { view: 'discovery' } },
  { path: 'philosophy', component: AppComponent, data: { view: 'philosophy' } },
  { path: 'admin', component: AppComponent, data: { view: 'admin' } },
  { path: 'orders', component: AppComponent, data: { view: 'orders' } },
  { path: 'account', component: AppComponent, data: { view: 'account' } },
  { path: '**', redirectTo: '' }
];
