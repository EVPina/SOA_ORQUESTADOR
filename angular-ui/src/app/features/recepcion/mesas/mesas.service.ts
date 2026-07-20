import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface Mesa {
  id: string;
  numero: number;
  capacidadMaxima: number;
  estado: string; // "LIBRE", "OCUPADA"
  ocupacionActual: number;
  zona?: {
    id: string;
    nombre: string;
  };
}

export interface MesaQr {
  mesaId: string;
  qrCode: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class MesasService {
  private readonly http = inject(HttpClient);

  getMesas(): Observable<Mesa[]> {
    return this.http.get<Mesa[]>(`${environment.apiUrl}/mesas`).pipe(
      catchError(err => {
        console.error('Error obteniendo mesas', err);
        return of([]);
      })
    );
  }

  getQrMesa(mesaId: string): Observable<MesaQr> {
    return this.http.get<MesaQr>(`${environment.apiUrl}/menu/qr/mesa/${mesaId}`);
  }
}
