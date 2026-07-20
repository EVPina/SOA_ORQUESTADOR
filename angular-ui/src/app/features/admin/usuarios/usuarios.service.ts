import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface Usuario {
  id: string;
  username: string;
  nombreCompleto: string;
  email: string;
  rol: string;
  estado: string;
  dni?: string;
  mesasAsignadas?: string[];
}

export interface UsuarioPayload {
  username: string;
  password?: string;
  nombreCompleto: string;
  email: string;
  rol: string;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  
  // Guardamos las asignaciones temporalmente mientras las cargamos
  private asignacionesMesas: Record<string, string[]> = {};

  getMozos(): Observable<Usuario[]> {
    return this.http.get<any>(`${environment.apiUrl}/usuarios`).pipe(
      map(response => {
        let usuarios: any[] = [];
        if (Array.isArray(response)) {
          usuarios = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          usuarios = response.data;
        } else if (response && response.usuarios && Array.isArray(response.usuarios)) {
          usuarios = response.usuarios;
        }
        
        return usuarios
          .filter(u => u.rol === 'MOZO')
          .map(u => ({
            id: u.id,
            username: u.username || '',
            nombreCompleto: u.nombreCompleto || u.nombre || 'Mozo Sin Nombre',
            email: u.email || u.username || '',
            rol: u.rol,
            estado: u.estado || 'Activo',
            dni: u.dni || 'No registrado',
            mesasAsignadas: [] // Las cargaremos luego con getAsignacionesPorMozo
          }));
      }),
      catchError(err => {
        console.error('Error obteniendo mozos', err);
        return of([]);
      })
    );
  }

  getAsignacionesPorMozo(mozoId: string): Observable<string[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/asignaciones-mozo/mozo/${mozoId}`).pipe(
      map(asignaciones => asignaciones.map(a => a.mesaId)),
      catchError(err => {
        console.error(`Error obteniendo asignaciones para mozo ${mozoId}`, err);
        return of([]);
      })
    );
  }

  getAllUsuarios(): Observable<Usuario[]> {
    return this.http.get<any>(`${environment.apiUrl}/usuarios`).pipe(
      map(response => {
        let usuarios: any[] = [];
        if (Array.isArray(response)) {
          usuarios = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          usuarios = response.data;
        } else if (response && response.usuarios && Array.isArray(response.usuarios)) {
          usuarios = response.usuarios;
        }

        return usuarios.map(u => ({
          id: u.id,
          username: u.username || '',
          nombreCompleto: u.nombreCompleto || u.nombre || '',
          email: u.email || '',
          rol: u.rol || '',
          estado: u.estado || 'ACTIVO',
        }));
      }),
      catchError(err => {
        console.error('Error obteniendo usuarios', err);
        return of([]);
      })
    );
  }

  crearUsuario(payload: UsuarioPayload): Observable<Usuario> {
    return this.http.post<Usuario>(`${environment.apiUrl}/usuarios`, payload);
  }

  actualizarUsuario(id: string, payload: UsuarioPayload): Observable<Usuario> {
    return this.http.put<Usuario>(`${environment.apiUrl}/usuarios/${id}`, payload);
  }

  eliminarUsuario(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/usuarios/${id}`);
  }

  cambiarRol(id: string, rol: string): Observable<Usuario> {
    return this.http.put<Usuario>(`${environment.apiUrl}/usuarios/${id}/rol`, null, { params: { rol } });
  }

  getUsuarioById(id: string): Observable<Usuario> {
    return this.http.get<any>(`${environment.apiUrl}/usuarios/${id}`).pipe(
      map(response => {
        const u = response.data ? response.data : response;
        return {
          id: u.id || id,
          username: u.username || '',
          nombreCompleto: u.nombreCompleto || u.nombre || 'Cliente Anónimo',
          email: u.email || u.username || '',
          rol: u.rol || 'CLIENTE',
          estado: u.estado || 'Activo'
        };
      }),
      catchError(err => {
        console.error(`Error obteniendo usuario ${id}`, err);
        return of({
          id,
          username: '',
          nombreCompleto: 'Cliente Anónimo',
          email: '',
          rol: 'CLIENTE',
          estado: 'Inactivo'
        });
      })
    );
  }

  getClienteById(id: string): Observable<Usuario> {
    return this.http.get<any>(`${environment.apiUrl}/clientes/${id}`).pipe(
      map(response => {
        const u = response.data ? response.data : response;
        return {
          id: u.id || id,
          username: u.username || '',
          nombreCompleto: u.nombreCompleto || u.nombre || u.nombres || 'Cliente Anónimo',
          email: u.email || u.username || '',
          rol: u.rol || 'CLIENTE',
          estado: u.estado || 'Activo'
        };
      }),
      catchError(err => {
        // Fallback to usuarios in case it's actually a user ID
        return this.getUsuarioById(id);
      })
    );
  }

  asignarMesa(mozoId: string, mesaId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/asignaciones-mozo`, { mozoId, mesaId }).pipe(
      catchError(err => {
        console.error('Error al asignar mesa', err);
        throw err;
      })
    );
  }

  desasignarMesa(mozoId: string, mesaId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/asignaciones-mozo/mozo/${mozoId}/mesa/${mesaId}`).pipe(
      catchError(err => {
        console.error('Error al desasignar mesa', err);
        throw err;
      })
    );
  }
}
