import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { BooksComponent } from './books/books';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'books', component: BooksComponent },
  { path: '**', redirectTo: '/login' }
];
