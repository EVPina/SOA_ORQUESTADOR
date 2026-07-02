import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login-empleado',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-[#2E221B] flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-xl shadow-black/20 p-8 border-t-4 border-[#B71C1C]">
          <div class="text-center mb-8">
            <img src="assets/images/donbelisario.png"
                 alt="Don Belisario"
                 class="w-24 h-24 mx-auto mb-4 rounded-full object-cover shadow-md"
                 onerror="this.style.display='none'">
            <h1 class="text-2xl font-bold text-[#2E221B]">Don Belisario</h1>
            <p class="text-[#2E221B]/60 mt-1 font-medium">Acceso para Personal</p>
          </div>

          @if (error()) {
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {{ error() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-[#2E221B]/80 mb-1">Correo electrónico</label>
              <input
                id="email"
                type="email"
                [ngModel]="email()"
                (ngModelChange)="email.set($event)"
                name="email"
                required
                placeholder="ej: admin@donbelisario.com"
                class="w-full px-4 py-2.5 border border-[#2E221B]/20 rounded-lg focus:ring-2 focus:ring-[#B71C1C]/30 focus:border-[#B71C1C] outline-none transition-all text-[#2E221B] placeholder-[#2E221B]/40">
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-[#2E221B]/80 mb-1">Contraseña</label>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  [ngModel]="password()"
                  (ngModelChange)="password.set($event)"
                  name="password"
                  required
                  placeholder="••••••••"
                  class="w-full px-4 py-2.5 pr-10 border border-[#2E221B]/20 rounded-lg focus:ring-2 focus:ring-[#B71C1C]/30 focus:border-[#B71C1C] outline-none transition-all text-[#2E221B] placeholder-[#2E221B]/40">
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
                    class="w-full bg-[#B71C1C] hover:bg-[#9b1515] disabled:bg-[#B71C1C]/50 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6">
              @if (loading()) {
                <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>Autenticando...</span>
              } @else {
                <span>Ingresar al Sistema</span>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginEmpleadoComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');

  onSubmit(): void {
    if (!this.email() || !this.password()) return;

    this.loading.set(true);
    this.error.set('');

    this.auth.login({ username: this.email(), password: this.password(), loginType: 'EMPLEADO' }).subscribe({
      next: (res) => {
        this.auth.setSession(res);
        this.router.navigateByUrl(this.auth.getDashboardRoute());
      },
      error: (err) => {
        let errorMsg = err?.error?.message || err?.error?.mensaje || err?.error || err.message || 'Error al iniciar sesión';
        if (typeof errorMsg === 'object') {
          try {
            errorMsg = JSON.stringify(errorMsg);
          } catch {
            errorMsg = 'Error de conexión o servidor no disponible';
          }
        }
        if (typeof errorMsg === 'string') {
          // Extraer mensaje dentro de comillas si viene con formato 'codigo "mensaje"'
          const match = errorMsg.match(/"([^"]+)"/);
          if (match) errorMsg = match[1];
          else errorMsg = errorMsg.replace(/^\d{3}\s+[A-Z_]+\s+/, '').replace(/^"(.*)"$/, '$1');
        }
        
        this.error.set(errorMsg);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
