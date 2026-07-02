import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface SesionMesaRequest {
  mesaId: string;
  clienteId?: string;
  mozoId?: string;
}

export interface SesionMesaResponse {
  id: string;
  mesaId: string;
  clienteId?: string;
  mozoId?: string;
  fechaInicio: string;
  fechaFin?: string;
  estado: string;
  totalConsumo: number;
}

export interface MesaResponse {
  id: string;
  numero: number;
  capacidadMaxima: number;
  estado: string;
  ocupacionActual: number;
  zona?: {
    id: string;
    nombre: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class MesasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1';

  iniciarSesionMesa(request: SesionMesaRequest): Observable<SesionMesaResponse> {
    return this.http.post<any>(`${this.apiUrl}/sesiones-mesa/iniciar`, request).pipe(
      map(res => res.data ? res.data : res)
    );
  }

  getSesionMesa(id: string): Observable<SesionMesaResponse> {
    return this.http.get<any>(`${this.apiUrl}/sesiones-mesa/${id}`).pipe(
      map(res => res.data ? res.data : res)
    );
  }

  getSesionMesaActiva(mesaId: string): Observable<SesionMesaResponse> {
    return this.http.get<any>(`${this.apiUrl}/sesiones-mesa/activa/mesa/${mesaId}`).pipe(
      map(res => res.data ? res.data : res)
    );
  }

  finalizarSesionMesa(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/sesiones-mesa/${id}/finalizar`, {}).pipe(
      map(res => res.data ? res.data : res)
    );
  }

  getMesa(id: string): Observable<MesaResponse> {
    return this.http.get<any>(`${this.apiUrl}/mesas/${id}`).pipe(
      map(res => res.data ? res.data : res)
    );
  }

  getMesas(): Observable<MesaResponse[]> {
    return this.http.get<any>(`${this.apiUrl}/mesas`).pipe(
      map(res => res.data ? res.data : res)
    );
  }
}
