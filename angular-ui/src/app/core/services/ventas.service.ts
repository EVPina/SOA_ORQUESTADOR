import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ProductoResponse {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  disponible: boolean;
  imagenUrl: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DetallePedidoRequest {
  productoId: string;
  cantidad: number;
  notas?: string;
}

export interface PedidoRequest {
  sesionMesaId: string;
  clienteId: string;
  origen: string;
  detalles: DetallePedidoRequest[];
}

export interface DetallePedidoResponse {
  id: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notas?: string;
}

export interface PedidoResponse {
  id: string;
  sesionMesaId: string;
  clienteId: string;
  clienteNombre?: string;
  origen: string;
  estado: string;
  subtotal: number;
  igv: number;
  total: number;
  detalles?: DetallePedidoResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '';

  getProductosActivos(): Observable<ApiResponse<ProductoResponse[]>> {
    return this.http.get<ApiResponse<ProductoResponse[]>>(`${this.apiUrl}/productos/activos`);
  }

  crearPedido(request: PedidoRequest): Observable<ApiResponse<PedidoResponse>> {
    return this.http.post<ApiResponse<PedidoResponse>>(`${this.apiUrl}/pedidos`, request);
  }

  crearPedidoQR(request: any): Observable<ApiResponse<any>> {
    const baseUrl = this.apiUrl.replace('/api/v1', '');
    return this.http.post<ApiResponse<any>>(`${baseUrl}/api/orquestador/pedido/qr`, request);
  }

  getPedidosPorMesa(sesionMesaId: string): Observable<ApiResponse<PedidoResponse[]>> {
    return this.http.get<ApiResponse<PedidoResponse[]>>(`${this.apiUrl}/pedidos/mesa/${sesionMesaId}/activos?t=${new Date().getTime()}`);
  }

  actualizarEstadoPedido(pedidoId: string, estado: string): Observable<ApiResponse<PedidoResponse>> {
    return this.http.patch<ApiResponse<PedidoResponse>>(`${this.apiUrl}/pedidos/${pedidoId}/estado?estado=${estado}`, {});
  }

  getResumenVentasDia(fecha: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/pedidos/reporte/ventas?fecha=${fecha}`);
  }

  getPedidosPorEstado(estado: string): Observable<ApiResponse<PedidoResponse[]>> {
    return this.http.get<ApiResponse<PedidoResponse[]>>(`${this.apiUrl}/pedidos/estado/${estado}`);
  }
}


