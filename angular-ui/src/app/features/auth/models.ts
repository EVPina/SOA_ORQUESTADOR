export const ROLES = ['ADMIN', 'RECEPCIONISTA', 'JEFE_COCINA', 'CAJA', 'MOZO', 'CLIENTE'] as const;
export type Rol = typeof ROLES[number];

export interface LoginRequest {
  username: string;
  password: string;
  loginType?: 'CLIENTE' | 'EMPLEADO';
}

export interface LoginResponse {
  id?: string;
  token: string;
  refreshToken: string;
  username: string;
  rol: Rol;
  nombreCompleto: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  nombreCompleto: string;
  email: string;
  rol?: Rol;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  rol: Rol;
  nombreCompleto: string;
  token: string;
}

export const ROL_ROUTES: Record<Rol, string> = {
  ADMIN: '/admin',
  RECEPCIONISTA: '/recepcion',
  JEFE_COCINA: '/cocina',
  CAJA: '/cajera',
  MOZO: '/mozo',
  CLIENTE: '/cliente',
};
