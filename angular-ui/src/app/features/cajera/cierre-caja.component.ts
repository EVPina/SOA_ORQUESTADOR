import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { VentasService, PedidoResponse } from '../../core/services/ventas.service';

@Component({
  selector: 'app-cierre-caja',
  standalone: true,
  imports: [CommonModule, SidebarComponent, DecimalPipe],
  template: `
    <div class="min-h-screen bg-[#F8F7F2] flex">
      <app-sidebar class="w-64 flex-shrink-0" />
      
      <main class="flex-1 p-8 h-screen overflow-y-auto">
        <header class="mb-8">
          <h1 class="text-3xl font-black text-[#2E221B] mb-2 tracking-tight">Cierre del Día</h1>
          <p class="text-[#2E221B]/60">Resumen de ventas y pedidos cobrados hoy</p>
        </header>

        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-20 text-[#2E221B]/50">
            <svg class="animate-spin h-10 w-10 mb-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p class="font-medium text-lg">Cargando reporte del día...</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#2E221B]/10 relative overflow-hidden">
              <div class="absolute -right-4 -bottom-4 text-[#E8A317]/10">
                <svg class="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.43-2.81 3.1-3.14V3.91h2.67v1.93c1.38.28 2.53 1.15 2.68 2.62h-1.96c-.15-.81-.76-1.39-2.05-1.39-1.49 0-2.18.79-2.18 1.48 0 .72.5 1.43 2.82 1.98 2.61.64 4.02 1.68 4.02 3.82 0 1.97-1.4 3.09-3.32 3.42z"/></svg>
              </div>
              <p class="text-[#2E221B]/60 font-bold mb-1 relative z-10">Ingresos Totales (Hoy)</p>
              <p class="text-4xl font-black text-[#B71C1C] relative z-10">S/ {{ (resumenVentas()?.ventasTotales || 0) | number:'1.2-2' }}</p>
            </div>
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#2E221B]/10">
              <p class="text-[#2E221B]/60 font-bold mb-1">Pedidos Pagados</p>
              <p class="text-4xl font-black text-[#2E221B]">{{ resumenVentas()?.pedidosPagados || 0 }}</p>
            </div>
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#2E221B]/10">
              <p class="text-[#2E221B]/60 font-bold mb-1">Ticket Promedio</p>
              <p class="text-4xl font-black text-[#2E221B]">
                S/ {{ (resumenVentas()?.pedidosPagados ? (resumenVentas()?.ventasTotales / resumenVentas()?.pedidosPagados) : 0) | number:'1.2-2' }}
              </p>
            </div>
          </div>

          <div class="bg-white rounded-3xl shadow-sm border border-[#2E221B]/10 overflow-hidden">
             <div class="p-6 border-b border-[#2E221B]/10 bg-gray-50 flex items-center gap-3">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-[#2E221B]"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
               <h2 class="text-xl font-bold text-[#2E221B]">Historial de Pedidos Pagados (Hoy)</h2>
             </div>
             <div class="overflow-x-auto">
               <table class="w-full text-left">
                  <thead class="bg-white border-b border-[#2E221B]/10">
                    <tr>
                      <th class="p-4 font-bold text-sm text-[#2E221B]/60">ID Pedido</th>
                      <th class="p-4 font-bold text-sm text-[#2E221B]/60">Origen</th>
                      <th class="p-4 font-bold text-sm text-[#2E221B]/60">Estado</th>
                      <th class="p-4 font-bold text-sm text-[#2E221B]/60 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (pedido of pedidosPagados(); track pedido.id) {
                      <tr class="border-b border-[#2E221B]/5 hover:bg-[#F8F7F2] transition-colors">
                        <td class="p-4 font-mono text-sm text-[#2E221B]">{{ pedido.id.substring(0,8) }}</td>
                        <td class="p-4 font-semibold text-[#2E221B]/80">{{ pedido.origen }}</td>
                        <td class="p-4">
                          <span class="px-2 py-1 text-xs font-bold rounded bg-green-100 text-green-800">
                            {{ pedido.estado }}
                          </span>
                        </td>
                        <td class="p-4 text-right font-black text-[#B71C1C]">S/ {{ pedido.total | number:'1.2-2' }}</td>
                      </tr>
                    }
                    @if (pedidosPagados().length === 0) {
                      <tr>
                        <td colspan="4" class="p-12 text-center text-[#2E221B]/50 font-medium">
                          <div class="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                          </div>
                          No hay cobros registrados en este día.
                        </td>
                      </tr>
                    }
                  </tbody>
               </table>
             </div>
          </div>
        }
      </main>
    </div>
  `
})
export class CierreCajaComponent implements OnInit {
  private readonly ventasService = inject(VentasService);

  readonly loading = signal(true);
  readonly resumenVentas = signal<any>(null);
  readonly pedidosPagados = signal<PedidoResponse[]>([]);

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading.set(true);
    
    const hoy = new Date().toISOString().split('T')[0];
    
    this.ventasService.getResumenVentasDia(hoy).subscribe({
      next: (res) => {
        this.resumenVentas.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando resumen de ventas', err);
        this.loading.set(false);
      }
    });

    this.ventasService.getPedidosPorEstado('PAGADO').subscribe({
      next: (res) => {
        const pagadosHoy = (res.data || []).filter((p: any) => p.createdAt && p.createdAt.startsWith(hoy));
        this.pedidosPagados.set(pagadosHoy);
      },
      error: (err) => console.error('Error cargando pedidos pagados', err)
    });
  }
}
