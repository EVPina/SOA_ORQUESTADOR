import { Component, input, output, computed } from '@angular/core';
import { OrdenProduccionDTO, EstadoOrden } from '../../../shared/models/orden.models';
import { TarjetaOrdenComponent } from './tarjeta-orden.component';

@Component({
  selector: 'app-lista-ordenes',
  imports: [TarjetaOrdenComponent],
  templateUrl: './lista-ordenes.component.html',
  styleUrl: './lista-ordenes.component.css',
})
export class ListaOrdenesComponent {
  readonly ordenes = input.required<OrdenProduccionDTO[]>();
  readonly estadoCambiado = output<void>();

  private readonly estados: EstadoOrden[] = ['PENDIENTE', 'PREPARANDO', 'LISTO', 'ENTREGADO'];

  readonly columnas = computed(() =>
    this.estados.map(estado => ({
      estado,
      label: this.labelFor(estado),
      ordenes: this.ordenes().filter(o => o.estado === estado),
    }))
  );

  private labelFor(estado: EstadoOrden): string {
    const labels: Record<EstadoOrden, string> = {
      PENDIENTE: 'Pendientes',
      PREPARANDO: 'En Preparación',
      LISTO: 'Listos',
      ENTREGADO: 'Entregados',
    };
    return labels[estado];
  }
}
