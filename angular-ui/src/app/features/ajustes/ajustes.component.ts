import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-ajustes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-[#F8F7F2] flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div class="bg-[#B71C1C] p-6 text-center relative">
          <button (click)="volver()" class="absolute left-4 top-6 text-white hover:text-amber-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 class="text-2xl font-bold text-white">Ajustes de Cuenta</h2>
          <p class="text-amber-100 mt-1">Don Belisario</p>
        </div>

        <div class="p-8">
          <form [formGroup]="ajustesForm" (ngSubmit)="guardar()" class="space-y-6">
            
            <!-- Nombre de Usuario -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
              <input 
                type="text" 
                formControlName="username"
                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#B71C1C] focus:border-[#B71C1C] transition-all outline-none"
                placeholder="Ingresa tu nuevo usuario"
              >
            </div>

            <!-- Contraseña -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
              <input 
                type="password" 
                formControlName="password"
                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#B71C1C] focus:border-[#B71C1C] transition-all outline-none"
                placeholder="••••••••"
              >
            </div>

            <button 
              type="submit" 
              [disabled]="ajustesForm.invalid || guardando"
              class="w-full bg-[#B71C1C] text-white font-bold py-3 px-4 rounded-lg hover:bg-red-800 transition-colors focus:ring-4 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              <ng-container *ngIf="guardando">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Guardando...
              </ng-container>
              <ng-container *ngIf="!guardando">
                Guardar Cambios
              </ng-container>
            </button>

            <p *ngIf="mensaje" class="text-center text-sm font-medium mt-4 text-green-600">
              {{ mensaje }}
            </p>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AjustesComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  guardando = false;
  mensaje = '';

  ajustesForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(4)]],
    password: ['', [Validators.minLength(6)]]
  });

  constructor() {
    // Si queremos pre-llenar el usuario:
    const user = this.authService.user();
    if (user) {
      this.ajustesForm.patchValue({ username: user.username });
    }
  }

  volver() {
    const dashRoute = this.authService.getDashboardRoute();
    this.router.navigate([dashRoute]);
  }

  guardar() {
    if (this.ajustesForm.invalid) return;
    
    this.guardando = true;
    this.mensaje = '';
    
    // Aquí iría la llamada al backend real para actualizar el usuario
    // Por ahora simulamos la petición
    setTimeout(() => {
      this.guardando = false;
      this.mensaje = '¡Datos actualizados correctamente!';
      
      // Si la contraseña cambió, lo ideal es desloguear o actualizar el token
      if (this.ajustesForm.value.password) {
        setTimeout(() => {
          this.authService.logout();
          this.router.navigate(['/login']);
        }, 1500);
      }
    }, 1000);
  }
}
