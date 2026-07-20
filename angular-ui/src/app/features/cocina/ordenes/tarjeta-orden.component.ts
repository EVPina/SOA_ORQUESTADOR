import { Component, input, output, inject, signal, effect, DestroyRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { OrdenProduccionDTO, EstadoRequestDTO } from '../../../shared/models/orden.models';
import { CocinaService } from '../../../core/services/cocina.service';
import { VentasService } from '../../../core/services/ventas.service';
import { IndicadorEstadoComponent } from '../../../shared/components/indicador-estado.component';
import { NumeroMesaComponent } from '../../../shared/components/numero-mesa.component';

@Component({
  selector: 'app-tarjeta-orden',
  imports: [DatePipe, IndicadorEstadoComponent, NumeroMesaComponent],
  templateUrl: './tarjeta-orden.component.html',
  styleUrl: './tarjeta-orden.component.css',
})
export class TarjetaOrdenComponent {
  private readonly cocinaService = inject(CocinaService);
  private readonly ventasService = inject(VentasService);
  private readonly destroyRef = inject(DestroyRef);

  readonly orden = input.required<OrdenProduccionDTO>();
  readonly tiempoTranscurrido = signal('00:00');
  readonly estadoCambiado = output<void>();

  constructor() {
    effect(() => {
      const o = this.orden();
      if (o.estado !== 'PREPARANDO') {
        this.tiempoTranscurrido.set('00:00');
        return;
      }

      const inicio = new Date(o.createdAt).getTime();
      const actualizar = () => {
        const diff = Math.max(0, Math.floor((Date.now() - inicio) / 1000));
        const min = String(Math.floor(diff / 60)).padStart(2, '0');
        const seg = String(diff % 60).padStart(2, '0');
        this.tiempoTranscurrido.set(`${min}:${seg}`);
      };

      actualizar();
      const id = setInterval(actualizar, 1000);
      this.destroyRef.onDestroy(() => clearInterval(id));
    });
  }

  avanzarEstado() {
    const ordenActual = this.orden();
    const mapa: Record<string, string> = {
      PENDIENTE: 'PREPARANDO',
      PREPARANDO: 'LISTO',
      LISTO: 'ENTREGADO',
    };

    const nuevoEstado = mapa[ordenActual.estado];
    if (!nuevoEstado) return;

    const request: EstadoRequestDTO = {
      nuevoEstado: nuevoEstado as OrdenProduccionDTO['estado'],
      usuarioId: '00000000-0000-0000-0000-000000000000',
    };

    this.cocinaService.actualizarEstado(ordenActual.id, request).subscribe(() => {
      // Sincronizar con el microservicio de Ventas
      if (ordenActual.pedidoId) {
        this.ventasService.actualizarEstadoPedido(ordenActual.pedidoId, nuevoEstado).subscribe({
          next: () => this.estadoCambiado.emit(),
          error: (err) => {
            console.error('Error sincronizando con Ventas:', err);
            alert(`Error crítico: No se pudo sincronizar el estado ${nuevoEstado} con el sistema de Ventas. El cliente no verá el cambio. Por favor avise a soporte. Detalle: ${err.message || 'Error de conexión'}`);
            // Emitimos de todas formas para actualizar UI de cocina (modo degradado)
            this.estadoCambiado.emit();
          }
        });
      } else {
        this.estadoCambiado.emit();
      }
    });
  }
}
