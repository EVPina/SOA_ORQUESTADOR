export type EstadoOrden = 'PENDIENTE' | 'PREPARANDO' | 'LISTO' | 'ENTREGADO';

export interface OrdenProduccionDTO {
  id: string;
  pedidoId: string;
  mesaNumero: number;
  estado: EstadoOrden;
  clienteNombre: string;
  usuarioJefeId: string | null;
  tiempoPreparacionSegundos: number | null;
  createdAt: string;
  updatedAt: string;
  totalItems: number;
  itemsListos: number;
  detalles: DetalleProduccionDTO[];
}

export interface DetalleProduccionDTO {
  id: string;
  ordenId: string;
  productoNombre: string;
  cantidad: number;
  estado: EstadoOrden;
  notas: string;
  createdAt: string;
}

export interface EstadoRequestDTO {
  nuevoEstado: EstadoOrden;
  usuarioId: string;
}

export interface EstadoDetalleRequestDTO {
  nuevoEstado: EstadoOrden;
  usuarioId: string;
}

export interface DashboardStats {
  ordenesPendientes: number;
  ordenesPreparando: number;
  ordenesListas: number;
  ordenesEntregadas: number;
  tiempoPreparacionPromedio: number;
}

export interface EstadisticasDetalles {
  totalDetalles: number;
  topProductos: { producto: string; cantidad: number }[];
}
