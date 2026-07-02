import { Component, inject, signal } from '@angular/core';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-pantalla-admin',
  imports: [SidebarComponent, DatePipe],
  template: `
    <div class="h-dvh w-full bg-[#F8F7F2] flex">
      <!-- Sidebar -->
      <app-sidebar />

      <!-- Contenido Principal -->
      <div class="flex-1 flex flex-col overflow-hidden bg-[#F8F7F2]">
        <!-- Header -->
        <header class="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div>
            <h2 class="text-xl font-bold text-gray-800 tracking-tight">Panel de Administración</h2>
            <p class="text-sm text-gray-500 font-medium mt-0.5">Vista General</p>
          </div>
          <div class="flex items-center gap-8">
            <div class="bg-red-50 text-red-900 px-4 py-2 rounded-xl border border-red-100 font-mono text-lg font-bold tracking-wider shadow-inner flex items-center gap-2">
              <svg class="w-5 h-5 text-red-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ horaActual() | date:'hh:mm:ss a' }}
            </div>
          </div>
        </header>

        <!-- Área principal -->
        <main class="flex-1 overflow-auto p-8 relative">
          <!-- Fondo decorativo -->
          <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#B71C1C 1px, transparent 1px); background-size: 24px 24px;"></div>

          <div class="relative z-10 max-w-7xl mx-auto flex flex-col gap-6 items-center justify-center h-full">
            <div class="text-center">
              <div class="bg-red-100 text-red-600 p-6 rounded-full inline-flex mb-6 shadow-sm border-4 border-white">
                <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 class="text-3xl font-black text-gray-800 tracking-tight">Bienvenido, Administrador</h2>
              <p class="text-lg text-gray-500 mt-2 max-w-lg mx-auto">Selecciona una opción del menú lateral para gestionar mozos, ver reportes de ventas o administrar la configuración del sistema.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class PantallaAdminComponent {
  readonly horaActual = signal(new Date());

  constructor() {
    setInterval(() => {
      this.horaActual.set(new Date());
    }, 1000);
  }
}

