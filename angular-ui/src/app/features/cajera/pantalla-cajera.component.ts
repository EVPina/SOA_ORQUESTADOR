import { Component, inject, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { MesasService, MesaResponse } from '../../core/services/mesas.service';
import { VentasService, PedidoResponse } from '../../core/services/ventas.service';
import { PagoService, PagoRequest } from '../../core/services/pago.service';
import { forkJoin, switchMap, catchError, of, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface MesaOcupada extends MesaResponse {
  sesionMesaId?: string;
  clienteId?: string;
  clienteNombre?: string;
  pedidosPorCobrar: PedidoResponse[];
  totalCuenta: number;
}

@Component({
  selector: 'app-pantalla-cajera',
  standalone: true,
  imports: [CommonModule, SidebarComponent, DecimalPipe, FormsModule],
  template: `
    <div class="min-h-screen bg-[#F8F7F2] flex">
      <app-sidebar class="w-64 flex-shrink-0" />
      
      <main class="flex-1 p-8 h-screen overflow-y-auto">
        <header class="mb-8 flex justify-between items-end">
          <div>
            <h1 class="text-3xl font-black text-[#2E221B] mb-2 tracking-tight">Caja</h1>
            <p class="text-[#2E221B]/60">Gestión de cobros y facturación</p>
          </div>
          <div class="flex gap-4">
            <button (click)="cargarDatos()" class="p-3 rounded-xl bg-white border border-[#2E221B]/10 text-[#2E221B] hover:bg-gray-50 transition-colors shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          </div>
        </header>

        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-20 text-[#2E221B]/50">
            <svg class="animate-spin h-10 w-10 mb-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p class="font-medium text-lg">Cargando cuentas...</p>
          </div>
        } @else if (mesasConCuenta().length === 0) {
          <div class="bg-white rounded-3xl border border-[#2E221B]/10 p-12 text-center shadow-sm">
            <div class="w-24 h-24 mx-auto bg-[#F8F7F2] rounded-full flex items-center justify-center mb-6 text-[#2E221B]/50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-[#2E221B] mb-2">No hay cuentas pendientes</h3>
            <p class="text-[#2E221B]/60">Todas las mesas están al día o no tienen pedidos por cobrar.</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            @for (mesa of mesasConCuenta(); track mesa.id) {
              <div class="bg-white rounded-3xl border border-[#2E221B]/10 overflow-hidden shadow-sm flex flex-col">
                <div class="p-6 border-b border-[#2E221B]/5 bg-gray-50/50 flex justify-between items-center">
                  <div>
                    <h3 class="text-xl font-bold text-[#2E221B]">Mesa #{{ mesa.numero }}</h3>
                    @if (mesa.clienteNombre) {
                      <p class="text-sm font-semibold text-[#B71C1C] mb-1">Cliente: {{ mesa.clienteNombre }}</p>
                    }
                    <p class="text-sm text-[#2E221B]/60">{{ mesa.pedidosPorCobrar.length }} pedido(s) por cobrar</p>
                  </div>
                  <div class="w-12 h-12 bg-[#2E221B] rounded-full flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                    </svg>
                  </div>
                </div>

                <div class="flex-1 p-6 overflow-y-auto max-h-64">
                  <div class="space-y-4">
                    @for (pedido of mesa.pedidosPorCobrar; track pedido.id) {
                      <div class="bg-[#F8F7F2] rounded-xl p-4 border border-[#2E221B]/5">
                        <div class="flex justify-between items-start mb-2">
                          <span class="text-xs font-mono text-[#2E221B]/50 uppercase">ID: {{ pedido.id.substring(0,6) }}</span>
                          <span class="text-xs font-bold px-2 py-1 rounded bg-orange-100 text-orange-800 uppercase">{{ pedido.estado }}</span>
                        </div>
                        <ul class="space-y-1 mb-3">
                          @for (det of pedido.detalles; track det.id) {
                            <li class="text-sm flex justify-between">
                              <span class="text-[#2E221B]/80">{{ det.cantidad }}x {{ det.productoNombre }}</span>
                              <span class="font-medium">S/ {{ det.subtotal | number:'1.2-2' }}</span>
                            </li>
                          }
                        </ul>
                        <div class="pt-2 border-t border-[#2E221B]/10 flex justify-between font-bold text-[#2E221B]">
                          <span>Subtotal:</span>
                          <span>S/ {{ pedido.total | number:'1.2-2' }}</span>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <div class="p-6 border-t border-[#2E221B]/10 bg-white">
                  <div class="flex justify-between items-center mb-6">
                    <span class="text-[#2E221B]/60 font-medium">TOTAL A COBRAR</span>
                    <span class="text-3xl font-black text-[#B71C1C]">S/ {{ mesa.totalCuenta | number:'1.2-2' }}</span>
                  </div>

                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-bold text-[#2E221B] mb-2">Método de Pago</label>
                      <select [(ngModel)]="metodosPagoSeleccionados[mesa.id]" class="w-full bg-[#F8F7F2] border border-[#2E221B]/20 rounded-xl px-4 py-3 outline-none focus:border-[#E8A317] transition-colors">
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="TARJETA">Tarjeta (POS)</option>
                        <option value="YAPE">Yape</option>
                        <option value="PLIN">Plin</option>
                      </select>
                    </div>

                    <button 
                      (click)="cobrarCuenta(mesa)"
                      [disabled]="procesandoCobro[mesa.id]"
                      class="w-full bg-[#E8A317] hover:bg-[#b57a03] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-[0_4px_14px_0_rgba(232,163,23,0.39)] hover:shadow-[0_6px_20px_rgba(232,163,23,0.23)] transition-all flex items-center justify-center gap-2">
                      @if (procesandoCobro[mesa.id]) {
                        <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        <span>Procesando...</span>
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <span>Cobrar y Facturar</span>
                      }
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `
})
export class PantallaCajeraComponent implements OnInit, OnDestroy {
  private readonly mesasService = inject(MesasService);
  private readonly ventasService = inject(VentasService);
  private readonly pagoService = inject(PagoService);
  private readonly http = inject(HttpClient);

  readonly loading = signal(true);
  readonly mesasConCuenta = signal<MesaOcupada[]>([]);
  
  metodosPagoSeleccionados: Record<string, string> = {};
  procesandoCobro: Record<string, boolean> = {};
  private pollingInterval: any;

  ngOnInit() {
    this.cargarDatos();
    
    // Auto-refresco cada 10 segundos
    this.pollingInterval = setInterval(() => {
      if (Object.values(this.procesandoCobro).every(v => !v)) {
        this.cargarDatosSilencioso();
      }
    }, 10000);
  }

  ngOnDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  cargarDatos() {
    this.loading.set(true);
    this.cargarDatosSilencioso();
  }

  cargarDatosSilencioso() {
    console.log('Iniciando cargarDatosSilencioso');
    // 1. Obtener todas las mesas
    this.mesasService.getMesas().subscribe({
      next: (mesas) => {
        console.log('Mesas obtenidas:', mesas);
        // Filtrar mesas ocupadas
        const mesasOcupadas = mesas.filter(m => m.estado === 'OCUPADA');
        console.log('Mesas ocupadas:', mesasOcupadas);
        
        if (mesasOcupadas.length === 0) {
          this.mesasConCuenta.set([]);
          this.loading.set(false);
          return;
        }

        // 2. Para cada mesa ocupada, obtener su sesión activa y pedidos
        const peticiones = mesasOcupadas.map(mesa => {
          console.log('Consultando sesion para mesa:', mesa.id);
          return this.mesasService.getSesionMesaActiva(mesa.id).pipe(
            switchMap(sesion => {
              console.log('Sesion obtenida para mesa', mesa.id, ':', sesion);
              if (!sesion || !sesion.id) {
                console.log('No hay sesion valida para mesa', mesa.id);
                return of(null);
              }
              return this.ventasService.getPedidosPorMesa(sesion.id).pipe(
                switchMap(res => {
                  const pedidos = res.data || [];
                  console.log('Pedidos para sesion', sesion.id, ':', pedidos);
                  // Solo cobrar pedidos que no estén PAGADOS ni CANCELADOS
                  const pedidosPorCobrar = pedidos.filter(p => p.estado !== 'PAGADO' && p.estado !== 'CANCELADO');
                  if (pedidosPorCobrar.length === 0) return of(null);
                  
                  const totalCuenta = pedidosPorCobrar.reduce((sum, p) => sum + p.total, 0);
                  
                  // Iniciar método de pago por defecto si no existe
                  if (!this.metodosPagoSeleccionados[mesa.id]) {
                    this.metodosPagoSeleccionados[mesa.id] = 'EFECTIVO';
                  }

                  const mesaData: MesaOcupada = {
                    ...mesa,
                    sesionMesaId: sesion.id,
                    clienteId: sesion.clienteId,
                    pedidosPorCobrar,
                    totalCuenta
                  };

                  if (sesion.clienteId) {
                    return this.http.get<any>(`${environment.apiUrl}/clientes/${sesion.clienteId}`).pipe(
                      map(clienteRes => {
                        const cliente = clienteRes.data || clienteRes;
                        if (cliente && (cliente.nombre || cliente.apellido)) {
                          mesaData.clienteNombre = `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim();
                        }
                        return mesaData;
                      }),
                      catchError(() => of(mesaData))
                    );
                  }

                  return of(mesaData);
                }),
                catchError((err) => {
                  console.error('Error en getPedidosPorMesa para sesion', sesion.id, err);
                  return of(null);
                })
              );
            }),
            catchError((err) => {
              console.error('Error en getSesionMesaActiva para mesa', mesa.id, err);
              return of(null);
            })
          );
        });

        console.log('Ejecutando forkJoin con', peticiones.length, 'peticiones');
        forkJoin(peticiones).subscribe({
          next: (resultados) => {
            console.log('Resultados forkJoin:', resultados);
            const mesasFinales = resultados.filter(r => r !== null) as MesaOcupada[];
            this.mesasConCuenta.set(mesasFinales);
            this.loading.set(false);
          },
          error: (err) => {
            console.error('Error en forkJoin', err);
            this.loading.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error cargando mesas', err);
        this.loading.set(false);
      }
    });
  }

  cobrarCuenta(mesa: MesaOcupada) {
    if (!mesa.sesionMesaId || mesa.pedidosPorCobrar.length === 0) return;
    
    this.procesandoCobro[mesa.id] = true;
    const metodoPago = this.metodosPagoSeleccionados[mesa.id] || 'EFECTIVO';

    // Generar un pago por cada pedido de la cuenta
    const peticionesPago = mesa.pedidosPorCobrar.map(pedido => {
      const request: PagoRequest = {
        pedidoId: pedido.id,
        metodoPago: metodoPago,
        monto: pedido.total
      };
      return this.pagoService.registrarPago(request).pipe(
        catchError(err => {
          console.error(`Error pagando pedido ${pedido.id}`, err);
          return of(null);
        })
      );
    });

    forkJoin(peticionesPago).subscribe({
      next: () => {
        // Al terminar de pagar todos los pedidos, liberamos la mesa? 
        // Opcional: Para simplificar, solo refrescamos. El mozo debería liberar la mesa, o la cajera.
        // Si todos los pedidos se pagaron, desaparecerán de esta lista en el refresh.
        alert(`¡Cuenta de Mesa #${mesa.numero} cobrada exitosamente con ${metodoPago}!`);
        this.procesandoCobro[mesa.id] = false;
        this.cargarDatos(); // Recargar
      },
      error: () => {
        alert('Hubo un error al procesar el cobro.');
        this.procesandoCobro[mesa.id] = false;
      }
    });
  }
}
