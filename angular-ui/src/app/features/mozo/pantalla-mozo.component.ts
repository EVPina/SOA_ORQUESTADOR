import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { AuthService } from '../auth/auth.service';
import { UsuariosService } from '../admin/usuarios/usuarios.service';
import { MesasService, MesaResponse } from '../../core/services/mesas.service';
import { VentasService, PedidoResponse } from '../../core/services/ventas.service';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';

interface MesaAsignada extends MesaResponse {
  sesionMesaId?: string;
  pedidosActivos: PedidoResponse[];
  loadingPedidos: boolean;
}

@Component({
  selector: 'app-pantalla-mozo',
  standalone: true,
  imports: [SidebarComponent, NgClass, DecimalPipe],
  template: `
    <div class="flex h-dvh bg-[#F8F7F2] font-sans">
      <app-sidebar class="w-64 flex-shrink-0" />

      <main class="flex-1 flex flex-col h-full overflow-hidden relative">
        <header class="bg-white/95 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-[#2E221B]/10 flex-shrink-0 z-10 sticky top-0">
          <div>
            <h1 class="text-2xl font-bold text-[#2E221B]">Mis Mesas y Pedidos</h1>
            <p class="text-sm text-[#2E221B]/60 mt-1">Mozo: <span class="font-bold text-[#B71C1C]">{{ authService.user()?.nombreCompleto }}</span></p>
          </div>
          
          <div class="flex items-center gap-4">
            <button (click)="cargarDatos()" class="bg-[#B71C1C] hover:bg-[#9a1717] text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-2 shadow-sm">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar Pedidos
            </button>
          </div>
        </header>

        <div class="flex-1 overflow-y-auto p-8">
          @if (loading()) {
            <div class="flex flex-col items-center justify-center py-20 text-[#2E221B]/50">
              <div class="w-10 h-10 border-4 border-red-200 border-t-[#B71C1C] rounded-full animate-spin mb-4"></div>
              <p class="font-medium text-lg">Cargando mesas asignadas...</p>
            </div>
          } @else if (mesas().length === 0) {
            <div class="bg-white rounded-3xl border border-[#2E221B]/10 p-12 text-center shadow-sm max-w-2xl mx-auto mt-10">
              <div class="w-24 h-24 mx-auto bg-[#F8F7F2] rounded-full flex items-center justify-center mb-6">
                <svg class="w-12 h-12 text-[#2E221B]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <h3 class="text-2xl font-bold text-[#2E221B] mb-2">No tienes mesas asignadas</h3>
              <p class="text-[#2E221B]/60 max-w-md mx-auto">Por el momento, Recepción no te ha asignado ninguna mesa. Espera o consulta con la recepcionista.</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
              @for (mesa of mesas(); track mesa.id) {
                <div class="bg-white rounded-2xl border flex flex-col h-full overflow-hidden shadow-sm transition-all"
                     [ngClass]="{
                       'border-[#B71C1C]/30 shadow-md ring-1 ring-[#B71C1C]/10': mesa.estado === 'OCUPADA',
                       'border-gray-200': mesa.estado !== 'OCUPADA'
                     }">
                  <!-- Cabecera de la Mesa -->
                  <div class="px-5 py-4 border-b flex justify-between items-center"
                       [ngClass]="{
                         'bg-red-50/50 border-red-100': mesa.estado === 'OCUPADA',
                         'bg-gray-50 border-gray-100': mesa.estado !== 'OCUPADA'
                       }">
                    <div class="flex items-center gap-3">
                      <div class="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl"
                           [ngClass]="{
                             'bg-[#B71C1C] text-white': mesa.estado === 'OCUPADA',
                             'bg-gray-200 text-gray-600': mesa.estado !== 'OCUPADA'
                           }">
                        {{ mesa.numero }}
                      </div>
                      <div>
                        <h2 class="font-bold text-[#2E221B] text-lg leading-tight">Mesa {{ mesa.numero }}</h2>
                        <div class="flex items-center gap-2 mt-0.5">
                          @if (mesa.zona) {
                            <span class="text-xs font-medium text-gray-500 flex items-center gap-1">
                              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {{ mesa.zona.nombre }}
                            </span>
                          }
                          <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span class="text-xs font-bold"
                                [ngClass]="{
                                  'text-red-600': mesa.estado === 'OCUPADA',
                                  'text-green-600': mesa.estado === 'LIBRE'
                                }">{{ mesa.estado }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Contenido de la Mesa (Pedidos) -->
                  <div class="flex-1 p-5 bg-gray-50/30">
                    @if (mesa.estado === 'LIBRE') {
                      <div class="flex flex-col items-center justify-center h-full text-center py-8 opacity-50">
                        <svg class="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4M8 16l-4-4 4-4M16 8l4 4-4 4" /></svg>
                        <p class="font-medium text-gray-600">Mesa desocupada</p>
                      </div>
                    } @else if (mesa.loadingPedidos) {
                      <div class="flex justify-center py-8">
                        <div class="w-6 h-6 border-2 border-red-200 border-t-[#B71C1C] rounded-full animate-spin"></div>
                      </div>
                    } @else if (mesa.pedidosActivos.length === 0) {
                      <div class="text-center py-8 text-gray-500">
                        <p class="text-sm font-medium">Mesa ocupada, pero aún no han realizado pedidos.</p>
                      </div>
                    } @else {
                      <div class="space-y-4">
                        @for (pedido of mesa.pedidosActivos; track pedido.id) {
                          <div class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm relative overflow-hidden">
                            <div class="absolute top-0 left-0 w-1 h-full"
                                 [ngClass]="{
                                   'bg-amber-400': pedido.estado === 'PENDIENTE',
                                   'bg-blue-400': pedido.estado === 'PREPARANDO',
                                   'bg-green-400': pedido.estado === 'LISTO' || pedido.estado === 'ENTREGADO',
                                   'bg-emerald-600': pedido.estado === 'SERVIDO'
                                 }"></div>
                            
                            <div class="flex justify-between items-start mb-3 pl-2">
                              <div>
                                <span class="text-[10px] text-gray-400 font-mono block uppercase">ID: {{ pedido.id.substring(0,6) }}</span>
                                <span class="text-xs font-bold text-gray-700 mt-1 line-clamp-1 flex items-center gap-1.5">
                                  <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                  {{ pedido.clienteNombre || 'Cargando cliente...' }}
                                </span>
                                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1.5"
                                      [ngClass]="{
                                        'bg-amber-50 text-amber-700 border border-amber-200': pedido.estado === 'PENDIENTE',
                                        'bg-blue-50 text-blue-700 border border-blue-200': pedido.estado === 'PREPARANDO',
                                        'bg-green-50 text-green-700 border border-green-200': pedido.estado === 'LISTO' || pedido.estado === 'ENTREGADO',
                                        'bg-emerald-50 text-emerald-800 border border-emerald-200': pedido.estado === 'SERVIDO'
                                      }">
                                  {{ pedido.estado }}
                                </span>
                              </div>
                              <span class="font-black text-[#B71C1C]">S/ {{ pedido.total | number:'1.2-2' }}</span>
                            </div>

                            <div class="pl-2 space-y-2">
                              @for (detalle of pedido.detalles; track detalle.id) {
                                <div class="flex gap-2 text-sm">
                                  <span class="font-bold text-gray-700 min-w-[20px]">{{ detalle.cantidad }}x</span>
                                  <div class="flex-1">
                                    <span class="text-gray-900 font-medium">{{ detalle.productoNombre }}</span>
                                    @if (detalle.notas) {
                                      <p class="text-xs text-gray-500 italic mt-0.5">{{ detalle.notas }}</p>
                                    }
                                  </div>
                                </div>
                              }
                            </div>
                            
                            @if (pedido.estado === 'ENTREGADO') {
                              <div class="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                                <button (click)="marcarServido(pedido, mesa)" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors shadow-sm">
                                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  Entregar al Cliente
                                </button>
                              </div>
                            }
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </main>
    </div>
  `
})
export class PantallaMozoComponent implements OnInit, OnDestroy {
  readonly authService = inject(AuthService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly mesasService = inject(MesasService);
  private readonly ventasService = inject(VentasService);

  readonly loading = signal(true);
  readonly mesas = signal<MesaAsignada[]>([]);
  private productosMap = new Map<string, string>();
  private pollingInterval: any;

  ngOnInit() {
    this.cargarProductosYDatos();
    
    // Polling cada 5 segundos para actualizar los pedidos de las mesas
    this.pollingInterval = setInterval(() => {
      this.cargarPedidosDeMesas();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
  cargarProductosYDatos() {
    this.loading.set(true);
    this.ventasService.getProductosActivos().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          res.data.forEach(p => this.productosMap.set(p.id, p.nombre));
        }
        this.cargarDatos();
      },
      error: () => {
        this.cargarDatos();
      }
    });
  }

  cargarDatos() {
    const user = this.authService.user();
    if (!user) return;
    
    this.loading.set(true);

    // 1. Obtener mesas asignadas al mozo
    this.usuariosService.getAsignacionesPorMozo(user.id).pipe(
      switchMap(mesaIds => {
        if (mesaIds.length === 0) {
          return of([]);
        }
        
        // 2. Obtener detalles de cada mesa
        const mesaRequests = mesaIds.map(id => this.mesasService.getMesa(id));
        return forkJoin(mesaRequests);
      })
    ).subscribe({
      next: (mesasData) => {
        // Inicializar los datos extendidos para la vista del mozo
        const mesasMapeadas: MesaAsignada[] = mesasData.map(m => ({
          ...m,
          pedidosActivos: [],
          loadingPedidos: false
        })).sort((a, b) => a.numero - b.numero); // Ordenar por número
        
        this.mesas.set(mesasMapeadas);
        this.loading.set(false);

        // 3. Cargar pedidos para las mesas ocupadas
        this.cargarPedidosDeMesas();
      },
      error: (err) => {
        console.error('Error cargando mesas asignadas:', err);
        this.loading.set(false);
      }
    });
  }

  cargarPedidosDeMesas() {
    const currentMesas = this.mesas();
    
    currentMesas.forEach(mesa => {
      if (mesa.estado === 'OCUPADA') {
        // Marcamos como cargando
        mesa.loadingPedidos = true;
        this.mesas.set([...currentMesas]); // Forzar reactividad
        
        // A. Buscar sesión activa
        this.mesasService.getSesionMesaActiva(mesa.id).pipe(
          switchMap(sesion => {
            mesa.sesionMesaId = sesion.id;
            // B. Si hay sesión, buscar sus pedidos activos
            return this.ventasService.getPedidosPorMesa(sesion.id);
          }),
          catchError(() => {
            // Si no hay sesión activa (ej 404), o fallan los pedidos, retornamos vacío
            return of({ success: true, data: [] });
          })
        ).subscribe({
          next: (res) => {
            if (res.success) {
              mesa.pedidosActivos = res.data.map(pedido => {
                pedido.detalles?.forEach(d => {
                  if (!d.productoNombre) {
                    d.productoNombre = this.productosMap.get(d.productoId) || 'Producto no encontrado';
                  }
                });
                return pedido;
              });
              // Fetch client name for each order
              mesa.pedidosActivos.forEach(pedido => {
                if (pedido.clienteId) {
                  this.usuariosService.getClienteById(pedido.clienteId).subscribe({
                    next: (u) => {
                      pedido.clienteNombre = u.nombreCompleto;
                      this.mesas.set([...currentMesas]); // trigger reactivity
                    }
                  });
                }
              });
            }
            mesa.loadingPedidos = false;
            this.mesas.set([...currentMesas]);
          },
          error: () => {
            mesa.loadingPedidos = false;
            this.mesas.set([...currentMesas]);
          }
        });
      }
    });
  }

  marcarServido(pedido: any, mesa: MesaAsignada) {
    // Optimistic update
    const previousState = pedido.estado;
    pedido.estado = 'SERVIDO';
    this.mesas.set([...this.mesas()]);

    this.ventasService.actualizarEstadoPedido(pedido.id, 'SERVIDO').subscribe({
      next: () => {
        setTimeout(() => this.cargarPedidosDeMesas(), 1000);
      },
      error: (err) => {
        console.error('Error al servir pedido', err);
        pedido.estado = previousState;
        this.mesas.set([...this.mesas()]);
      }
    });
  }
}
