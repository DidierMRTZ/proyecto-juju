
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Book {
  bookId: string;  // Cambiado de _id a bookId
  title: string;
  author: string;
  publicationYear: number;
  status: 'available' | 'reserved';
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './books.html',
  styleUrl: './books.css'
})
export class BooksComponent implements OnInit {
  books: Book[] = [];
  filteredBooks: Book[] = []; // Libros filtrados
  isLoading = false;
  error = '';
  totalCount = 0;
  
  // Propiedades para el modal
  showModal = false;
  selectedBook: Book | null = null;
  
  // Propiedades para el modo de edición
  isEditing = false;
  editingBook: Book | null = null;

  // Propiedades para crear libro
  showCreateModal = false;
  newBook: Partial<Book> = {
    title: '',
    author: '',
    publicationYear: new Date().getFullYear(),
    status: 'available'
  };

  // Propiedades para filtros
  currentFilter: 'all' | 'available' | 'reserved' = 'all';
  filterButtons: Array<{
    key: 'all' | 'available' | 'reserved';
    label: string;
    icon: string;
  }> = [
    { key: 'all', label: '📚 Todos', icon: '📚' },
    { key: 'available', label: '✅ Disponibles', icon: '✅' },
    { key: 'reserved', label: '🔒 Reservados', icon: '🔒' }
  ];

  // Propiedades para búsqueda por título
  searchTitle: string = '';
  isSearching: boolean = false;
  searchResults: Book[] = [];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('BooksComponent inicializado');
    if (typeof window === 'undefined') {
      console.log('No ejecutando en modo SSR, saltando inicialización del navegador');
      return;
    }
    
    // Verificar autenticación antes de cargar
    this.checkAuthentication();
  }

  // Verificar si el usuario está autenticado
  private checkAuthentication() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No hay token, redirigiendo a login');
      this.router.navigate(['/login']);
      return;
    }

    console.log('Token encontrado, verificando validez...');
    
    // Verificar que el token sea válido antes de cargar
    this.validateTokenAndLoad(token);
  }

  // Validar token y cargar libros si es válido
  private validateTokenAndLoad(token: string) {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('Validando token contra la API...');
    
    this.http.get('http://localhost:3000/api/books', { headers })
      .subscribe({
        next: (response: any) => {
          console.log('Token válido, cargando libros...');
          this.viewBooks(); // Auto-debug on init
          
          // Cargar libros automáticamente
          setTimeout(() => {
            console.log('Probando API automáticamente al cargar...');
            this.testAPIOnInit();
          }, 100);
        },
        error: (error) => {
          console.error('Token inválido o error de API:', error);
          
          if (error.status === 401) {
            console.warn('Token inválido, limpiando y redirigiendo...');
            this.clearUserData();
            this.router.navigate(['/login']);
          } else {
            console.error('Error de API:', error);
            this.error = 'Error de conexión con la API';
          }
        }
      });
  }

  // Limpiar datos del usuario
  private clearUserData() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    console.log('Datos de usuario limpiados');
  }

  // Método para probar la API automáticamente al inicializarse
  testAPIOnInit() {
    console.log('Probando API de libros automáticamente...');
    
    // Verificar si estamos en el navegador
    if (typeof window === 'undefined') {
      console.log('No ejecutando en modo SSR, saltando testAPIOnInit');
      return;
    }

    // Obtener token del localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No hay token en localStorage, redirigiendo a login');
      this.router.navigate(['/login']);
      return;
    }

    console.log('Token encontrado, configurando headers de autenticación...');
    
    // Configurar headers con el token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('Headers configurados:', headers);
    console.log('Haciendo petición GET a http://localhost:3000/api/books');

    this.isLoading = true;
    this.error = '';

    // Configurar timeout de 8 segundos
    const timeoutId = setTimeout(() => {
      console.log('Timeout de 8 segundos alcanzado');
      this.isLoading = false;
      this.error = '⏰ Timeout: La API no respondió en 8 segundos';
    }, 8000);

    this.http.get('http://localhost:3000/api/books', { headers })
      .subscribe({
        next: (response: any) => {
          clearTimeout(timeoutId);
          console.log('Respuesta exitosa de la API:', response);
          
          if (response.success && response.data && response.data.books) {
            this.books = response.data.books;
            this.totalCount = response.data.count;
            console.log(`${this.books.length} libros cargados exitosamente`);
            
            // Aplicar filtro inicial
            this.applyFilter(this.currentFilter);
            
            // Verificar estructura de IDs
            console.log('=== VERIFICACIÓN DE IDs ===');
            this.books.forEach((book, index) => {
              console.log(`Libro ${index + 1}:`, {
                title: book.title,
                id: book.bookId,
                idType: typeof book.bookId,
                idLength: book.bookId?.length,
                hasId: !!book.bookId
              });
            });
          } else {
            console.warn('⚠️ Respuesta inesperada de la API:', response);
            this.error = 'Respuesta inesperada de la API';
          }
          
          this.isLoading = false;
        },
        error: (error) => {
          clearTimeout(timeoutId);
          console.error('❌ Error en la API:', error);
          
          let errorMessage = 'Error al cargar libros';
          
          if (error.status === 0) {
            errorMessage = '❌ No se puede conectar al servidor. ¿Está corriendo en http://localhost:3000?';
          } else if (error.status === 401) {
            errorMessage = '❌ No autorizado. Token inválido o expirado.';
            console.warn('🔑 Token inválido, redirigiendo a login...');
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else if (error.status === 403) {
            errorMessage = '❌ Acceso prohibido. No tienes permisos para ver libros.';
          } else if (error.status === 404) {
            errorMessage = '❌ Endpoint no encontrado. Verifica la URL de la API.';
          } else if (error.status === 500) {
            errorMessage = '❌ Error interno del servidor. Intenta más tarde.';
          } else {
            errorMessage = `❌ Error ${error.status}: ${error.message || 'Error desconocido'}`;
          }
          
          this.error = errorMessage;
          this.isLoading = false;
        }
      });
  }

  // Método para cancelar la edición
  cancelEdit() {
    console.log('Cancelando edición del libro');
    
    // Verificar si estamos en el navegador
    if (typeof window === 'undefined') {
      console.log('No ejecutando en modo SSR, saltando cancelEdit');
      return;
    }
    
    this.isEditing = false;
    this.editingBook = null;
    
    console.log('=== ESTADO DESPUÉS DE CANCELAR EDICIÓN ===');
    console.log('isEditing:', this.isEditing);
    console.log('editingBook:', this.editingBook);
    console.log('============================');
  }

  // Métodos para crear libro
  showCreateBookModal() {
    console.log('➕ Abriendo modal para crear libro...');
    this.showCreateModal = true;
    this.resetNewBook();
  }

  closeCreateModal() {
    console.log('Cerrando modal de creación...');
    this.showCreateModal = false;
    this.resetNewBook();
  }

  resetNewBook() {
    this.newBook = {
      title: '',
      author: '',
      publicationYear: new Date().getFullYear(),
      status: 'available'
    };
  }

  createBook() {
    if (!this.newBook.title || !this.newBook.author || !this.newBook.publicationYear) {
      console.warn('⚠️ Campos requeridos incompletos');
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    console.log('📝 Creando nuevo libro:', this.newBook);
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No hay token de autenticación');
      this.error = 'No tienes permisos para crear libros';
      return;
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    this.isLoading = true;
    this.error = '';

    this.http.post('http://localhost:3000/api/books', this.newBook, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('Libro creado exitosamente:', response);
          this.isLoading = false;
          this.closeCreateModal();
          
          // Recargar la lista de libros
          setTimeout(() => {
            this.testAPIOnInit();
          }, 500);
          
          // Mostrar mensaje de éxito
          alert(`✅ Libro "${this.newBook.title}" creado exitosamente`);
        },
        error: (error) => {
          console.error('❌ Error creando libro:', error);
          this.isLoading = false;
          
          if (error.status === 401) {
            this.error = '❌ No tienes permisos para crear libros';
            this.clearUserData();
            this.router.navigate(['/login']);
          } else if (error.status === 400) {
            this.error = '❌ Datos inválidos: ' + (error.error?.message || 'Verifica los campos');
          } else {
            this.error = '❌ Error del servidor: ' + (error.error?.message || 'Intenta de nuevo');
          }
        }
      });
  }

  loadBooks() {
    console.log('🔄 Método loadBooks() ejecutado manualmente');
    
    // Verificar si estamos en el navegador
    if (typeof window === 'undefined') {
      console.log('🚫 No ejecutando en modo SSR, saltando loadBooks');
      return;
    }
    
    // Debug del estado antes de cargar
    console.log('🔄 === ESTADO ANTES DE CARGA MANUAL ===');
    this.viewBooks();
    
    this.isLoading = true;
    this.error = '';
    
    // Usar el mismo método automático
    this.testAPIOnInit();
  }

  getStatusText(status: string): string {
    return status === 'available' ? 'Disponible' : 'Reservado';
  }

  getStatusClass(status: string): string {
    return status === 'available' ? 'status-available' : 'status-reserved';
  }

  logout() {
    console.log('🚪 Cerrando sesión...');
    
    // Verificar si estamos en el navegador
    if (typeof window === 'undefined') {
      console.log('🚫 No ejecutando en modo SSR, saltando logout');
      return;
    }

    // Limpiar todos los datos del usuario
    this.clearUserData();
    
    // Limpiar estado del componente
    this.books = [];
    this.totalCount = 0;
    this.error = '';
    this.isLoading = false;
    this.showModal = false;
    this.selectedBook = null;
    this.isEditing = false;
    this.editingBook = null;
    
    console.log('🧹 Estado del componente limpiado');
    
    // Redirigir a login
    console.log('🚀 Redirigiendo a /login...');
    this.router.navigate(['/login']);
  }

  testButton() {
    console.log('🧪 Botón de prueba clickeado!');
    
    // Verificar si estamos en el navegador
    if (typeof window === 'undefined') {
      console.log('🚫 No ejecutando en modo SSR, saltando testButton');
      return;
    }
    
    alert('¡El botón funciona! Ahora probando loadBooks...');
    this.loadBooks();
  }

  testAPI() {
    console.log('🔗 Probando API directamente...');
    
    // Verificar si estamos en el navegador
    if (typeof window === 'undefined') {
      console.log('🚫 No ejecutando en modo SSR, saltando testAPI');
      return;
    }
    
    // Hacer una petición simple a la API
    this.http.get('http://localhost:3000/api/books')
      .subscribe({
        next: (response) => {
          console.log('✅ API responde correctamente:', response);
          alert('✅ API funciona! Respuesta: ' + JSON.stringify(response).substring(0, 100) + '...');
        },
        error: (error) => {
          console.error('❌ API no responde:', error);
          alert('❌ API no responde: ' + error.message);
        }
      });
  }

  // Método para limpiar estados y forzar recarga
  forceReload() {
    console.log('🚨 Forzando recarga completa...');
    
    // Verificar si estamos en el navegador
    if (typeof window === 'undefined') {
      console.log('🚫 No ejecutando en modo SSR, saltando forceReload');
      return;
    }
    
    // Debug del estado antes de limpiar
    console.log('🧹 === ESTADO ANTES DE LIMPIAR ===');
    this.viewBooks();
    
    // Limpiar todos los estados
    this.isLoading = false;
    this.error = '';
    this.books = [];
    this.totalCount = 0;
    
    // Forzar detección de cambios
    console.log('🧹 Estados limpiados, forzando recarga...');
    
    // Debug del estado después de limpiar
    console.log('🧹 === ESTADO DESPUÉS DE LIMPIAR ===');
    this.viewBooks();
    
    // Esperar un momento y luego cargar
    setTimeout(() => {
      console.log('🔄 Iniciando recarga forzada...');
      this.testAPIOnInit();
    }, 200);
  }

  // Métodos para obtener información del usuario
  getUserEmail(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('userEmail') || 'No disponible';
    }
    return 'No disponible (SSR)';
  }

  getUserRole(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('userRole') || 'No disponible';
    }
    return 'No disponible (SSR)';
  }

  // Método helper para convertir string a tipo de filtro válido
  private getFilterType(key: string): 'all' | 'available' | 'reserved' {
    if (key === 'all' || key === 'available' || key === 'reserved') {
      return key;
    }
    return 'all'; // valor por defecto
  }

  // Aplicar filtro
  applyFilter(filterType: 'all' | 'available' | 'reserved') {
    console.log(`Aplicando filtro: ${filterType}`);
    
    // Limpiar búsqueda cuando se cambia de filtro
    if (this.searchTitle.trim()) {
      this.clearSearch();
    }
    
    this.currentFilter = filterType;
    
    if (filterType === 'all') {
      this.filteredBooks = [...this.books];
    } else {
      this.filteredBooks = this.books.filter(book => book.status === filterType);
    }
    
    console.log(`Filtro aplicado: ${filterType}, libros mostrados: ${this.filteredBooks.length}`);
  }

  // Método para obtener el contador de libros por filtro
  getFilterCount(filter: string): number {
    const filterType = this.getFilterType(filter);
    
    switch (filterType) {
      case 'all':
        return this.books.length;
      case 'available':
        return this.books.filter(book => book.status === 'available').length;
      case 'reserved':
        return this.books.filter(book => book.status === 'reserved').length;
      default:
        return 0;
    }
  }

  // Método helper para obtener la etiqueta del filtro
  getFilterLabel(filter: string): string {
    const filterType = this.getFilterType(filter);
    
    switch (filterType) {
      case 'all':
        return 'Todos';
      case 'available':
        return 'Disponibles';
      case 'reserved':
        return 'Reservados';
      default:
        return 'Todos';
    }
  }

  // Método para debug del estado actual
  viewBooks() {
    console.log('🔍 === ESTADO ACTUAL DEL COMPONENTE ===');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🔄 isLoading:', this.isLoading);
    console.log('❌ error:', this.error);
    console.log('📚 books.length:', this.books.length);
    console.log('📊 totalCount:', this.totalCount);
    console.log('🔍 currentFilter:', this.currentFilter);
    console.log('📖 filteredBooks.length:', this.filteredBooks.length);
    
    // Información de filtros
    console.log('🔍 === INFORMACIÓN DE FILTROS ===');
    console.log('📚 Total libros:', this.getFilterCount('all'));
    console.log('✅ Libros disponibles:', this.getFilterCount('available'));
    console.log('🔒 Libros reservados:', this.getFilterCount('reserved'));
    
    // Verificar si estamos en el navegador antes de acceder a localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      const userRole = localStorage.getItem('userRole');
      
      console.log('🔑 localStorage token:', token ? 'SÍ' : 'NO');
      console.log('👤 Usuario email:', userEmail || 'No disponible');
      console.log('🔑 Usuario rol:', userRole || 'No disponible');
      console.log('🌐 URL actual:', window.location.href);
      console.log('📱 User Agent:', navigator.userAgent);
      
      // También mostrar en la consola si hay algún problema
      if (!token) {
        console.warn('⚠️ ADVERTENCIA: No hay token en localStorage');
      }
      if (!userEmail) {
        console.warn('⚠️ ADVERTENCIA: No hay email de usuario en localStorage');
      }
      if (!userRole) {
        console.warn('⚠️ ADVERTENCIA: No hay rol de usuario en localStorage');
      }
    } else {
      console.log('🔑 localStorage: No disponible (modo SSR)');
      console.log('🌐 URL actual: No disponible (modo SSR)');
      console.log('📱 User Agent: No disponible (modo SSR)');
    }
    
    console.log('=====================================');
    
    if (this.error) {
      console.warn('⚠️ ADVERTENCIA: Hay un error activo:', this.error);
    }
  }

  // Método para debug específico del libro seleccionado
  debugSelectedBook() {
    console.log('📚 === INFORMACIÓN DEL LIBRO SELECCIONADO ===');
    if (this.selectedBook) {
      console.log('📚 Libro seleccionado:', this.selectedBook);
      console.log('🆔 ID:', this.selectedBook.bookId);
      console.log('📋 Tipo del ID:', typeof this.selectedBook.bookId);
      console.log('📏 Longitud del ID:', this.selectedBook.bookId?.length);
      console.log('📝 Título:', this.selectedBook.title);
      console.log('✍️ Autor:', this.selectedBook.author);
      console.log('📅 Año:', this.selectedBook.publicationYear);
      console.log('🏷️ Estado:', this.selectedBook.status);
      
      // Verificación de integridad del libro seleccionado
      console.log('🔍 === VERIFICACIÓN DE INTEGRIDAD ===');
      console.log('✅ Tiene título:', !!this.selectedBook.title);
      console.log('✅ Tiene autor:', !!this.selectedBook.author);
      console.log('✅ Tiene año:', !!this.selectedBook.publicationYear);
      console.log('✅ Tiene estado:', !!this.selectedBook.status);
      console.log('✅ Tiene ID válido:', !!(this.selectedBook.bookId && this.selectedBook.bookId.length === 24));
    } else {
      console.log('❌ No hay libro seleccionado');
    }
    console.log('=====================================');
    
    // También mostrar en alert para fácil visualización
    if (this.selectedBook) {
      let bookInfo = `📚 INFORMACIÓN DEL LIBRO\n\n`;
      bookInfo += `📝 Título: ${this.selectedBook.title}\n`;
      bookInfo += `✍️ Autor: ${this.selectedBook.author}\n`;
      bookInfo += `📅 Año: ${this.selectedBook.publicationYear}\n`;
      bookInfo += `🏷️ Estado: ${this.getStatusText(this.selectedBook.status)}\n`;
      bookInfo += `🆔 ID: ${this.selectedBook.bookId}\n`;
      bookInfo += `📏 Longitud ID: ${this.selectedBook.bookId?.length || 0}\n`;
      bookInfo += `✅ ID Válido: ${this.selectedBook.bookId && this.selectedBook.bookId.length === 24 ? 'SÍ' : 'NO'}\n`;
      
      if (this.selectedBook.createdAt) {
        bookInfo += `📅 Creado: ${new Date(this.selectedBook.createdAt).toLocaleString()}\n`;
      }
      if (this.selectedBook.updatedAt) {
        bookInfo += `🔄 Actualizado: ${new Date(this.selectedBook.updatedAt).toLocaleString()}\n`;
      }
      
      alert(bookInfo);
    } else {
      alert('❌ No hay libro seleccionado para mostrar información');
    }
  }

  // Método para mostrar el modal del libro
  showBookModal(book: Book) {
    console.log('📚 Mostrando modal para libro:', book.title);
    
    // Verificar si estamos en el navegador
    if (typeof window === 'undefined') {
      console.log('🚫 No ejecutando en modo SSR, saltando showBookModal');
      return;
    }
    
    this.selectedBook = book;
    this.showModal = true;
    
    // Debug del estado del modal
    console.log('🔍 === ESTADO DEL MODAL ===');
    console.log('showModal:', this.showModal);
    console.log('selectedBook:', this.selectedBook);
    console.log('==========================');
    
    // Debug específico del libro seleccionado
    this.debugSelectedBook();
  }

  // Método para cerrar el modal
  closeModal() {
    console.log('❌ Cerrando modal del libro');
    
    // Verificar si estamos en el navegador
    if (typeof window === 'undefined') {
      console.log('🚫 No ejecutando en modo SSR, saltando closeModal');
      return;
    }
    
    this.showModal = false;
    this.selectedBook = null;
    this.isEditing = false;
    this.editingBook = null;
    
    // Debug del estado después de cerrar
    console.log('🔍 === ESTADO DESPUÉS DE CERRAR MODAL ===');
    console.log('showModal:', this.showModal);
    console.log('selectedBook:', this.selectedBook);
    console.log('isEditing:', this.isEditing);
    console.log('editingBook:', this.editingBook);
    console.log('==========================================');
  }

  // Método para iniciar la edición de un libro
  editBook() {
    if (!this.selectedBook) {
      console.log('❌ No hay libro seleccionado para editar');
      return;
    }

    console.log('✏️ Iniciando edición del libro:', this.selectedBook.title);
    
    // Verificar si estamos en el navegador
    if (typeof window === 'undefined') {
      console.log('🚫 No ejecutando en modo SSR, saltando editBook');
      return;
    }

    // Crear una copia del libro para editar
    this.editingBook = {
      bookId: this.selectedBook.bookId,
      title: this.selectedBook.title,
      author: this.selectedBook.author,
      publicationYear: this.selectedBook.publicationYear,
      status: this.selectedBook.status,
      createdAt: this.selectedBook.createdAt,
      updatedAt: this.selectedBook.updatedAt
    };
    
    this.isEditing = true;
    
    console.log('🔍 === ESTADO DE EDICIÓN ===');
    console.log('isEditing:', this.isEditing);
    console.log('editingBook:', this.editingBook);
    console.log('============================');
  }

  // Método para guardar los cambios del libro
  saveBookChanges() {
    if (!this.editingBook) {
      console.log('❌ No hay libro en edición para guardar');
      return;
    }

    console.log('💾 Guardando cambios del libro:', this.editingBook.title);
    
    // Verificar si estamos en el navegador
    if (typeof window === 'undefined') {
      console.log('🚫 No ejecutando en modo SSR, saltando saveBookChanges');
      return;
    }

    // Validar que los campos requeridos no estén vacíos
    if (!this.editingBook.title || !this.editingBook.author || !this.editingBook.publicationYear) {
      alert('❌ Error: Todos los campos son obligatorios');
      return;
    }

    // Validar que el año sea un número válido
    if (isNaN(this.editingBook.publicationYear) || this.editingBook.publicationYear < 1000 || this.editingBook.publicationYear > 2025) {
      alert('❌ Error: El año debe ser un número entre 1000 y 2025');
      return;
    }

    console.log('🔄 Enviando cambios a la API...');
    console.log('🌐 URL de la petición:', `http://localhost:3000/api/books/${this.editingBook.bookId}`);
    console.log('📝 Datos a enviar:', this.editingBook);

    // Preparar los datos para enviar (sin bookId, createdAt, updatedAt)
    const updateData = {
      title: this.editingBook.title,
      author: this.editingBook.author,
      publicationYear: this.editingBook.publicationYear,
      status: this.editingBook.status
    };

    // Hacer la petición PUT a la API
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No hay token disponible para la petición');
      alert('❌ Error: No hay token de autenticación');
      return;
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('🌐 Headers configurados para PUT:', headers);
    console.log('📤 Datos a enviar:', updateData);

    this.http.put(`http://localhost:3000/api/books/${this.editingBook!.bookId}`, updateData, { headers })
      .subscribe({
        next: (response) => {
          console.log('✅ Libro actualizado exitosamente:', response);
          
          // Actualizar el libro en la lista local
          const bookIndex = this.books.findIndex(b => b.bookId === this.editingBook!.bookId);
          if (bookIndex !== -1) {
            this.books[bookIndex] = { ...this.books[bookIndex], ...updateData };
            this.selectedBook = this.books[bookIndex];
          }
          
          // Actualizar filtros
          this.applyFilter(this.currentFilter);
          
          // Salir del modo de edición
          this.isEditing = false;
          this.editingBook = null;
          
          // Cerrar el modal automáticamente
          this.closeModal();
          
          // Mostrar mensaje de éxito
          alert(`✅ Libro "${updateData.title}" actualizado exitosamente`);
          
          // Debug del estado después de la actualización
          console.log('💾 === ESTADO DESPUÉS DE LA ACTUALIZACIÓN ===');
          this.viewBooks();
        },
        error: (error) => {
          console.error('❌ Error al actualizar el libro:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          console.error('URL intentada:', `http://localhost:3000/api/books/${this.editingBook!.bookId}`);
          
          let errorMessage = 'Error al actualizar el libro';
          
          if (error.status === 0) {
            errorMessage = 'No se puede conectar al servidor. ¿Está corriendo en http://localhost:3000?';
          } else if (error.status === 404) {
            errorMessage = 'Libro no encontrado (404). Puede que haya sido borrado.';
          } else if (error.status === 500) {
            errorMessage = 'Error interno del servidor (500). Verifica la consola para más detalles.';
          } else if (error.status === 400) {
            errorMessage = 'Datos incorrectos (400). Verifica que todos los campos sean válidos.';
          } else if (error.status === 403) {
            errorMessage = 'No tienes permisos para actualizar este libro.';
          } else {
            errorMessage = `Error ${error.status}: ${error.message || 'Error desconocido'}`;
          }
          
          alert(`❌ ${errorMessage}`);
          
          // Debug del estado después del error
          console.log('💥 === ESTADO DESPUÉS DEL ERROR DE ACTUALIZACIÓN ===');
          this.viewBooks();
        }
      });
  }

  // Método para borrar el libro seleccionado
  deleteBook() {
    if (!this.selectedBook) {
      console.log('❌ No hay libro seleccionado para borrar');
      return;
    }

    console.log('🗑️ Borrando libro:', this.selectedBook.title);
    console.log('🆔 ID del libro:', this.selectedBook.bookId);
    console.log('📋 Tipo del ID:', typeof this.selectedBook.bookId);
    
    // Verificar si estamos en el navegador
    if (typeof window === 'undefined') {
      console.log('🚫 No ejecutando en modo SSR, saltando deleteBook');
      return;
    }

    // Validar que el ID exista y sea válido
    if (!this.selectedBook.bookId) {
      console.error('❌ ID del libro es undefined o null');
      alert('❌ Error: ID del libro no válido');
      return;
    }

    // Validar formato del ID (debe ser un string de 24 caracteres hexadecimal)
    if (typeof this.selectedBook.bookId !== 'string' || this.selectedBook.bookId.length !== 24) {
      console.error('❌ Formato del ID no válido:', this.selectedBook.bookId);
      alert('❌ Error: Formato del ID del libro no válido');
      return;
    }

    // Confirmar antes de borrar
    if (!confirm(`¿Estás seguro de que quieres borrar "${this.selectedBook.title}"? Esta acción no se puede deshacer.`)) {
      console.log('❌ Usuario canceló el borrado');
      return;
    }

    // Mostrar indicador de carga
    const originalTitle = this.selectedBook.title;
    const bookId = this.selectedBook.bookId;
    console.log('🔄 Iniciando borrado del libro...');
    console.log('🌐 URL de la petición:', `http://localhost:3000/api/books/${bookId}`);

    // Hacer la petición DELETE a la API
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No hay token disponible para la petición');
      alert('❌ Error: No hay token de autenticación');
      return;
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('🌐 Headers configurados para DELETE:', headers);

    this.http.delete(`http://localhost:3000/api/books/${bookId}`, { headers })
      .subscribe({
        next: (response) => {
          console.log('✅ Libro borrado exitosamente:', response);
          
          // Remover el libro de la lista local
          this.books = this.books.filter(book => book.bookId !== bookId);
          this.totalCount = this.books.length;
          
          // Actualizar filtros
          this.applyFilter(this.currentFilter);
          
          // Cerrar el modal automáticamente
          this.closeModal();
          
          // Mostrar mensaje de éxito
          alert(`✅ Libro "${originalTitle}" borrado exitosamente`);
          
          // Debug del estado después del borrado
          console.log('🗑️ === ESTADO DESPUÉS DEL BORRADO ===');
          this.viewBooks();
        },
        error: (error) => {
          console.error('❌ Error al borrar el libro:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          console.error('URL intentada:', `http://localhost:3000/api/books/${bookId}`);
          console.error('ID usado:', bookId);
          
          let errorMessage = 'Error al borrar el libro';
          
          if (error.status === 0) {
            errorMessage = 'No se puede conectar al servidor. ¿Está corriendo en http://localhost:3000?';
          } else if (error.status === 404) {
            errorMessage = 'Libro no encontrado (404). Puede que ya haya sido borrado.';
          } else if (error.status === 500) {
            errorMessage = 'Error interno del servidor (500). Verifica la consola para más detalles.';
          } else if (error.status === 403) {
            errorMessage = 'No tienes permisos para borrar este libro.';
          } else if (error.status === 400) {
            errorMessage = 'Datos incorrectos (400). Verifica el ID del libro.';
          } else {
            errorMessage = `Error ${error.status}: ${error.message || 'Error desconocido'}`;
          }
          
          alert(`❌ ${errorMessage}`);
          
          // Debug del estado después del error
          console.log('💥 === ESTADO DESPUÉS DEL ERROR DE BORRADO ===');
          this.viewBooks();
        }
      });
  }

  // Método para buscar libros por título
  searchBooksByTitle() {
    if (!this.searchTitle.trim()) {
      console.log('⚠️ Campo de búsqueda vacío, no se puede buscar');
      this.searchResults = [];
      this.isSearching = false;
      return;
    }

    console.log('=== INICIANDO BÚSQUEDA POR API ===');
    console.log('Término de búsqueda:', this.searchTitle);
    console.log('🔍 Ejecutando desde botón de búsqueda...');
    
    this.isSearching = true;
    this.searchResults = [];

    // Verificar si estamos en el navegador
    if (typeof window === 'undefined') {
      console.log('No ejecutando en modo SSR, saltando búsqueda');
      return;
    }

    // Obtener token del localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No hay token en localStorage, redirigiendo a login');
      this.router.navigate(['/login']);
      return;
    }

    // Configurar headers con el token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const searchUrl = `http://localhost:3000/api/books/title/${encodeURIComponent(this.searchTitle)}`;
    console.log('URL de búsqueda:', searchUrl);

    this.http.get(searchUrl, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('=== RESPUESTA DE BÚSQUEDA POR API ===');
          console.log('Respuesta completa:', response);
          
          this.isSearching = false;
          
          if (response.success && response.data && response.data.books) {
            this.searchResults = response.data.books;
            console.log(`✅ ${this.searchResults.length} libros encontrados por API para "${this.searchTitle}"`);
          } else {
            // Si no hay resultados de la API, intentar búsqueda local
            console.log('⚠️ No se encontraron libros con la API, intentando búsqueda local...');
            this.performLocalSearch();
          }
        },
        error: (error) => {
          console.error('=== ERROR EN BÚSQUEDA POR API ===');
          console.error('Error completo:', error);
          
          this.isSearching = false;
          
          if (error.status === 401) {
            console.warn('Token inválido, redirigiendo a login');
            this.router.navigate(['/login']);
          } else if (error.status === 404) {
            console.log('No se encontraron libros con ese título en la API, intentando búsqueda local...');
            this.performLocalSearch();
          } else {
            console.error('Error del servidor en búsqueda, intentando búsqueda local...');
            this.performLocalSearch();
          }
        }
      });
  }

  // Búsqueda local como fallback
  private performLocalSearch() {
    console.log('=== INICIANDO BÚSQUEDA LOCAL (FALLBACK) ===');
    
    if (!this.books || this.books.length === 0) {
      console.log('No hay libros cargados para búsqueda local');
      this.searchResults = [];
      return;
    }

    const searchTerm = this.searchTitle.toLowerCase().trim();
    console.log('Buscando localmente:', searchTerm);

    // Búsqueda más flexible: título, autor, año
    const localResults = this.books.filter(book => {
      const titleMatch = book.title.toLowerCase().includes(searchTerm);
      const authorMatch = book.author.toLowerCase().includes(searchTerm);
      const yearMatch = book.publicationYear.toString().includes(searchTerm);
      
      return titleMatch || authorMatch || yearMatch;
    });

    console.log(`🔍 Búsqueda local completada: ${localResults.length} resultados encontrados`);
    this.searchResults = localResults;
  }

  // Método para búsqueda en tiempo real
  onSearchInputChange() {
    // Limpiar búsqueda anterior si el campo está vacío
    if (!this.searchTitle.trim()) {
      this.searchResults = [];
      this.isSearching = false;
      return;
    }

    // Búsqueda local en tiempo real para mejor UX
    console.log('🔍 Búsqueda en tiempo real:', this.searchTitle);
    this.performLocalSearch();
  }

  // Método para búsqueda con Enter
  onSearchKeyPress(event: any) {
    if (event.key === 'Enter') {
      console.log('🔍 Enter presionado, ejecutando búsqueda local...');
      this.performLocalSearch();
    }
  }

  // Método para limpiar búsqueda
  clearSearch() {
    console.log('=== LIMPIANDO BÚSQUEDA ===');
    
    this.searchTitle = '';
    this.searchResults = [];
    this.isSearching = false;
    
    console.log('✅ Búsqueda limpiada completamente');
  }

  // Método para obtener libros a mostrar (búsqueda o filtro normal)
  getBooksToShow(): Book[] {
    // Si hay término de búsqueda y resultados de búsqueda
    if (this.searchTitle.trim() && this.searchResults.length > 0) {
      console.log('✅ Mostrando resultados de búsqueda:', this.searchResults.length, 'libros');
      return this.searchResults;
    }
    
    // Si hay término de búsqueda pero no hay resultados
    if (this.searchTitle.trim() && this.searchResults.length === 0) {
      console.log('⚠️ Hay término de búsqueda pero no hay resultados');
      return [];
    }
    
    // Si no hay término de búsqueda, mostrar filtros normales
    console.log('✅ Mostrando filtros normales:', this.filteredBooks.length, 'libros');
    return this.filteredBooks;
  }

  // Método para verificar si estamos mostrando resultados de búsqueda
  isShowingSearchResults(): boolean {
    const showingSearch = this.searchTitle.trim() !== '' && this.searchResults.length > 0;
    console.log('🔍 Mostrando resultados de búsqueda:', showingSearch);
    return showingSearch;
  }
}