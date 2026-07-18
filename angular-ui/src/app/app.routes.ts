import { Routes } from '@angular/router';
import { authGuard } from './features/auth/auth.guard';
import { LoginComponent } from './features/auth/login.component';
import { RegistroComponent } from './features/auth/registro.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'usuarios',
    loadComponent: () => import('./features/auth/login-empleado.component').then(m => m.LoginEmpleadoComponent),
  },
  { path: 'registro', component: RegistroComponent },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/pantalla-admin.component').then(m => m.PantallaAdminComponent),
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'admin/mozos',
    loadComponent: () => import('./features/admin/mozos/admin-mozos.component').then(m => m.AdminMozosComponent),
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'admin/usuarios',
    loadComponent: () => import('./features/admin/usuarios/admin-usuarios.component').then(m => m.AdminUsuariosComponent),
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'cocina',
    loadComponent: () => import('./features/cocina/layout/pantalla-cocina.component').then(m => m.PantallaCocinaComponent),
    canActivate: [authGuard],
    data: { roles: ['JEFE_COCINA'] },
  },
  {
    path: 'cajera',
    loadComponent: () => import('./features/cajera/pantalla-cajera.component').then(m => m.PantallaCajeraComponent),
    canActivate: [authGuard],
    data: { roles: ['CAJA'] },
  },
  {
    path: 'cajera/cierre',
    loadComponent: () => import('./features/cajera/cierre-caja.component').then(m => m.CierreCajaComponent),
    canActivate: [authGuard],
    data: { roles: ['CAJA'] },
  },
  {
    path: 'recepcion',
    loadComponent: () => import('./features/recepcion/pantalla-recepcion.component').then(m => m.PantallaRecepcionComponent),
    canActivate: [authGuard],
    data: { roles: ['RECEPCIONISTA'] },
  },
  {
    path: 'recepcion/mozos',
    loadComponent: () => import('./features/admin/mozos/admin-mozos.component').then(m => m.AdminMozosComponent),
    canActivate: [authGuard],
    data: { roles: ['RECEPCIONISTA'] },
  },
  {
    path: 'recepcion/mesas',
    loadComponent: () => import('./features/recepcion/mesas/recepcion-mesas.component').then(m => m.RecepcionMesasComponent),
    canActivate: [authGuard],
    data: { roles: ['RECEPCIONISTA'] },
  },
  {
    path: 'mozo',
    loadComponent: () => import('./features/mozo/pantalla-mozo.component').then(m => m.PantallaMozoComponent),
    canActivate: [authGuard],
    data: { roles: ['MOZO'] },
  },
  {
    path: 'cliente',
    loadComponent: () => import('./features/cliente/pantalla-cliente.component').then(m => m.PantallaClienteComponent),
    canActivate: [authGuard],
    data: { roles: ['CLIENTE'] },
  },
  {
    path: 'cliente/mis-pedidos',
    loadComponent: () => import('./features/cliente/mis-pedidos.component').then(m => m.MisPedidosComponent),
    canActivate: [authGuard],
    data: { roles: ['CLIENTE'] },
  },
  {
    path: 'ajustes',
    loadComponent: () => import('./features/ajustes/ajustes.component').then(m => m.AjustesComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'login' },
];
