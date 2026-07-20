import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { MesasService } from '../../core/services/mesas.service';
import { HttpClient } from '@angular/common/http';
import { LoginResponse } from './models';
import { environment } from '../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#F8F7F2] flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 sm:p-8">
          <div class="text-center mb-6 sm:mb-8">
            <img src="assets/images/donbelisario.png"
                 alt="Don Belisario"
                 class="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full object-cover shadow-md"
                 onerror="this.style.display='none'">
            <h1 class="text-2xl sm:text-3xl font-bold text-[#2E221B]">Don Belisario</h1>
            <p class="text-[#2E221B]/60 mt-1 text-sm sm:text-base">Inicia sesión para continuar</p>
          </div>

          @if (error()) {
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {{ error() }}
            </div>
          }

          @if (mesaIdDetectada()) {
            <div class="bg-[#F8F7F2] border border-[#2E221B]/10 p-4 sm:p-5 rounded-2xl mb-6 shadow-sm relative overflow-hidden">
              <!-- Decorative background element -->
              <div class="absolute -right-4 -top-4 text-[#B71C1C]/5 w-24 h-24 transform rotate-12">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11 2v4.26l-3.32-2.12-.55.82 2.3 3.6-4.09.8.17 1 4.15-.81-1.33 4 .95.31 1.34-4 2.82 3 2.82-3 1.34 4 .95-.31-1.33-4 4.15.81.17-1-4.09-.8 2.3-3.6-.55-.82L13 6.26V2h-2zm-6.5 6a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm15 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                </svg>
              </div>
              
              <div class="flex flex-col gap-3 sm:gap-4 relative z-10">
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div class="bg-[#B71C1C] p-2.5 rounded-xl text-white shadow-sm shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-bold text-[#2E221B] text-lg">¡Mesa detectada!</h3>
                    <p class="text-[#2E221B]/70 text-sm font-medium">Inicia sesión para realizar tu pedido.</p>
                  </div>
                </div>
                
                @if (mesaNumero() || mozoAsignado()) {
                  <div class="bg-white rounded-xl p-3 sm:p-3.5 flex flex-col gap-2 sm:gap-3 shadow-sm border border-[#2E221B]/5">
                    @if (mesaNumero()) {
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-[#2E221B]/5 flex items-center justify-center text-[#B71C1C] shrink-0">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                          </svg>
                        </div>
                        <div class="overflow-hidden">
                          <span class="text-xs uppercase tracking-wider font-bold text-[#2E221B]/50 block">Ubicación</span>
                          <span class="font-bold text-[#2E221B] truncate">Mesa #{{ mesaNumero() }}</span>
                        </div>
                      </div>
                    }
                    
                    @if (mesaNumero() && mozoAsignado()) {
                      <div class="h-px bg-[#2E221B]/5 w-full"></div>
                    }

                    @if (mozoAsignado()) {
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-[#B71C1C]/10 flex items-center justify-center text-[#B71C1C] shrink-0">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div class="overflow-hidden">
                          <span class="text-xs uppercase tracking-wider font-bold text-[#2E221B]/50 block">Mozo Asignado</span>
                          <span class="font-bold text-[#2E221B] capitalize truncate block">{{ mozoAsignado() }}</span>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-[#2E221B]/80 mb-1">Correo electrónico</label>
              <input
                id="email"
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                placeholder="ej: carlos@email.com"
                class="w-full px-4 py-2.5 border border-[#2E221B]/20 rounded-lg focus:ring-2 focus:ring-[#B71C1C]/30 focus:border-[#B71C1C] outline-none transition-all text-[#2E221B] placeholder-[#2E221B]/40 text-base">
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-[#2E221B]/80 mb-1">Contraseña</label>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  class="w-full px-4 py-2.5 pr-10 border border-[#2E221B]/20 rounded-lg focus:ring-2 focus:ring-[#B71C1C]/30 focus:border-[#B71C1C] outline-none transition-all text-[#2E221B] placeholder-[#2E221B]/40 text-base">
                <button type="button" (click)="showPassword.set(!showPassword())"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-[#2E221B]/50 hover:text-[#2E221B]/80 transition-colors">
                  @if (showPassword()) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  }
                </button>
              </div>
            </div>
            <button type="submit"
                    [disabled]="loading()"
                    class="w-full bg-[#B71C1C] hover:bg-[#9b1515] disabled:bg-[#B71C1C]/50 text-white font-semibold py-3 sm:py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6 text-base">
              @if (loading()) {
                <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>Ingresando...</span>
              } @else {
                <span>Iniciar sesión</span>
              }
            </button>
          </form>

          <div class="flex items-center gap-3 my-6">
            <div class="h-px bg-[#2E221B]/10 flex-1"></div>
            <span class="text-xs uppercase tracking-wider text-[#2E221B]/40 font-medium whitespace-nowrap">o continúa con</span>
            <div class="h-px bg-[#2E221B]/10 flex-1"></div>
          </div>

          <div id="google-signin-button" class="flex justify-center w-full overflow-hidden"></div>

          <p class="text-center mt-6 text-sm text-[#2E221B]/60">
            ¿No tienes cuenta?
            <a routerLink="/registro" class="text-[#B71C1C] hover:text-[#9b1515] font-medium hover:underline block sm:inline mt-1 sm:mt-0">Regístrate aquí</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly mesasService = inject(MesasService);
  private readonly http = inject(HttpClient);

  readonly email = signal('');
  readonly password = signal('');
  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');
  
  readonly mesaIdDetectada = signal(false);
  readonly mesaNumero = signal<number | null>(null);
  readonly mozoAsignado = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      let mesaId = params['mesaId'];

      if (mesaId) {
        sessionStorage.setItem('pending_mesa_id', mesaId);
        this.mesaIdDetectada.set(true);
        this.cargarDatosMesa(mesaId);
      } else {
        mesaId = sessionStorage.getItem('pending_mesa_id');
        if (mesaId) {
          this.mesaIdDetectada.set(true);
          this.cargarDatosMesa(mesaId);
        }
      }
    });

    this.initGoogleSignIn();
    
    // Escuchar cambios de tamaño de ventana para ajustar el botón de Google
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  private handleResize(): void {
    const container = document.getElementById('google-signin-button');
    if (container && container.innerHTML) {
      // Re-render button if window size changes significantly
      container.innerHTML = '';
      this.renderGoogleButton();
    }
  }

  private initGoogleSignIn(intentos = 20): void {
    if (typeof google === 'undefined') {
      if (intentos <= 0) return;
      setTimeout(() => this.initGoogleSignIn(intentos - 1), 150);
      return;
    }

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (resp: { credential: string }) => this.onGoogleCredential(resp.credential),
    });

    this.renderGoogleButton();
  }

  private renderGoogleButton(): void {
    if (typeof google === 'undefined') return;
    
    // Calcular ancho disponible (ancho de ventana - padding del contenedor - margen de seguridad)
    const paddingContainer = window.innerWidth < 640 ? 48 : 64; // p-6 o p-8
    const marginPantalla = 32; // p-4
    const maxWidth = window.innerWidth - paddingContainer - marginPantalla;
    const buttonWidth = Math.min(320, maxWidth > 200 ? maxWidth : 200);

    google.accounts.id.renderButton(document.getElementById('google-signin-button'), {
      theme: 'outline',
      size: 'large',
      width: buttonWidth,
      text: 'continue_with',
    });
  }

  onGoogleCredential(idToken: string): void {
    this.loading.set(true);
    this.error.set('');

    this.auth.loginWithGoogle(idToken).subscribe({
      next: (res) => this.completarLoginCliente(res),
      error: (err) => this.manejarErrorLogin(err),
      complete: () => this.loading.set(false),
    });
  }

  cargarDatosMesa(mesaId: string) {
    // Cargar número de mesa
    this.mesasService.getMesa(mesaId).subscribe({
      next: (mesa) => this.mesaNumero.set(mesa.numero),
      error: () => console.log('No se pudo cargar la mesa')
    });

    // Cargar mozo asignado
    this.http.get<any>(`${environment.apiUrl}/asignaciones-mozo/mesa/${mesaId}`).subscribe({
      next: (res) => {
        const asignaciones = res.data ? res.data : res;
        if (Array.isArray(asignaciones) && asignaciones.length > 0) {
          const mozoId = asignaciones[0].mozoId;
          this.http.get<any>(`${environment.apiUrl}/usuarios/${mozoId}`).subscribe({
            next: (mozoRes) => {
              const mozo = mozoRes.data ? mozoRes.data : mozoRes;
              this.mozoAsignado.set(mozo.nombreCompleto || mozo.nombre || 'Desconocido');
            },
            error: () => this.mozoAsignado.set('Mozo no encontrado')
          });
        } else {
          this.mozoAsignado.set('Sin mozo asignado');
        }
      },
      error: () => this.mozoAsignado.set('Error en asignación')
    });
  }

  onSubmit(): void {
    if (!this.email() || !this.password()) return;

    this.loading.set(true);
    this.error.set('');

    this.auth.login({ username: this.email(), password: this.password(), loginType: 'CLIENTE' }).subscribe({
      next: (res) => this.completarLoginCliente(res),
      error: (err) => this.manejarErrorLogin(err),
      complete: () => this.loading.set(false),
    });
  }

  private completarLoginCliente(res: LoginResponse): void {
    const mesaId = sessionStorage.getItem('pending_mesa_id');

    if (!mesaId) {
      this.error.set('No se detectó un código QR de mesa válido. Por favor, vuelva a escanear el QR.');
      this.loading.set(false);
      return;
    }

    // Primero guardamos temporalmente, pero si falla la mesa, revertiremos
    this.auth.setSession(res);

    console.log('Iniciando sesión en la mesa:', mesaId);
    this.mesasService.iniciarSesionMesa({
      mesaId: mesaId,
      clienteId: res.id
    }).subscribe({
      next: (sesionMesa) => {
        console.log('Sesion de mesa iniciada correctamente', sesionMesa);
        sessionStorage.removeItem('pending_mesa_id');
        sessionStorage.setItem('current_sesion_mesa_id', sesionMesa.id);
        this.router.navigateByUrl(this.auth.getDashboardRoute());
      },
      error: (err) => {
        console.error('Error al iniciar la sesión de mesa', err);
        // Revertir login
        this.auth.logout();
        this.error.set('El código QR es inválido o la mesa ya no existe en el sistema.');
        this.loading.set(false);
      }
    });
  }

  private manejarErrorLogin(err: any): void {
    let errorMsg = err?.error?.message || err?.error || 'Error al iniciar sesión';

    if (typeof errorMsg === 'object') {
      // Si es un objeto de error (ej: ProgressEvent, HTTP Error object sin message claro)
      errorMsg = errorMsg.message || 'Error de conexión o servidor no disponible';
    }

    if (typeof errorMsg === 'string') {
      // Extraer mensaje de comillas si viene con formato 'codigo de eror + descripcion del error "mensaje"'
      const match = errorMsg.match(/"([^"]+)"/);
      if (match) {
        errorMsg = match[1];
      } else {
        // Eliminar código HTTP inicial si existe
        errorMsg = errorMsg.replace(/^\d{3}\s+[A-Z_]+\s+/, '').replace(/^"(.*)"$/, '$1');
      }
    } else {
       errorMsg = 'Error al iniciar sesión';
    }

    this.error.set(errorMsg);
    this.loading.set(false);
  }
}
