import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface PagoRequest {
  pedidoId: string;
  metodoPago: string;
  monto: number;
  referencia?: string;
}

export interface PagoResponse {
  id: string;
  pedidoId: string;
  metodoPago: string;
  monto: number;
  referencia?: string;
  estado: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/pagos';

  registrarPago(request: PagoRequest): Observable<PagoResponse> {
    return this.http.post<any>(`${this.apiUrl}`, request).pipe(
      map(res => res.data ? res.data : res)
    );
  }
}
