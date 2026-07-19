import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import type { LoginRequest, LoginResponse, RegisterRequest, AuthUser, Rol } from './models';
import { ROL_ROUTES } from './models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly currentUser = signal<AuthUser | null>(null);
  private readonly STORAGE_KEY = 'donbelisario_auth';
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try { this.currentUser.set(JSON.parse(stored)); } catch { this.clearSession(); }
    }
  }

  get user() { return this.currentUser.asReadonly(); }
  get isAuthenticated() { return this.currentUser() !== null; }
  get token() { return this.currentUser()?.token; }

  login(request: LoginRequest): Observable<LoginResponse> {
    const mesaId = sessionStorage.getItem('pending_mesa_id');
    const isMesa = mesaId !== null;
    
    // Si explícitamente se pide EMPLEADO, respetar. Si no, y hay mesa, es CLIENTE.
    const type = request.loginType === 'EMPLEADO' ? 'EMPLEADO' : (isMesa ? 'CLIENTE' : 'CLIENTE');

    console.log(`--- INTENTO DE LOGIN COMO ${type} ---`);
    console.log('¿Hay mesa ID detectada?', isMesa, 'MesaID:', mesaId);
    
    if (type === 'CLIENTE') {
      const payload = {
        identificador: request.username,
        password: request.password
      };
      return this.http.post<LoginResponse>(`/api/v1/clientes/login`, payload).pipe(
        tap(res => {
          if (!res.rol) (res as any).rol = 'CLIENTE';
          if (!res.token) (res as any).token = res.id || 'token-cliente';
          if (!res.nombreCompleto && (res as any).nombre) {
             (res as any).nombreCompleto = `${(res as any).nombre} ${(res as any).apellido || ''}`.trim();
          }
          if (!res.username && (res as any).email) {
             (res as any).username = (res as any).email;
          }
        })
      );
    } else {
      return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request);
    }
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`/api/v1/clientes`, request);
  }

  loginWithGoogle(idToken: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`/api/v1/clientes/login-google`, { id_token: idToken }).pipe(
      tap(res => {
        if (!res.rol) (res as any).rol = 'CLIENTE';
        if (!res.token) (res as any).token = res.id || 'token-cliente';
        if (!res.nombreCompleto && (res as any).nombre) {
           (res as any).nombreCompleto = `${(res as any).nombre} ${(res as any).apellido || ''}`.trim();
        }
        if (!res.username && (res as any).email) {
           (res as any).username = (res as any).email;
        }
      })
    );
  }

  setSession(response: LoginResponse): void {
    const user: AuthUser = {
      id: response.id || response.token,
      username: response.username,
      email: response.username,
      rol: response.rol,
      nombreCompleto: response.nombreCompleto,
      token: response.token,
    };
    this.currentUser.set(user);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  logout(): void {
    const rol = this.user()?.rol;
    
    if (rol === 'CLIENTE') {
      const sesionMesaId = sessionStorage.getItem('current_sesion_mesa_id');
      if (sesionMesaId) {
        // Enviar petición con el token AÚN VÁLIDO
        this.http.put(`/api/v1/sesiones-mesa/${sesionMesaId}/finalizar`, {}).subscribe({
          next: () => {
            console.log('Sesión de mesa finalizada y mesa liberada (ocupación - 1)');
            this.ejecutarLogoutLocal(rol);
          },
          error: (err) => {
            console.error('Error al finalizar la sesión de la mesa', err);
            this.ejecutarLogoutLocal(rol); // Desloguear de todas formas si falla
          }
        });
        return; // Retornar para no ejecutar el código síncrono de abajo
      }
    }

    this.ejecutarLogoutLocal(rol);
  }

  /** El backend rechazó el token (vencido/invalido). A diferencia de logout(),
   * no intenta liberar la mesa: la sesión ya no es válida para el servidor. */
  forceLogout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  private ejecutarLogoutLocal(rol: string | undefined): void {
    if (rol === 'CLIENTE') {
      sessionStorage.removeItem('current_sesion_mesa_id');
      sessionStorage.removeItem('pending_mesa_id');
    }

    this.clearSession();
    
    if (rol === 'CLIENTE') {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/usuarios']);
    }
  }

  getDashboardRoute(): string {
    const user = this.currentUser();
    if (!user) return '/login';
    return ROL_ROUTES[user.rol] || '/cliente';
  }

  private clearSession(): void {
    this.currentUser.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
