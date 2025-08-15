import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  success: string = '';
  error: string = '';

  // Propiedades para pestañas
  currentTab: 'login' | 'signup' | 'reset' = 'login';

  // Propiedades para signup
  signupData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  isSignupLoading: boolean = false;
  signupSuccess: string = '';
  signupError: string = '';

  // Propiedades para reset password
  resetData = {
    email: ''
  };
  isResetLoading: boolean = false;
  resetSuccess: string = '';
  resetError: string = '';

  // Propiedades para el modal de reset password
  showResetModal: boolean = false;
  resetTokenData: any = {};
  tokenCopied: boolean = false;

  // Propiedades para confirmar reset password
  resetPasswordData = {
    token: '',
    newPassword: '',
    confirmPassword: ''
  };
  isConfirmingReset: boolean = false;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.checkExistingToken();
  }

  // Verificar si ya existe un token válido al cargar el componente
  private checkExistingToken() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Token encontrado, verificando validez...');
        this.validateExistingToken(token);
      } else {
        console.log('No hay token, usuario debe hacer login');
      }
    }
  }

  // Métodos para cambiar pestañas
  setTab(tab: 'login' | 'signup' | 'reset') {
    console.log(`Cambiando a pestaña: ${tab}`);
    this.currentTab = tab;
    this.clearMessages();
  }

  clearMessages() {
    this.success = '';
    this.error = '';
    this.signupSuccess = '';
    this.signupError = '';
    this.resetSuccess = '';
    this.resetError = '';
    
    // Limpiar formularios al cambiar de pestaña
    if (this.currentTab !== 'signup') {
      this.signupData = {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      };
    }
    
    if (this.currentTab !== 'reset') {
      this.resetData.email = '';
    }
  }

  // Método para signup
  onSignup() {
    if (!this.signupData.name || !this.signupData.email || !this.signupData.password || !this.signupData.confirmPassword) {
      this.signupError = '❌ Todos los campos son obligatorios';
      return;
    }

    if (this.signupData.password !== this.signupData.confirmPassword) {
      this.signupError = '❌ Las contraseñas no coinciden';
      return;
    }

    if (this.signupData.password.length < 6) {
      this.signupError = '❌ La contraseña debe tener al menos 6 caracteres';
      return;
    }

    // Validar requisitos de contraseña
    const password = this.signupData.password;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const startsWithUpperCase = /^[A-Z]/.test(password);

    if (!startsWithUpperCase) {
      this.signupError = '❌ La contraseña debe comenzar con mayúscula';
      return;
    }

    if (!hasNumber) {
      this.signupError = '❌ La contraseña debe contener al menos un número';
      return;
    }

    if (!hasSpecialChar) {
      this.signupError = '❌ La contraseña debe contener al menos un carácter especial (!@#$%^&*)';
      return;
    }

    if (this.signupData.name.trim().length < 2) {
      this.signupError = '❌ El nombre debe tener al menos 2 caracteres';
      return;
    }

    console.log('Creando nueva cuenta:', { 
      name: this.signupData.name, 
      email: this.signupData.email 
    });

    this.isSignupLoading = true;
    this.signupError = '';

    const signupPayload = {
      name: this.signupData.name.trim(),
      email: this.signupData.email.trim().toLowerCase(),
      password: this.signupData.password
    };

    this.http.post('http://localhost:3000/api/users', signupPayload)
      .subscribe({
        next: (response: any) => {
          console.log('Cuenta creada exitosamente:', response);
          this.isSignupLoading = false;
          this.signupSuccess = '✅ ¡Cuenta creada exitosamente! Ahora puedes hacer login.';
          
          // Limpiar formulario
          this.signupData = {
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
          };
          
          // Cambiar a pestaña de login después de 2 segundos
          setTimeout(() => {
            this.setTab('login');
          }, 2000);
        },
        error: (error) => {
          console.error('❌ Error creando cuenta:', error);
          this.isSignupLoading = false;
          
          if (error.status === 400) {
            this.signupError = '❌ Datos inválidos: ' + (error.error?.message || 'Verifica los campos');
          } else if (error.status === 409) {
            this.signupError = '❌ El email ya está registrado';
          } else {
            this.signupError = '❌ Error del servidor: ' + (error.error?.message || 'Intenta de nuevo');
          }
        }
      });
  }

  // Método para reset password
  onResetPassword() {
    if (!this.resetData.email) {
      this.resetError = '❌ Por favor ingresa tu email';
      return;
    }

    console.log('Solicitando reset de contraseña para:', this.resetData.email);
    console.log('Enviando petición a:', 'http://localhost:3000/api/tokens/reset-password');

    this.isResetLoading = true;
    this.resetError = '';

    const resetPayload = {
      email: this.resetData.email
    };

    console.log('Payload enviado:', resetPayload);

    this.http.post('http://localhost:3000/api/tokens/reset-password', resetPayload)
      .subscribe({
        next: (response: any) => {
          console.log('Token de reset creado exitosamente:', response);
          console.log('Respuesta completa del servidor:', response);
          
          this.isResetLoading = false;
          
          // Extraer el resetToken de la respuesta
          let resetToken = null;
          if (response.resetToken) {
            resetToken = response.resetToken;
          } else if (response.data && response.data.resetToken) {
            resetToken = response.data.resetToken;
          } else if (response.token) {
            resetToken = response.token;
          }
          
          if (resetToken) {
            // Guardar el token recibido
            this.resetTokenData = {
              token: resetToken,
              email: this.resetData.email,
              createdAt: new Date().toISOString()
            };
            
            console.log('ResetToken extraído:', resetToken);
            console.log('Token guardado en resetTokenData:', this.resetTokenData);
            
            // Mostrar ventana con el resetToken usando prompt (más fácil de copiar)
            this.showResetTokenPrompt(resetToken);
          } else {
            console.error('No se encontró resetToken en la respuesta:', response);
            this.resetError = '❌ No se recibió el resetToken del servidor';
          }
          
          // Limpiar formulario de reset
          this.resetData.email = '';
          
          // Mostrar mensaje de éxito
          this.resetSuccess = '✅ ResetToken generado. Revisa la ventana del navegador.';
        },
        error: (error) => {
          console.error('Error solicitando reset:', error);
          console.error('Detalles del error:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error
          });
          
          this.isResetLoading = false;
          
          if (error.status === 404) {
            this.resetError = '❌ No se encontró una cuenta con ese email';
          } else if (error.status === 400) {
            this.resetError = '❌ Email inválido';
          } else {
            this.resetError = '❌ Error del servidor: ' + (error.error?.message || 'Intenta de nuevo');
          }
        }
      });
  }

  private validateExistingToken(token: string) {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    this.http.get('http://localhost:3000/api/books', { headers })
      .subscribe({
        next: (response: any) => {
          console.log('Token válido, puedes ir a libros');
          this.success = '✅ Ya tienes una sesión activa. Puedes ir a la página de libros.';
        },
        error: (error) => {
          console.log('Token inválido o expirado, limpiando...');
          localStorage.removeItem('token');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userRole');
          this.error = '❌ Tu sesión ha expirado. Por favor, haz login de nuevo.';
        }
      });
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.error = '❌ Por favor, completa todos los campos';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.success = '';

    const loginData = { email: this.email, password: this.password };
    console.log('Intentando login con:', { email: this.email, password: '***' });

    this.http.post('http://localhost:3000/api/users/login', loginData)
      .subscribe({
        next: (response: any) => {
          console.log('Login exitoso:', response);
          
          if (response.success && response.data && response.data.token) {
            // Guardar token en localStorage
            localStorage.setItem('token', response.data.token);
            console.log('Token guardado en localStorage');
            
            // Guardar información del usuario
            if (response.data.user) {
              localStorage.setItem('userEmail', response.data.user.email);
              localStorage.setItem('userRole', response.data.user.role || 'user');
              console.log('Información del usuario guardada:', {
                email: response.data.user.email,
                role: response.data.user.role
              });
            }

            this.success = '¡Login exitoso! Redirigiendo a libros...';
            
            // Probar la API de libros antes de redirigir
            this.testBooksAPI(response.data.token);
          } else {
            this.error = '❌ Respuesta inesperada del servidor';
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error en login:', error);
          let errorMessage = 'Error al iniciar sesión';
          
          if (error.status === 0) {
            errorMessage = '❌ No se puede conectar al servidor. ¿Está corriendo en http://localhost:3000?';
          } else if (error.status === 401) {
            errorMessage = '❌ Credenciales incorrectas. Verifica tu email y contraseña.';
          } else if (error.status === 400) {
            errorMessage = '❌ Datos incorrectos. Verifica el formato del email.';
          } else if (error.status === 404) {
            errorMessage = '❌ Usuario no encontrado. Verifica tu email.';
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

  // Probar la API de libros después del login exitoso
  private testBooksAPI(token: string) {
    console.log('Probando API de libros con el nuevo token...');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    this.http.get('http://localhost:3000/api/books', { headers })
      .subscribe({
        next: (response: any) => {
          console.log('API de libros responde correctamente:', response);
          this.success = '✅ API verificada. Redirigiendo a libros...';
          
          // Redirigir después de verificar la API
          setTimeout(() => {
            console.log('Redirigiendo a /books...');
            this.router.navigate(['/books']);
          }, 1500);
        },
        error: (error) => {
          console.error('Error verificando API de libros:', error);
          this.error = '❌ Error verificando API. Intenta de nuevo.';
          this.isLoading = false;
        }
      });
  }

  clearForm() {
    this.email = '';
    this.password = '';
    this.error = '';
    this.success = '';
  }

  // Método para confirmar reset password
  confirmResetPassword() {
    if (!this.resetPasswordData.token || !this.resetPasswordData.newPassword || !this.resetPasswordData.confirmPassword) {
      alert('❌ Por favor completa todos los campos');
      return;
    }

    if (this.resetPasswordData.newPassword !== this.resetPasswordData.confirmPassword) {
      alert('❌ Las contraseñas no coinciden');
      return;
    }

    // Validar requisitos de contraseña
    const password = this.resetPasswordData.newPassword;
    const startsWithUpperCase = /^[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!startsWithUpperCase) {
      alert('❌ La contraseña debe comenzar con mayúscula');
      return;
    }

    if (!hasNumber) {
      alert('❌ La contraseña debe contener al menos un número');
      return;
    }

    if (!hasSpecialChar) {
      alert('❌ La contraseña debe contener al menos un carácter especial (!@#$%^&*)');
      return;
    }

    if (password.length < 6) {
      alert('❌ La contraseña debe tener al menos 6 caracteres');
      return;
    }

    console.log('Confirmando reset de contraseña con resetToken...');
    console.log('ResetToken usado:', this.resetPasswordData.token);

    this.isConfirmingReset = true;

    const confirmPayload = {
      resetToken: this.resetPasswordData.token,
      newPassword: this.resetPasswordData.newPassword
    };

    this.http.post('http://localhost:3000/api/tokens/reset-password/confirm', confirmPayload)
      .subscribe({
        next: (response: any) => {
          console.log('Contraseña cambiada exitosamente:', response);
          this.isConfirmingReset = false;
          
          // Cerrar modal
          this.closeResetModal();
          
          // Mostrar mensaje de éxito
          alert('✅ ¡Contraseña cambiada exitosamente!\n\n' +
                '🔐 Tu nueva contraseña ha sido guardada.\n' +
                '📱 Ahora puedes hacer login con tu nueva contraseña.');
          
          // Cambiar a pestaña de login
          this.setTab('login');
        },
        error: (error) => {
          console.error('Error confirmando reset:', error);
          this.isConfirmingReset = false;
          
          if (error.status === 400) {
            alert('❌ ResetToken inválido o ya usado');
          } else if (error.status === 401) {
            alert('❌ ResetToken expirado o inválido');
          } else {
            alert('❌ Error del servidor: ' + (error.error?.message || 'Intenta de nuevo'));
          }
        }
      });
  }

  // Método para solicitar nuevo token
  requestNewToken() {
    console.log('Solicitando nuevo token...');
    this.closeResetModal();
    this.setTab('reset');
  }

  // Método de prueba para abrir ventana de reset
  testOpenModal() {
    console.log('Probando apertura del modal...');
    
    // Simular datos de reset
    this.resetData.email = 'test@test.com';
    
    // Simular resetToken recibido (formato similar al ejemplo)
    const simulatedResetToken = 'test' + Math.random().toString(36).substr(2, 64);
    
    // Simular token recibido con más información
    this.resetTokenData = {
      token: simulatedResetToken,
      email: 'test@test.com',
      createdAt: new Date().toISOString()
    };
    
    console.log('ResetToken simulado:', simulatedResetToken);
    
    // Abrir el modal directamente sin mostrar ventanas del navegador
    this.showResetModal = true;
    console.log('Modal abierto directamente:', this.showResetModal);
    
    // Forzar detección de cambios
    this.cdr.detectChanges();
    
    // Agregar un pequeño delay para asegurar que el modal se abra
    setTimeout(() => {
      if (!this.showResetModal) {
        console.log('Reintentando abrir modal...');
        this.showResetModal = true;
        this.cdr.detectChanges();
      }
    }, 100);
  }

  // Métodos para el modal de reset password
  closeResetModal() {
    console.log('Cerrando modal de reset password...');
    console.log('showResetModal antes de cerrar:', this.showResetModal);
    
    this.showResetModal = false;
    this.resetTokenData = {};
    this.tokenCopied = false;
    
    // Limpiar formulario de reset password
    this.resetPasswordData = {
      token: '',
      newPassword: '',
      confirmPassword: ''
    };
    
    console.log('showResetModal después de cerrar:', this.showResetModal);
  }

  copyResetToken() {
    if (this.resetTokenData.token) {
      // Crear un elemento temporal para copiar
      const textArea = document.createElement('textarea');
      textArea.value = this.resetTokenData.token;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      // Mostrar feedback visual
      this.tokenCopied = true;
      console.log('Token copiado al portapapeles:', this.resetTokenData.token);
      
      // Resetear el estado después de 2 segundos
      setTimeout(() => {
        this.tokenCopied = false;
      }, 2000);
    }
  }

  // Método para verificar si hay un token válido
  hasValidToken(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token');
      return !!token;
    }
    return false;
  }

  // Método para ir a la página de libros
  goToBooks() {
    console.log('Yendo a la página de libros...');
    this.router.navigate(['/books']);
  }

  // Método para limpiar token (útil para testing)
  clearToken() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      console.log('Token y datos de usuario limpiados');
      this.success = '🧹 Token limpiado. Puedes hacer login de nuevo.';
    }
  }

  // Método para abrir ventana de reset de contraseña
  private openPasswordResetWindow() {
    // Mostrar información en alert
    alert('🔑 RECUPERACIÓN DE CONTRASEÑA\n\n' +
          '📧 Email: ' + this.resetData.email + '\n\n' +
          '📋 Instrucciones:\n' +
          '1. Se abrirá una ventana para ingresar tu nueva contraseña\n' +
          '2. La contraseña debe comenzar con mayúscula\n' +
          '3. Debe contener al menos un número\n' +
          '4. Debe contener al menos un carácter especial\n' +
          '5. Mínimo 6 caracteres\n\n' +
          '✅ Click en "Aceptar" para continuar');
    
    // Solicitar token
    const token = prompt('🔑 Ingresa el token de recuperación:');
    if (!token) {
      alert('❌ No se ingresó token. Operación cancelada.');
      return;
    }
    
    // Solicitar nueva contraseña
    const newPassword = prompt('🔒 Ingresa tu nueva contraseña:\n\n' +
                              '📋 Requisitos:\n' +
                              '• Comenzar con mayúscula\n' +
                              '• Contener al menos un número\n' +
                              '• Contener al menos un carácter especial\n' +
                              '• Mínimo 6 caracteres\n\n' +
                              'Ejemplo: NuevaPass123!');
    if (!newPassword) {
      alert('❌ No se ingresó contraseña. Operación cancelada.');
      return;
    }
    
    // Solicitar confirmación de contraseña
    const confirmPassword = prompt('🔐 Confirma tu nueva contraseña:');
    if (!confirmPassword) {
      alert('❌ No se confirmó la contraseña. Operación cancelada.');
      return;
    }
    
    // Validar contraseñas
    if (newPassword !== confirmPassword) {
      alert('❌ Las contraseñas no coinciden. Intenta de nuevo.');
      return;
    }
    
    // Validar requisitos de contraseña
    const password = newPassword;
    const startsWithUpperCase = /^[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!startsWithUpperCase) {
      alert('❌ La contraseña debe comenzar con mayúscula');
      return;
    }
    
    if (!hasNumber) {
      alert('❌ La contraseña debe contener al menos un número');
      return;
    }
    
    if (!hasSpecialChar) {
      alert('❌ La contraseña debe contener al menos un carácter especial (!@#$%^&*)');
      return;
    }
    
    if (password.length < 6) {
      alert('❌ La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    // Mostrar resumen y confirmar
    const confirmChange = confirm('🔐 RESUMEN DE CAMBIO DE CONTRASEÑA\n\n' +
                                 '📧 Email: ' + this.resetData.email + '\n' +
                                 '🔑 Token: ' + token + '\n' +
                                 '🔒 Nueva contraseña: ' + '•'.repeat(password.length) + '\n\n' +
                                 '✅ ¿Confirmas el cambio de contraseña?');
    
    if (confirmChange) {
      // Aquí iría la llamada real a la API
      alert('✅ ¡Contraseña cambiada exitosamente!\n\n' +
            '🔐 Tu nueva contraseña ha sido guardada.\n' +
            '📱 Ahora puedes hacer login con tu nueva contraseña.');
      
      // Limpiar datos
      this.resetPasswordData = {
        token: '',
        newPassword: '',
        confirmPassword: ''
      };
    } else {
      alert('❌ Cambio de contraseña cancelado.');
    }
  }

  // Método para mostrar información del token en ventana
  private showTokenInfoWindow() {
    const tokenInfo = this.resetTokenData;
    const email = this.resetData.email;
    
    // Mostrar resumen en consola
    this.logRequestSummary(email, tokenInfo);
    
    // Crear mensaje detallado con información del token
    const tokenMessage = 
      '🔑 SOLICITUD DE RECUPERACIÓN DE CONTRASEÑA\n\n' +
      '📧 EMAIL SOLICITADO:\n' +
      '   ' + email + '\n\n' +
      '🔑 TOKEN GENERADO:\n' +
      '   ' + (tokenInfo.token || 'No disponible') + '\n\n' +
      '⏰ INFORMACIÓN DEL TOKEN:\n' +
      '   • Creado: ' + new Date().toLocaleString() + '\n' +
      '   • Expira: ' + (tokenInfo.expiresAt ? new Date(tokenInfo.expiresAt).toLocaleString() : 'No especificado') + '\n' +
      '   • Duración: ' + (tokenInfo.expiresAt ? this.calculateTokenDuration(tokenInfo.expiresAt) : 'No especificado') + '\n\n' +
      '📋 INSTRUCCIONES PARA RECUPERAR:\n' +
      '   1. ✅ Copia el token de arriba\n' +
      '   2. ✅ Click en "Aceptar" para ir al modal\n' +
      '   3. ✅ Pega el token en el campo correspondiente\n' +
      '   4. ✅ Ingresa tu nueva contraseña\n' +
      '   5. ✅ Confirma la nueva contraseña\n' +
      '   6. ✅ Click en "Cambiar Contraseña"\n\n' +
      '⚠️  IMPORTANTE:\n' +
      '   • Guarda este token en un lugar seguro\n' +
      '   • El token solo se puede usar una vez\n' +
      '   • Si expira, solicita uno nuevo\n\n' +
      '✅ Click en "Aceptar" para continuar con la recuperación';
    
    // Mostrar ventana con información detallada del token
    alert(tokenMessage);
    
    // Después de mostrar la información, abrir el modal
    this.showResetModal = true;
            console.log('Modal abierto después de mostrar token:', this.showResetModal);
    
    // Forzar detección de cambios
    this.cdr.detectChanges();
  }

  // Helper para calcular la duración del token
  private calculateTokenDuration(expiresAt: string): string {
    const expiresDate = new Date(expiresAt);
    const now = new Date();
    const diffInSeconds = Math.floor((expiresDate.getTime() - now.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} segundos`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minutos`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} horas`;
    }
  }

  // Método para mostrar resumen de la solicitud en consola
  private logRequestSummary(email: string, tokenInfo: any) {
    console.log('📋 RESUMEN DE LA SOLICITUD DE RECUPERACIÓN');
    console.log('==========================================');
    console.log('📧 Email solicitado:', email);
            console.log('Token generado:', tokenInfo.token);
        console.log('Creado:', new Date().toLocaleString());
        console.log('Expira:', tokenInfo.expiresAt ? new Date(tokenInfo.expiresAt).toLocaleString() : 'No especificado');
        console.log('Duración:', tokenInfo.expiresAt ? this.calculateTokenDuration(tokenInfo.expiresAt) : 'No especificado');
    console.log('📱 Estado:', 'Token generado exitosamente');
    console.log('🎯 Siguiente paso:', 'Mostrar ventana informativa al usuario');
    console.log('==========================================');
  }

  // Método para mostrar el resetToken en una ventana del navegador
  private showResetTokenWindow(resetToken: string) {
    const email = this.resetData.email;
    
    // Mostrar resumen en consola
    this.logResetTokenSummary(email, resetToken);
    
    // Crear mensaje específico para el resetToken con mejor formato
    const resetTokenMessage = 
      '🔑 RESET TOKEN GENERADO\n\n' +
      '📧 EMAIL:\n' +
      '   ' + email + '\n\n' +
      '🔑 RESET TOKEN:\n' +
      '   ' + resetToken + '\n\n' +
      '📋 INSTRUCCIONES:\n' +
      '   1. ✅ Selecciona y copia el resetToken de arriba\n' +
      '   2. ✅ Click en "Aceptar" para ir al modal\n' +
      '   3. ✅ Pega el resetToken en el campo correspondiente\n' +
      '   4. ✅ Ingresa tu nueva contraseña\n' +
      '   5. ✅ Confirma la nueva contraseña\n' +
      '   6. ✅ Click en "Cambiar Contraseña"\n\n' +
      '⚠️  IMPORTANTE:\n' +
      '   • Este resetToken solo se puede usar una vez\n' +
      '   • Guárdalo en un lugar seguro\n' +
      '   • Si lo pierdes, solicita uno nuevo\n\n' +
      '💡 TIP: Puedes hacer doble click en el token para seleccionarlo todo\n\n' +
      '✅ Click en "Aceptar" para continuar con la recuperación';
    
    // Mostrar ventana con el resetToken
    alert(resetTokenMessage);
    
    // Después de mostrar la información, abrir el modal
    this.showResetModal = true;
            console.log('Modal abierto después de mostrar resetToken:', this.showResetModal);
    
    // Forzar detección de cambios
    this.cdr.detectChanges();
    
    // Agregar un pequeño delay para asegurar que el modal se abra
    setTimeout(() => {
      if (!this.showResetModal) {
        console.log('Reintentando abrir modal...');
        this.showResetModal = true;
        this.cdr.detectChanges();
      }
    }, 100);
  }

  // Método alternativo para mostrar el resetToken usando prompt (más fácil de copiar)
  private showResetTokenPrompt(resetToken: string) {
    const email = this.resetData.email;
    
    // Mostrar resumen en consola
    this.logResetTokenSummary(email, resetToken);
    
    // Primero mostrar información
    const infoMessage = 
      '🔑 RESET TOKEN GENERADO\n\n' +
      '📧 EMAIL: ' + email + '\n\n' +
      '📋 INSTRUCCIONES:\n' +
      '   1. ✅ Se abrirá una ventana con el token\n' +
      '   2. ✅ Selecciona y copia todo el contenido\n' +
      '   3. ✅ Click en "Aceptar" para ir al modal\n' +
      '   4. ✅ Pega el token en el campo correspondiente\n' +
      '   5. ✅ Ingresa tu nueva contraseña\n\n' +
      '⚠️  IMPORTANTE:\n' +
      '   • Este token solo se puede usar una vez\n' +
      '   • Guárdalo en un lugar seguro\n\n' +
      '✅ Click en "Aceptar" para ver el token';
    
    alert(infoMessage);
    
    // Luego mostrar el token en un prompt (más fácil de copiar)
    const tokenPrompt = prompt(
      '🔑 RESET TOKEN - COPIA ESTE VALOR:\n\n' +
      '📧 Email: ' + email + '\n\n' +
      '🔑 Token:\n' + resetToken + '\n\n' +
      '📋 Instrucciones:\n' +
      '1. Selecciona todo el contenido del token\n' +
      '2. Copia (Ctrl+C)\n' +
      '3. Click en "Aceptar" para continuar\n\n' +
      '⚠️  NO modifiques el token, solo cópialo',
      resetToken
    );
    
    if (tokenPrompt !== null) {
      // Abrir el modal después de mostrar el token
      this.showResetModal = true;
      console.log('Modal abierto después de mostrar resetToken con prompt:', this.showResetModal);
      
      // Forzar detección de cambios
      this.cdr.detectChanges();
      
      // Agregar un pequeño delay para asegurar que el modal se abra
      setTimeout(() => {
        if (!this.showResetModal) {
          console.log('Reintentando abrir modal...');
          this.showResetModal = true;
          this.cdr.detectChanges();
        }
      }, 100);
    }
  }

  // Método para mostrar resumen de la solicitud de reset en consola
  private logResetTokenSummary(email: string, resetToken: string) {
    console.log('📋 RESUMEN DE LA SOLICITUD DE RESET DE CONTRASEÑA');
    console.log('====================================================');
    console.log('📧 Email solicitado:', email);
    console.log('Reset Token generado:', resetToken);
    console.log('Creado:', new Date().toLocaleString());
    console.log('📱 Estado:', 'Reset Token generado exitosamente');
    console.log('🎯 Siguiente paso:', 'Mostrar ventana informativa al usuario');
    console.log('====================================================');
  }
}
