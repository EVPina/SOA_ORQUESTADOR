import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { OrdenProduccionDTO, EstadoRequestDTO, DashboardStats } from '../../shared/models/orden.models';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class CocinaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/orquestador';

  getOrdenesActivas(): Observable<OrdenProduccionDTO[]> {
    return this.http.get<ApiResponse<OrdenProduccionDTO[]>>(`${this.apiUrl}/cocina/ordenes/activas`).pipe(
      map(r => r.data)
    );
  }

  getOrdenesPorEstado(estado: string): Observable<OrdenProduccionDTO[]> {
    return this.http.get<ApiResponse<OrdenProduccionDTO[]>>(`${this.apiUrl}/cocina/ordenes/${this.estadoToEndpoint(estado)}`).pipe(
      map(r => r.data)
    );
  }

  getOrdenById(id: string): Observable<OrdenProduccionDTO> {
    return this.http.get<OrdenProduccionDTO>(`/api/v1/ordenes-produccion/${id}`);
  }

  actualizarEstado(id: string, request: EstadoRequestDTO): Observable<OrdenProduccionDTO> {
    return this.http.patch<OrdenProduccionDTO>(`/api/v1/ordenes-produccion/${id}/estado`, request);
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.getOrdenesActivas().pipe(
      map(ordenes => ({
        ordenesPendientes: ordenes.filter(o => o.estado === 'PENDIENTE').length,
        ordenesPreparando: ordenes.filter(o => o.estado === 'PREPARANDO').length,
        ordenesListas: ordenes.filter(o => o.estado === 'LISTO').length,
        ordenesEntregadas: ordenes.filter(o => o.estado === 'ENTREGADO').length,
        tiempoPreparacionPromedio: 0,
      }))
    );
  }

  private estadoToEndpoint(estado: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'pendientes',
      PREPARANDO: 'preparando',
      LISTO: 'listos',
      ENTREGADO: 'entregados',
    };
    return map[estado] || 'activas';
  }
}


