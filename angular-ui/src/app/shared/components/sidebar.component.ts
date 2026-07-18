import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../features/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
  <aside class="w-64 bg-[#B71C1C] text-[#F8F7F2] flex flex-col shadow-md shrink-0 z-20 h-full">
    <div class="p-6 border-b border-red-700 bg-red-950/20">
      <h1 class="text-2xl font-black tracking-tight text-white leading-tight">DON BELISARIO</h1>
      <span class="text-amber-300 text-xs font-bold tracking-[0.2em] uppercase mt-1 block">
        {{ isCliente ? 'Menú Digital' : 'Panel Administrativo' }}
      </span>
    </div>
    
    <nav class="flex-1 py-8 px-4 flex flex-col gap-3">
      @if (isCliente) {
        <a routerLink="/cliente" routerLinkActive="bg-white text-red-900 shadow-md" [routerLinkActiveOptions]="{exact: true}" 
           class="flex items-center gap-3 px-4 py-3.5 text-red-100 hover:text-white hover:bg-red-800 rounded-xl font-semibold transition-all group">
          <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          Realizar Pedidos
        </a>
        <a routerLink="/cliente/mis-pedidos" routerLinkActive="bg-white text-red-900 shadow-md" 
           class="flex items-center gap-3 px-4 py-3.5 text-red-100 hover:text-white hover:bg-red-800 rounded-xl font-semibold transition-all group">
          <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          Mis Pedidos
        </a>
      } @else if (isAdmin) {
        <a routerLink="/admin" routerLinkActive="bg-white text-red-900 shadow-md" [routerLinkActiveOptions]="{exact: true}" 
           class="flex items-center gap-3 px-4 py-3.5 text-red-100 hover:text-white hover:bg-red-800 rounded-xl font-semibold transition-all group">
          <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          Dashboard
        </a>
        <a routerLink="/admin/mozos" routerLinkActive="bg-white text-red-900 shadow-md"
           class="flex items-center gap-3 px-4 py-3.5 text-red-100 hover:text-white hover:bg-red-800 rounded-xl font-semibold transition-all group">
          <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          Gestión de Mozos
        </a>
        <a routerLink="/admin/usuarios" routerLinkActive="bg-white text-red-900 shadow-md"
           class="flex items-center gap-3 px-4 py-3.5 text-red-100 hover:text-white hover:bg-red-800 rounded-xl font-semibold transition-all group">
          <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          Gestión de Usuarios
        </a>
      } @else if (isRecepcionista) {
        <a routerLink="/recepcion" routerLinkActive="bg-white text-red-900 shadow-md" [routerLinkActiveOptions]="{exact: true}" 
           class="flex items-center gap-3 px-4 py-3.5 text-red-100 hover:text-white hover:bg-red-800 rounded-xl font-semibold transition-all group">
          <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          Recepción
        </a>
        <a routerLink="/recepcion/mozos" routerLinkActive="bg-white text-red-900 shadow-md" 
           class="flex items-center gap-3 px-4 py-3.5 text-red-100 hover:text-white hover:bg-red-800 rounded-xl font-semibold transition-all group">
          <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          Gestión de Mozos
        </a>
        <a routerLink="/recepcion/mesas" routerLinkActive="bg-white text-red-900 shadow-md" 
           class="flex items-center gap-3 px-4 py-3.5 text-red-100 hover:text-white hover:bg-red-800 rounded-xl font-semibold transition-all group">
          <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          Gestión de Mesas
        </a>
      } @else if (isMozo) {
        <a routerLink="/mozo" routerLinkActive="bg-white text-red-900 shadow-md" [routerLinkActiveOptions]="{exact: true}" 
           class="flex items-center gap-3 px-4 py-3.5 text-red-100 hover:text-white hover:bg-red-800 rounded-xl font-semibold transition-all group">
          <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          Mis Mesas (Pedidos)
        </a>
      } @else if (isCaja) {
        <a routerLink="/cajera" routerLinkActive="bg-white text-red-900 shadow-md" [routerLinkActiveOptions]="{exact: true}" 
           class="flex items-center gap-3 px-4 py-3.5 text-red-100 hover:text-white hover:bg-red-800 rounded-xl font-semibold transition-all group">
          <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
          </svg>
          Cobros (Caja)
        </a>
        <a routerLink="/cajera/cierre" routerLinkActive="bg-white text-red-900 shadow-md" 
           class="flex items-center gap-3 px-4 py-3.5 text-red-100 hover:text-white hover:bg-red-800 rounded-xl font-semibold transition-all group">
          <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
          Cierre del Día
        </a>
      } @else if (isJefeCocina) {
        <a routerLink="/cocina" routerLinkActive="bg-white text-red-900 shadow-md" [routerLinkActiveOptions]="{exact: true}" 
           class="flex items-center gap-3 px-4 py-3.5 text-red-100 hover:text-white hover:bg-red-800 rounded-xl font-semibold transition-all group">
          <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          Gestión de Cocina
        </a>
        
        <a routerLink="/inventario" routerLinkActive="bg-white text-red-900 shadow-md" 
           class="flex items-center gap-3 px-4 py-3.5 text-red-100 hover:text-white hover:bg-red-800 rounded-xl font-semibold transition-all group">
          <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          Inventario
        </a>
      }
    </nav>
    
    <div class="p-4 border-t border-red-700 flex flex-col gap-2 bg-red-950/10">
      <button (click)="irAjustes()" class="flex items-center gap-3 px-4 py-2.5 text-red-100 hover:text-white hover:bg-red-800 rounded-lg transition-colors w-full text-left font-medium">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
        Cambiar contraseña
      </button>
      <button (click)="cerrarSesion()" class="flex items-center gap-3 px-4 py-2.5 text-red-100 hover:text-white hover:bg-red-800 rounded-lg transition-colors w-full text-left font-medium mt-1">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        Cerrar Sesión
      </button>
    </div>
  </aside>
  `
})
export class SidebarComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  get isCliente(): boolean {
    return this.authService.user()?.rol === 'CLIENTE';
  }

  get isAdmin(): boolean {
    return this.authService.user()?.rol === 'ADMIN';
  }

  get isRecepcionista(): boolean {
    return this.authService.user()?.rol === 'RECEPCIONISTA';
  }

  get isMozo(): boolean {
    return this.authService.user()?.rol === 'MOZO';
  }

  get isCaja(): boolean {
    return this.authService.user()?.rol === 'CAJA';
  }

  get isJefeCocina(): boolean {
    return this.authService.user()?.rol === 'JEFE_COCINA';
  }

  irAjustes() {
    this.router.navigate(['/ajustes']);
  }

  cerrarSesion() {
    this.authService.logout();
  }
}
