import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar.component';
import { DatePipe } from '@angular/common';
import { MesasService, Mesa } from './mesas.service';

@Component({
  selector: 'app-recepcion-mesas',
  imports: [CommonModule, SidebarComponent, DatePipe, FormsModule],
  template: `
    <div class="h-dvh w-full bg-[#F8F7F2] flex">
      <!-- Sidebar -->
      <app-sidebar />

      <!-- Contenido Principal -->
      <div class="flex-1 flex flex-col overflow-hidden bg-[#F8F7F2]">
        <!-- Header -->
        <header class="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div>
            <h2 class="text-xl font-bold text-gray-800 tracking-tight">Gestión de Mesas</h2>
            <p class="text-sm text-gray-500 font-medium mt-0.5">Asignación y estado de mesas</p>
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

          <div class="relative z-10 max-w-7xl mx-auto flex flex-col gap-6">
            
            <!-- Resumen de Estados -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <p class="text-sm text-gray-500 font-medium">Libres</p>
                  <p class="text-2xl font-black text-gray-800">{{ mesasLibres() }}</p>
                </div>
              </div>
              <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <div>
                  <p class="text-sm text-gray-500 font-medium">Ocupadas</p>
                  <p class="text-2xl font-black text-gray-800">{{ mesasOcupadas() }}</p>
                </div>
              </div>
            </div>

            <!-- Filtros -->
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div class="flex gap-4 w-full md:w-auto">
                <div class="relative flex-1 md:w-64">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <input type="text" [ngModel]="filtroTexto()" (ngModelChange)="filtroTexto.set($event)" placeholder="Buscar por mesa N°..." class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none">
                </div>
                
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <select [ngModel]="filtroZona()" (ngModelChange)="filtroZona.set($event)" class="pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none appearance-none font-medium text-gray-700">
                    <option value="">Todas las Zonas</option>
                    @for (zona of zonasUnicas(); track zona) {
                      <option [value]="zona">{{ zona }}</option>
                    }
                  </select>
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Grilla de Mesas -->
            @if (cargando()) {
              <div class="flex justify-center py-12">
                <div class="w-12 h-12 border-4 border-red-200 border-t-[#B71C1C] rounded-full animate-spin"></div>
              </div>
            } @else {
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                
                @for (mesa of mesasFiltradas(); track mesa.id) {
                  <div 
                    [class.border-green-500]="mesa.estado === 'LIBRE'"
                    [class.border-red-500]="mesa.estado === 'OCUPADA' || mesa.estado === 'OCUPADO'"
                    [class.border-yellow-500]="mesa.estado === 'RESERVADA'"
                    class="bg-white border-2 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden">
                    
                    @if (mesa.estado === 'OCUPADA' || mesa.estado === 'OCUPADO') {
                      <div class="absolute inset-0 bg-red-50/50"></div>
                    }
                    @if (mesa.estado === 'RESERVADA') {
                      <div class="absolute inset-0 bg-yellow-50/50"></div>
                    }

                    <!-- Indicador de zona -->
                    @if (mesa.zona?.nombre) {
                      <div class="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded shadow-sm">
                        {{ mesa.zona?.nombre }}
                      </div>
                    }

                    <div class="relative z-10 flex flex-col items-center w-full mt-2">
                      <div 
                        [class.text-green-500]="mesa.estado === 'LIBRE'"
                        [class.text-red-600]="mesa.estado === 'OCUPADA' || mesa.estado === 'OCUPADO'"
                        [class.text-yellow-600]="mesa.estado === 'RESERVADA'"
                        class="font-bold mb-2 uppercase text-xs tracking-wider text-center">
                        {{ mesa.estado }}
                      </div>
                      
                      <div 
                        [class.bg-green-50]="mesa.estado === 'LIBRE'"
                        [class.bg-red-100]="mesa.estado === 'OCUPADA' || mesa.estado === 'OCUPADO'"
                        [class.bg-yellow-100]="mesa.estado === 'RESERVADA'"
                        class="w-16 h-16 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <span 
                          [class.text-green-700]="mesa.estado === 'LIBRE'"
                          [class.text-red-700]="mesa.estado === 'OCUPADA' || mesa.estado === 'OCUPADO'"
                          [class.text-yellow-700]="mesa.estado === 'RESERVADA'"
                          class="text-3xl font-black">
                          {{ mesa.numero }}
                        </span>
                      </div>
                      
                      @if (mesa.estado === 'OCUPADA' || mesa.estado === 'OCUPADO') {
                        <div class="text-red-900 text-xs font-semibold px-2 py-1 mb-1 bg-red-200 rounded-lg">
                          Ocupación: {{ mesa.ocupacionActual || 0 }}
                        </div>
                      }
                      
                      <div class="text-gray-400 text-xs font-medium">Capacidad: {{ mesa.capacidadMaxima }}</div>
                    </div>
                  </div>
                }
                
                @if (mesasFiltradas().length === 0) {
                  <div class="col-span-full text-center py-12 text-gray-500">
                    No se encontraron mesas que coincidan con la búsqueda.
                  </div>
                }
              </div>
            }
          </div>
        </main>
      </div>
    </div>
  `,
})
export class RecepcionMesasComponent implements OnInit {
  private readonly mesasService = inject(MesasService);
  
  readonly horaActual = signal(new Date());
  readonly mesas = signal<Mesa[]>([]);
  readonly cargando = signal(true);

  // Filtros
  readonly filtroTexto = signal('');
  readonly filtroZona = signal('');

  readonly mesasLibres = signal(0);
  readonly mesasOcupadas = signal(0);

  // Zonas únicas extraídas de las mesas
  readonly zonasUnicas = computed(() => {
    const zonas = this.mesas()
      .filter(m => m.zona && m.zona.nombre)
      .map(m => m.zona!.nombre);
    return [...new Set(zonas)].sort();
  });

  // Mesas filtradas por zona y texto
  readonly mesasFiltradas = computed(() => {
    let result = this.mesas();
    
    const texto = this.filtroTexto().trim().toLowerCase();
    if (texto) {
      result = result.filter(m => m.numero.toString().includes(texto) || m.estado.toLowerCase().includes(texto));
    }
    
    const zona = this.filtroZona();
    if (zona) {
      result = result.filter(m => m.zona?.nombre === zona);
    }
    
    return result;
  });
  
  constructor() {
    setInterval(() => {
      this.horaActual.set(new Date());
    }, 1000);
  }

  ngOnInit() {
    this.cargarMesas();
  }

  cargarMesas() {
    this.cargando.set(true);
    this.mesasService.getMesas().subscribe(data => {
      // Ordenar por numero de mesa
      const sortedMesas = data.sort((a, b) => a.numero - b.numero);
      this.mesas.set(sortedMesas);
      
      // Actualizar contadores
      this.mesasLibres.set(sortedMesas.filter(m => m.estado === 'LIBRE').length);
      this.mesasOcupadas.set(sortedMesas.filter(m => m.estado === 'OCUPADA' || m.estado === 'OCUPADO').length);
      
      this.cargando.set(false);
    });
  }
}
