import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { MesasService } from '../../core/services/mesas.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#F8F7F2] flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-lg shadow-black/5 p-8">
          <div class="text-center mb-8">
            <img src="assets/images/donbelisario.png"
                 alt="Don Belisario"
                 class="w-24 h-24 mx-auto mb-4 rounded-full object-cover shadow-md"
                 onerror="this.style.display='none'">
            <h1 class="text-2xl font-bold text-[#2E221B]">Crear cuenta</h1>
            <p class="text-[#2E221B]/60 mt-1">Regístrate como cliente</p>
          </div>

          @if (error()) {
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {{ error() }}
            </div>
          }

          @if (success()) {
            <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {{ success() }}
            </div>
          }

          @if (mesaIdDetectada()) {
            <div class="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <span>¡Mesa detectada! Regístrate para pedir.</span>
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label for="nombre" class="block text-sm font-medium text-[#2E221B]/80 mb-1">Nombre completo</label>
              <input id="nombre" type="text" [(ngModel)]="nombre" name="nombre" required
                placeholder="Ej: Juan Pérez"
                class="w-full px-4 py-2.5 border border-[#2E221B]/20 rounded-lg focus:ring-2 focus:ring-[#B71C1C]/30 focus:border-[#B71C1C] outline-none transition-all text-[#2E221B] placeholder-[#2E221B]/40">
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-[#2E221B]/80 mb-1">Correo electrónico</label>
              <input id="email" type="email" [(ngModel)]="email" name="email" required
                placeholder="ej: cliente@correo.com"
                class="w-full px-4 py-2.5 border border-[#2E221B]/20 rounded-lg focus:ring-2 focus:ring-[#B71C1C]/30 focus:border-[#B71C1C] outline-none transition-all text-[#2E221B] placeholder-[#2E221B]/40">
            </div>
            <div>
              <label for="telefono" class="block text-sm font-medium text-[#2E221B]/80 mb-1">Teléfono</label>
              <input id="telefono" type="tel" [(ngModel)]="telefono" name="telefono" required
                placeholder="Ej: 999 888 777"
                class="w-full px-4 py-2.5 border border-[#2E221B]/20 rounded-lg focus:ring-2 focus:ring-[#B71C1C]/30 focus:border-[#B71C1C] outline-none transition-all text-[#2E221B] placeholder-[#2E221B]/40">
            </div>
            <div>
              <label for="direccion" class="block text-sm font-medium text-[#2E221B]/80 mb-1">Dirección</label>
              <input id="direccion" type="text" [(ngModel)]="direccion" name="direccion" required
                placeholder="Ej: Av. Siempre Viva 123"
                class="w-full px-4 py-2.5 border border-[#2E221B]/20 rounded-lg focus:ring-2 focus:ring-[#B71C1C]/30 focus:border-[#B71C1C] outline-none transition-all text-[#2E221B] placeholder-[#2E221B]/40">
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-[#2E221B]/80 mb-1">Contraseña</label>
              <input id="password" type="password" [(ngModel)]="password" name="password" required
                placeholder="Mínimo 6 caracteres"
                class="w-full px-4 py-2.5 border border-[#2E221B]/20 rounded-lg focus:ring-2 focus:ring-[#B71C1C]/30 focus:border-[#B71C1C] outline-none transition-all text-[#2E221B] placeholder-[#2E221B]/40">
            </div>
            <button type="submit" [disabled]="loading()"
              class="w-full bg-[#B71C1C] hover:bg-[#9b1515] disabled:bg-[#B71C1C]/50 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              @if (loading()) {
                <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>Registrando...</span>
              } @else {
                <span>Crear cuenta</span>
              }
            </button>
          </form>

          <p class="text-center mt-6 text-sm text-[#2E221B]/60">
            ¿Ya tienes cuenta?
            <a routerLink="/login" class="text-[#B71C1C] hover:text-[#9b1515] font-medium hover:underline">Inicia sesión</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegistroComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly mesasService = inject(MesasService);

  readonly nombre = signal('');
  readonly email = signal('');
  readonly telefono = signal('');
  readonly direccion = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly mesaIdDetectada = signal(false);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['mesaId']) {
        sessionStorage.setItem('pending_mesa_id', params['mesaId']);
        this.mesaIdDetectada.set(true);
      } else {
        if (sessionStorage.getItem('pending_mesa_id')) {
          this.mesaIdDetectada.set(true);
        }
      }
    });
  }

  onSubmit(): void {
    if (!this.nombre() || !this.email() || !this.telefono() || !this.direccion() || !this.password()) return;
    if (this.password().length < 6) {
      this.error.set('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.auth.register({
      username: this.email(),
      password: this.password(),
      nombreCompleto: this.nombre(),
      email: this.email(),
    }).subscribe({
      next: (res) => {
        this.auth.setSession(res);
        this.success.set('Cuenta creada exitosamente. Redirigiendo...');

        const mesaId = sessionStorage.getItem('pending_mesa_id');
        if (mesaId && res.rol === 'CLIENTE') {
          console.log('Iniciando sesión (vía registro) en la mesa:', mesaId);
          this.mesasService.iniciarSesionMesa({
            mesaId: mesaId,
            clienteId: res.id
          }).subscribe({
            next: (sesionMesa) => {
              console.log('Sesion de mesa iniciada tras registro', sesionMesa);
              sessionStorage.removeItem('pending_mesa_id');
              sessionStorage.setItem('current_sesion_mesa_id', sesionMesa.id);
              setTimeout(() => this.router.navigateByUrl(this.auth.getDashboardRoute()), 1500);
            },
            error: (err) => {
              console.error('Error al iniciar la sesión de mesa', err);
              setTimeout(() => this.router.navigateByUrl(this.auth.getDashboardRoute()), 1500);
            }
          });
        } else {
          setTimeout(() => this.router.navigateByUrl(this.auth.getDashboardRoute()), 1500);
        }
      },
      error: (err) => {
        let errorMsg = err?.error?.message || err?.error || 'Error al registrarse';
        if (typeof errorMsg === 'string') {
          const match = errorMsg.match(/"([^"]+)"/);
          if (match) {
            errorMsg = match[1];
          } else {
            errorMsg = errorMsg.replace(/^\d{3}\s+[A-Z_]+\s+/, '').replace(/^"(.*)"$/, '$1');
          }
        }
        this.error.set(errorMsg);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
