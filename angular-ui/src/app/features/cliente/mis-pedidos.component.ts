import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { VentasService, PedidoResponse } from '../../core/services/ventas.service';
import { MesasService } from '../../core/services/mesas.service';
import { AuthService } from '../auth/auth.service';
import { DecimalPipe, DatePipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [SidebarComponent, DecimalPipe, NgClass],
  template: `
    <div class="flex h-dvh bg-[#F8F7F2] font-sans">
      <!-- Sidebar / Navbar lateral -->
      <app-sidebar class="w-64 flex-shrink-0" />

      <!-- Main Content -->
      <main class="flex-1 flex flex-col h-full overflow-hidden relative">
        <!-- Topbar -->
        <header class="bg-white/95 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-[#2E221B]/10 flex-shrink-0 z-10 sticky top-0">
          <div>
            <h1 class="text-2xl font-bold text-[#2E221B]">Mis Pedidos</h1>
            <p class="text-sm text-[#2E221B]/60 mt-1 flex items-center gap-2">
              @if (mesaNumero()) {
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E8A317]/10 text-[#b57a03] border border-[#E8A317]/20">
                  Mesa #{{ mesaNumero() }}
                </span>
              }
            </p>
          </div>
          
          <div class="flex items-center gap-4">
            <button (click)="cargarPedidos()" class="bg-white border border-[#2E221B]/10 hover:bg-gray-50 text-[#2E221B] px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-2 shadow-sm">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>
        </header>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-8">
          <div class="max-w-4xl mx-auto">
            
            @if (loading()) {
              <div class="flex flex-col items-center justify-center py-20 text-[#2E221B]/50">
                <svg class="animate-spin h-10 w-10 mb-4" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <p class="font-medium text-lg">Cargando tus pedidos...</p>
              </div>
            } @else if (pedidos().length === 0) {
              <div class="bg-white rounded-3xl border border-[#2E221B]/10 p-12 text-center shadow-sm">
                <div class="w-24 h-24 mx-auto bg-[#F8F7F2] rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-[#2E221B]/50">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-[#2E221B] mb-2">Aún no has hecho pedidos</h3>
                <p class="text-[#2E221B]/60 mb-8 max-w-md mx-auto">Ve al menú digital para explorar nuestros deliciosos platos y realizar tu primer pedido.</p>
              </div>
            } @else {
              <div class="space-y-6">
                @for (pedido of pedidos(); track pedido.id) {
                  <div class="bg-white rounded-2xl border border-[#2E221B]/10 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <!-- Header -->
                    <div class="px-6 py-4 border-b border-[#2E221B]/5 flex justify-between items-center bg-gray-50/50">
                      <div>
                        <span class="text-xs text-[#2E221B]/50 font-mono uppercase tracking-wider block mb-1">ID: {{ pedido.id.substring(0,8) }}</span>
                        <div class="flex items-center gap-3">
                          <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border"
                                [ngClass]="{
                                  'bg-amber-100 text-amber-800 border-amber-200': pedido.estado === 'PENDIENTE',
                                  'bg-blue-100 text-blue-800 border-blue-200': ['PREPARANDO', 'LISTO', 'ENTREGADO', 'EN_COCINA'].includes(pedido.estado),
                                  'bg-emerald-100 text-emerald-800 border-emerald-200': pedido.estado === 'SERVIDO',
                                  'bg-red-100 text-red-800 border-red-200': pedido.estado === 'CANCELADO',
                                  'bg-gray-100 text-gray-800 border-gray-200': pedido.estado === 'PAGADO'
                                }">
                            {{ ['PREPARANDO', 'LISTO', 'ENTREGADO', 'EN_COCINA'].includes(pedido.estado) ? 'EN COCINA' : pedido.estado }}
                          </span>
                        </div>
                      </div>
                      <div class="text-right">
                        <span class="text-2xl font-black text-[#B71C1C] block">S/ {{ pedido.total | number:'1.2-2' }}</span>
                      </div>
                    </div>
                    
                    <!-- Order Details -->
                    @if (pedido.detalles && pedido.detalles.length > 0) {
                      <div class="p-6">
                        <ul class="space-y-4">
                          @for (detalle of pedido.detalles; track detalle.id) {
                            <li class="flex justify-between items-start">
                              <div class="flex gap-4">
                                <div class="w-8 h-8 rounded-lg bg-[#E8A317]/10 flex items-center justify-center text-[#b57a03] font-bold shrink-0">
                                  {{ detalle.cantidad }}x
                                </div>
                                <div>
                                  <h4 class="font-bold text-[#2E221B]">{{ detalle.productoNombre }}</h4>
                                  @if (detalle.notas) {
                                    <p class="text-sm text-[#2E221B]/60 italic mt-0.5">Nota: {{ detalle.notas }}</p>
                                  }
                                </div>
                              </div>
                              <div class="font-medium text-[#2E221B]">
                                S/ {{ detalle.subtotal | number:'1.2-2' }}
                              </div>
                            </li>
                          }
                        </ul>
                        
                        <div class="mt-6 pt-4 border-t border-[#2E221B]/10 flex justify-end gap-6 text-sm">
                          <div class="text-right text-[#2E221B]/60">
                            Subtotal: S/ {{ pedido.subtotal | number:'1.2-2' }}
                          </div>
                          <div class="text-right font-medium text-[#2E221B]">
                            Total (Inc. IGV): S/ {{ pedido.total | number:'1.2-2' }}
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </main>
    </div>
  `
})
export class MisPedidosComponent implements OnInit, OnDestroy {
  private readonly ventasService = inject(VentasService);
  private readonly mesasService = inject(MesasService);
  private readonly authService = inject(AuthService);

  readonly pedidos = signal<PedidoResponse[]>([]);
  readonly loading = signal<boolean>(true);
  readonly mesaNumero = signal<number | null>(null);
  private productosMap = new Map<string, string>();
  
  private pollingInterval: any;

  ngOnInit() {
    this.cargarDatosMesa();
    this.cargarProductosYPedidos();
    
    // Polling cada 5 segundos
    this.pollingInterval = setInterval(() => {
      this.cargarPedidosSilencioso();
    }, 5000);
  }
  
  ngOnDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  cargarDatosMesa() {
    const sesionMesaId = sessionStorage.getItem('current_sesion_mesa_id');
    if (sesionMesaId) {
      this.mesasService.getSesionMesa(sesionMesaId).subscribe({
        next: (sesion) => {
          if (sesion.mesaId) {
            this.mesasService.getMesa(sesion.mesaId).subscribe({
              next: (mesa) => {
                this.mesaNumero.set(mesa.numero);
              }
            });
          }
        }
      });
    }
  }

  cargarProductosYPedidos() {
    this.loading.set(true);
    this.ventasService.getProductosActivos().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          res.data.forEach(p => this.productosMap.set(p.id, p.nombre));
        }
        this.cargarPedidosSilencioso();
      },
      error: () => {
        this.cargarPedidosSilencioso();
      }
    });
  }

  cargarPedidos() {
    this.loading.set(true);
    this.cargarPedidosSilencioso();
  }

  cargarPedidosSilencioso() {
    const sesionMesaId = sessionStorage.getItem('current_sesion_mesa_id');
    
    if (!sesionMesaId) {
      this.loading.set(false);
      return;
    }

    this.ventasService.getPedidosPorMesa(sesionMesaId).subscribe({
      next: (res) => {
        if (res.success) {
          // Asignar nombres de productos si faltan en la respuesta
          const pedidosConNombres = res.data.map(pedido => {
            pedido.detalles?.forEach(d => {
              if (!d.productoNombre) {
                d.productoNombre = this.productosMap.get(d.productoId) || 'Producto no encontrado';
              }
            });
            return pedido;
          });
          // Ordenar por más recientes (asumiendo que los últimos vienen al final o por fecha)
          this.pedidos.set(pedidosConNombres.reverse());
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar pedidos', err);
        this.loading.set(false);
      }
    });
  }
}
