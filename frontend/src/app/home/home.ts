import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Book {
  _id: string;
  title: string;
  author: string;
  publicationYear: number;
  status: 'available' | 'reserved';
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  books: Book[] = [];
  isLoading = false;
  error = '';
  totalCount = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.isLoading = true;
    this.error = '';
    
    this.http.get('http://localhost:3000/api/books')
      .subscribe({
        next: (response: any) => {
          console.log('Libros cargados:', response);
          // La API devuelve { success, message, data: { count, books } }
          if (response.success && response.data && response.data.books) {
            this.books = response.data.books;
            this.totalCount = response.data.count || 0;
          } else if (Array.isArray(response)) {
            // Fallback si la respuesta es directamente un array
            this.books = response;
            this.totalCount = response.length;
          } else {
            this.books = [];
            this.totalCount = 0;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar libros:', error);
          this.error = 'Error al cargar libros';
          this.isLoading = false;
        }
      });
  }

  getStatusText(status: string): string {
    return status === 'available' ? 'Disponible' : 'Reservado';
  }

  getStatusClass(status: string): string {
    return status === 'available' ? 'status-available' : 'status-reserved';
  }
}
