import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar.component';
import { DatePipe } from '@angular/common';
import { UsuariosService, Usuario } from '../usuarios/usuarios.service';
import { MesasService, Mesa } from '../../recepcion/mesas/mesas.service';

@Component({
  selector: 'app-admin-mozos',
  imports: [CommonModule, SidebarComponent, DatePipe, FormsModule],
  template: `
    <div class="h-dvh w-full bg-[#F8F7F2] flex">
      <app-sidebar />

      <div class="flex-1 flex flex-col overflow-hidden bg-[#F8F7F2]">
        <header class="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div>
            <h2 class="text-xl font-bold text-gray-800 tracking-tight">Gestión de Mozos</h2>
            <p class="text-sm text-gray-500 font-medium mt-0.5">Administración y asignación de mesas</p>
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

        <main class="flex-1 overflow-auto p-8 relative">
          <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#B71C1C 1px, transparent 1px); background-size: 24px 24px;"></div>

          <div class="relative z-10 max-w-7xl mx-auto flex flex-col gap-6">
            
            <!-- Filtros -->
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div class="flex gap-4 w-full md:w-auto">
                <div class="relative flex-1 md:w-64">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <input type="text" [ngModel]="filtroMozoTexto()" (ngModelChange)="filtroMozoTexto.set($event)" placeholder="Buscar mozo o mesa N°..." class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none">
                </div>
                
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <select [ngModel]="filtroMozoZona()" (ngModelChange)="filtroMozoZona.set($event)" class="pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none appearance-none font-medium text-gray-700">
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

            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-100">
                    <th class="p-4 font-semibold text-gray-600 text-sm tracking-wide">Mozo</th>
                    <th class="p-4 font-semibold text-gray-600 text-sm tracking-wide">Correo</th>
                    <th class="p-4 font-semibold text-gray-600 text-sm tracking-wide">Estado</th>
                    <th class="p-4 font-semibold text-gray-600 text-sm tracking-wide">Mesas Asignadas</th>
                    <th class="p-4 font-semibold text-gray-600 text-sm tracking-wide text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (mozo of mozosFiltrados(); track mozo.id) {
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="p-4">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                            {{ mozo.nombreCompleto.substring(0, 2).toUpperCase() }}
                          </div>
                          <div>
                            <p class="font-bold text-gray-900">{{ mozo.nombreCompleto }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="p-4">
                        <p class="text-gray-900 font-medium">{{ mozo.dni !== 'No registrado' ? mozo.dni : mozo.email }}</p>
                      </td>
                      <td class="p-4">
                        <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{{ mozo.estado }}</span>
                      </td>
                      <td class="p-4">
                        <div class="flex flex-wrap gap-1">
                          @if (!mozo.mesasAsignadas?.length) {
                            <span class="text-gray-400 text-sm italic">Sin mesas</span>
                          }
                          @for (mesaId of mozo.mesasAsignadas; track mesaId) {
                            <span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">
                              Mesa {{ getMesaNumero(mesaId) }}
                            </span>
                          }
                        </div>
                      </td>
                      <td class="p-4 text-right">
                        <button (click)="abrirModalAsignacion(mozo)" class="bg-[#2E221B] hover:bg-black text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 inline-flex">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                          Asignar Mesa
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="p-8 text-center text-gray-500">
                        @if (cargando()) {
                          <div class="flex justify-center py-4">
                            <div class="w-8 h-8 border-4 border-red-200 border-t-[#B71C1C] rounded-full animate-spin"></div>
                          </div>
                          <p>Cargando mozos...</p>
                        } @else if (mozos().length > 0) {
                          <p>No se encontraron mozos que coincidan con la búsqueda.</p>
                        } @else {
                          <p>No se encontraron mozos registrados en el sistema.</p>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            
          </div>
        </main>
      </div>

      <!-- Modal de Asignación -->
      @if (mozoSeleccionado()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <h3 class="text-xl font-bold text-gray-900">Asignar Mesas</h3>
                <p class="text-sm text-gray-500 mt-1">Mozo: <span class="font-semibold text-gray-800">{{ mozoSeleccionado()?.nombreCompleto }}</span></p>
              </div>
              <button (click)="cerrarModal()" class="text-gray-400 hover:text-gray-600 bg-white rounded-full p-2 shadow-sm border border-gray-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div class="p-4 border-b border-gray-100 bg-gray-50 flex gap-3">
              <div class="relative flex-1">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input type="text" [ngModel]="filtroTexto()" (ngModelChange)="filtroTexto.set($event)" placeholder="Buscar N°..." class="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none">
              </div>
              <div class="relative w-40">
                <select [ngModel]="filtroZona()" (ngModelChange)="filtroZona.set($event)" class="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none appearance-none font-medium text-gray-600 bg-white">
                  <option value="">Todas Zonas</option>
                  @for (zona of zonasUnicas(); track zona) {
                    <option [value]="zona">{{ zona }}</option>
                  }
                </select>
                <div class="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div class="p-6 overflow-y-auto flex-1 bg-white">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-sm font-bold text-gray-700 uppercase tracking-wider">Seleccione las mesas</h4>
                <span class="text-xs font-bold text-gray-400">{{ mesasFiltradas().length }} mesas</span>
              </div>
              
              @if (mesasFiltradas().length === 0) {
                <p class="text-gray-500 text-center py-4">No hay mesas disponibles que coincidan.</p>
              } @else {
                <div class="grid grid-cols-3 gap-3">
                  @for (mesa of mesasFiltradas(); track mesa.id) {
                    <button 
                      (click)="!estaAsignadaAOtroMozo(mesa.id) ? toggleAsignacion(mesa.id) : null"
                      [class.opacity-50]="estaAsignadaAOtroMozo(mesa.id)"
                      [class.cursor-not-allowed]="estaAsignadaAOtroMozo(mesa.id)"
                      [class.bg-gray-100]="estaAsignadaAOtroMozo(mesa.id)"
                      [class.ring-2]="estaAsignada(mesa.id)"
                      [class.ring-red-500]="estaAsignada(mesa.id)"
                      [class.bg-red-50]="estaAsignada(mesa.id)"
                      [class.border-red-200]="estaAsignada(mesa.id)"
                      [class.hover:bg-gray-50]="!estaAsignadaAOtroMozo(mesa.id)"
                      class="border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all relative">
                      
                      @if (estaAsignada(mesa.id)) {
                        <div class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                        </div>
                      }
                      
                      @if (estaAsignadaAOtroMozo(mesa.id)) {
                        <div class="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full p-1 shadow-md" title="Asignada a otro mozo">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                      }
                      
                      <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-lg">
                        {{ mesa.numero }}
                      </div>
                      @if (mesa.estado === 'OCUPADA' || mesa.estado === 'OCUPADO') {
                        <div class="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
                          Ocup: {{ mesa.ocupacionActual || 0 }}
                        </div>
                      }
                      <span class="text-xs text-gray-500 font-medium">Cap: {{ mesa.capacidadMaxima }}</span>
                    </button>
                  }
                </div>
              }
            </div>
            
            <div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button (click)="cerrarModal()" class="px-5 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                Terminar
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminMozosComponent implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  private readonly mesasService = inject(MesasService);

  readonly horaActual = signal(new Date());
  readonly mozos = signal<Usuario[]>([]);
  readonly cargando = signal(true);

  readonly mesasDisponibles = signal<Mesa[]>([]);
  readonly mozoSeleccionado = signal<Usuario | null>(null);

  // Filtros para el Modal (Mesas)
  readonly filtroTexto = signal('');
  readonly filtroZona = signal('');

  // Filtros para la vista principal (Mozos)
  readonly filtroMozoTexto = signal('');
  readonly filtroMozoZona = signal('');

  // Zonas únicas extraídas de las mesas disponibles (para ambos filtros)
  readonly zonasUnicas = computed(() => {
    const zonas = this.mesasDisponibles()
      .filter(m => m.zona && m.zona.nombre)
      .map(m => m.zona!.nombre);
    return [...new Set(zonas)].sort();
  });

  // Mozos filtrados en la vista principal
  readonly mozosFiltrados = computed(() => {
    let result = this.mozos();
    const texto = this.filtroMozoTexto().trim().toLowerCase();
    const zona = this.filtroMozoZona();

    if (texto) {
      result = result.filter(mozo => {
        if (mozo.nombreCompleto.toLowerCase().includes(texto)) return true;
        if (mozo.email.toLowerCase().includes(texto)) return true;

        if (mozo.mesasAsignadas) {
          const tieneMesa = mozo.mesasAsignadas.some(mesaId => {
            const numero = this.getMesaNumero(mesaId).toString().toLowerCase();
            return numero.includes(texto) || `mesa ${numero}`.includes(texto);
          });
          if (tieneMesa) return true;
        }
        return false;
      });
    }

    if (zona) {
      result = result.filter(mozo => {
        if (!mozo.mesasAsignadas) return false;
        return mozo.mesasAsignadas.some(mesaId => {
          const mesa = this.mesasDisponibles().find(m => m.id === mesaId);
          return mesa && mesa.zona && mesa.zona.nombre === zona;
        });
      });
    }

    return result;
  });

  // Mesas filtradas por zona y texto (para el Modal)
  readonly mesasFiltradas = computed(() => {
    let result = this.mesasDisponibles();

    const texto = this.filtroTexto().trim().toLowerCase();
    if (texto) {
      result = result.filter(m => m.numero.toString().includes(texto));
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
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando.set(true);
    this.usuariosService.getMozos().subscribe(data => {
      this.mozos.set(data);
      this.cargando.set(false);

      // Cargar asignaciones para cada mozo
      data.forEach(mozo => {
        this.usuariosService.getAsignacionesPorMozo(mozo.id).subscribe(mesas => {
          mozo.mesasAsignadas = mesas;
        });
      });
    });

    this.mesasService.getMesas().subscribe(data => {
      this.mesasDisponibles.set(data);
    });
  }

  abrirModalAsignacion(mozo: Usuario) {
    this.mozoSeleccionado.set(mozo);
  }

  cerrarModal() {
    this.mozoSeleccionado.set(null);
  }

  estaAsignada(mesaId: string): boolean {
    const mozo = this.mozoSeleccionado();
    if (!mozo) return false;
    return mozo.mesasAsignadas?.includes(mesaId) ?? false;
  }

  estaAsignadaAOtroMozo(mesaId: string): boolean {
    const mozoSeleccionado = this.mozoSeleccionado();
    if (!mozoSeleccionado) return false;

    return this.mozos().some(m => m.id !== mozoSeleccionado.id && m.mesasAsignadas?.includes(mesaId));
  }

  toggleAsignacion(mesaId: string) {
    const mozo = this.mozoSeleccionado();
    if (!mozo) return;

    const asignado = this.estaAsignada(mesaId);

    // UI Optimista
    if (!mozo.mesasAsignadas) mozo.mesasAsignadas = [];
    if (asignado) {
      mozo.mesasAsignadas = mozo.mesasAsignadas.filter(id => id !== mesaId);
      this.usuariosService.desasignarMesa(mozo.id, mesaId).subscribe();
    } else {
      mozo.mesasAsignadas.push(mesaId);
      this.usuariosService.asignarMesa(mozo.id, mesaId).subscribe();
    }
  }

  getMesaNumero(mesaId: string): number | string {
    const mesa = this.mesasDisponibles().find(m => m.id === mesaId);
    return mesa ? mesa.numero : mesaId.substring(0, 4);
  }
}
