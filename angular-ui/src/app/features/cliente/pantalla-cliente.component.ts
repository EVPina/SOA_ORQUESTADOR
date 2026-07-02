import { Component, inject, OnInit, signal, computed, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { AuthService } from '../auth/auth.service';
import { MesasService } from '../../core/services/mesas.service';
import { VentasService, ProductoResponse, PedidoRequest, DetallePedidoRequest } from '../../core/services/ventas.service';
import { DecimalPipe, TitleCasePipe, UpperCasePipe } from '@angular/common';

interface CartItem {
  producto: ProductoResponse;
  cantidad: number;
  notas: string;
}

@Component({
  selector: 'app-categoria-icono',
  standalone: true,
  template: `
    @switch (categoria().toLowerCase()) {
      @case ('pollo') { <svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M11 7h2v5h-2zm0 6h2v2h-2z"/></svg> }
      @case ('pollos') { <svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M11 7h2v5h-2zm0 6h2v2h-2z"/></svg> }
      @case ('entradas') { <svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg> }
      @case ('bebidas') { <svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21h6v-2H9v2zm8-13h-2V4h2v4zm0 2H7v9h10v-9zM7 6H5v2h2V6z"/></svg> }
      @case ('acompañamientos') { <svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12v2H6zm0 5h12v2H6zm0 5h12v2H6zm0 5h12v2H6z"/></svg> }
      @case ('papas') { <svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12v2H6zm0 5h12v2H6zm0 5h12v2H6zm0 5h12v2H6z"/></svg> }
      @case ('salsas') { <svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> }
      @case ('postres') { <svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13.5h-13L12 6.5z"/></svg> }
      @default { <svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h18v18H3z"/></svg> }
    }
  `
})
export class CategoriaIconoComponent {
  categoria = input.required<string>();
}

@Component({
  selector: 'app-pantalla-cliente',
  imports: [SidebarComponent, DecimalPipe, TitleCasePipe, UpperCasePipe, CategoriaIconoComponent],
  template: `
    <div class="flex h-dvh bg-[#F8F7F2] font-sans">
      <!-- Sidebar / Navbar lateral -->
      <app-sidebar class="w-64 flex-shrink-0" />

      <!-- Main Content -->
      <main class="flex-1 flex flex-col h-full overflow-hidden relative">
        <header class="bg-white/95 backdrop-blur-md px-8 py-4 border-b border-[#2E221B]/10 flex-shrink-0 z-10 sticky top-0">
          <div>
            <h1 class="text-2xl font-bold text-[#2E221B]">Bienvenido, {{ nombreCliente() }}</h1>
            
            <div class="flex items-center gap-2 mt-2 flex-wrap">
              @if (mesaNumero()) {
                <!-- Etiqueta de Zona -->
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#2E221B]/5 text-[#2E221B]">
                  <svg class="w-3.5 h-3.5 text-[#B71C1C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {{ zona() }}
                </span>
                
                <!-- Separador -->
                <span class="text-[#2E221B]/20">•</span>

                <!-- Etiqueta de Mesa -->
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#2E221B]/5 text-[#2E221B]">
                  <svg class="w-3.5 h-3.5 text-[#B71C1C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                  Mesa #{{ mesaNumero() }}
                </span>
              } @else {
                <span class="text-sm text-[#2E221B]/60 font-medium">Menú digital</span>
              }

              @if (nombreMozo()) {
                <!-- Separador -->
                <span class="text-[#2E221B]/20">•</span>

                <!-- Etiqueta de Mozo -->
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#B71C1C]/10 text-[#B71C1C]">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Mozo: <span class="capitalize">{{ nombreMozo() }}</span>
                </span>
              }
            </div>
          </div>
        </header>

        <!-- Content Area: Menu and Cart -->
        <div class="flex-1 flex overflow-hidden">
          
          <!-- Menu Area -->
          <div class="flex-1 flex flex-col overflow-hidden">
            
            <!-- Category Filters (Sticky under header) -->
            <div class="bg-white border-b border-[#2E221B]/5 px-8 py-4 flex gap-4 overflow-x-auto scrollbar-hide shrink-0 shadow-sm z-10">
              @for (cat of categorias(); track cat) {
                <button 
                  (click)="scrollToCategory(cat)"
                  class="flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold transition-all whitespace-nowrap border-2"
                  [class]="categoriaSeleccionada() === cat 
                    ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md shadow-[#B71C1C]/20 transform scale-105' 
                    : 'bg-white text-[#2E221B]/70 border-[#2E221B]/10 hover:border-[#B71C1C]/30 hover:text-[#B71C1C]'">
                  <div class="w-5 h-5"><app-categoria-icono [categoria]="cat" /></div>
                  {{ cat === 'todos' ? 'Todo' : (cat | titlecase) }}
                </button>
              }
            </div>

            <!-- Products List (Scrollable) -->
            <div class="flex-1 overflow-y-auto p-8 scroll-smooth" id="menu-scroll-container" (scroll)="onScroll($event)">
              <div class="max-w-4xl mx-auto space-y-12 pb-12">
                @for (grupo of productosPorCategoria(); track grupo.categoria) {
                  <div [id]="'cat-' + grupo.categoria" class="scroll-mt-8">
                    
                    <h2 class="text-2xl font-black text-[#2E221B] mb-6 flex items-center gap-3 border-b-2 border-[#B71C1C]/10 pb-3">
                      <span class="bg-white p-2.5 rounded-xl shadow-sm text-[#2E221B] w-12 h-12"><app-categoria-icono [categoria]="grupo.categoria" /></span>
                      {{ grupo.categoria | uppercase }}
                    </h2>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      @for (prod of grupo.productos; track prod.id) {
                        <div class="bg-white rounded-3xl p-4 border border-[#2E221B]/5 shadow-sm hover:shadow-xl transition-all group flex gap-4 items-center">
                          <!-- Image -->
                          <div class="w-32 h-32 rounded-2xl bg-[#F8F7F2] overflow-hidden relative shrink-0">
                            @if (prod.imagenUrl) {
                              <img [src]="prod.imagenUrl" [alt]="prod.nombre" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                            } @else {
                              <div class="w-full h-full flex items-center justify-center text-[#2E221B]/20 p-8">
                                <app-categoria-icono [categoria]="grupo.categoria" />
                              </div>
                            }
                          </div>
                          
                          <!-- Info -->
                          <div class="flex-1 flex flex-col h-full py-1">
                            <h3 class="text-lg font-bold text-[#2E221B] mb-1 line-clamp-2 leading-tight">{{ prod.nombre }}</h3>
                            <p class="text-xs text-[#2E221B]/50 line-clamp-2 mb-auto">{{ prod.descripcion || 'Especialidad de la casa' }}</p>
                            
                            <div class="flex items-center justify-between mt-3">
                              <span class="text-xl font-black text-[#B71C1C]">S/ {{ prod.precio | number:'1.2-2' }}</span>
                              
                              <!-- Add controls -->
                              @if (getCantidadEnCarrito(prod.id) > 0) {
                                <div class="flex items-center bg-[#F8F7F2] rounded-full border border-[#2E221B]/10 p-1 shadow-inner">
                                  <button (click)="modificarCantidadItem(prod.id, -1)" class="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#B71C1C] font-bold hover:bg-gray-50 transition-colors">-</button>
                                  <span class="w-8 text-center font-bold text-[#2E221B]">{{ getCantidadEnCarrito(prod.id) }}</span>
                                  <button (click)="modificarCantidadItem(prod.id, 1)" class="w-8 h-8 rounded-full bg-[#B71C1C] shadow-sm flex items-center justify-center text-white font-bold hover:bg-[#9b1515] transition-colors">+</button>
                                </div>
                              } @else {
                                <button 
                                  (click)="agregarAlCarrito(prod)"
                                  class="bg-[#B71C1C]/10 text-[#B71C1C] hover:bg-[#B71C1C] hover:text-white px-5 py-2 rounded-full font-bold transition-all flex items-center gap-1 text-sm shadow-sm">
                                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  Agregar
                                </button>
                              }
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
                
                @if (productos().length === 0) {
                  <div class="py-20 text-center text-[#2E221B]/40">
                    <div class="w-20 h-20 mx-auto mb-4 text-[#2E221B]/20">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Cargando menú...</h3>
                    <p>Preparando nuestros mejores platos para ti.</p>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Cart Sidebar -->
          <div class="w-[400px] bg-white border-l border-[#2E221B]/10 flex flex-col flex-shrink-0 z-20 shadow-2xl relative">
            
            <!-- Cart Header -->
            <div class="p-6 bg-[#2E221B] text-white">
              <h2 class="text-xl font-black flex items-center gap-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                MI PEDIDO
                <span class="ml-auto bg-[#B71C1C] text-white text-xs px-3 py-1 rounded-full font-bold shadow-inner border border-white/20">{{ totalItems() }} items</span>
              </h2>
            </div>

            <!-- Cart Items -->
            <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
              @for (item of carrito(); track item.producto.id; let i = $index) {
                <div class="bg-white p-4 rounded-2xl border border-[#2E221B]/10 shadow-sm relative group animate-fade-in">
                  
                  <div class="flex justify-between gap-2 mb-3">
                    <h4 class="font-bold text-[#2E221B] text-sm leading-tight pr-6 flex items-center gap-2">
                      <div class="w-4 h-4 text-gray-500"><app-categoria-icono [categoria]="item.producto.categoria" /></div>
                      {{ item.producto.nombre }}
                    </h4>
                    <div class="text-[#B71C1C] font-black text-sm whitespace-nowrap">S/ {{ (item.producto.precio * item.cantidad) | number:'1.2-2' }}</div>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <div class="text-xs text-[#2E221B]/50 font-medium bg-[#F8F7F2] px-2 py-1 rounded-md">
                      S/ {{ item.producto.precio | number:'1.2-2' }} c/u
                    </div>

                    <div class="flex items-center bg-[#F8F7F2] rounded-full border border-[#2E221B]/10 p-1">
                      <button (click)="modificarCantidad(i, -1)" class="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-100 text-[#B71C1C] font-bold transition-colors">-</button>
                      <span class="w-6 text-center font-bold text-sm text-[#2E221B]">{{ item.cantidad }}</span>
                      <button (click)="modificarCantidad(i, 1)" class="w-7 h-7 flex items-center justify-center rounded-full bg-[#B71C1C] shadow-sm hover:bg-[#9b1515] text-white font-bold transition-colors">+</button>
                    </div>
                  </div>
                  
                  <button (click)="eliminarItem(i)" class="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white shadow-md">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              }
              
              @if (carrito().length === 0) {
                <div class="flex flex-col items-center justify-center h-full text-center text-[#2E221B]/40 gap-4">
                  <div class="w-24 h-24 rounded-full bg-[#F8F7F2] flex items-center justify-center text-gray-300">
                    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  </div>
                  <p class="font-medium text-lg">Tu carrito está vacío</p>
                  <p class="text-sm">Agrega nuestros deliciosos<br>platos a tu pedido.</p>
                </div>
              }
            </div>

            <!-- Cart Footer -->
            <div class="p-6 bg-white border-t border-[#2E221B]/10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
              <div class="flex justify-between items-center mb-2">
                <span class="text-[#2E221B]/60 font-medium">Subtotal</span>
                <span class="font-bold text-[#2E221B]">S/ {{ totalPagar() / 1.18 | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between items-center mb-4">
                <span class="text-[#2E221B]/60 font-medium text-sm">IGV (18%)</span>
                <span class="font-bold text-[#2E221B] text-sm">S/ {{ totalPagar() - (totalPagar() / 1.18) | number:'1.2-2' }}</span>
              </div>
              
              <div class="flex justify-between items-end mb-6 pt-4 border-t border-dashed border-[#2E221B]/20">
                <span class="text-[#2E221B] font-bold">Total a Pagar</span>
                <span class="text-3xl font-black text-[#B71C1C]">S/ {{ totalPagar() | number:'1.2-2' }}</span>
              </div>
              
              <button 
                [disabled]="carrito().length === 0 || procesandoPedido()"
                (click)="enviarPedido()"
                class="w-full py-4 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3
                  disabled:opacity-50 disabled:cursor-not-allowed
                  bg-[#B71C1C] hover:bg-[#9b1515] text-white shadow-[#B71C1C]/30 hover:-translate-y-1">
                @if (procesandoPedido()) {
                  <svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                } @else {
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg> Confirmar Orden
                }
              </button>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  `,
})
export class PantallaClienteComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly mesasService = inject(MesasService);
  private readonly ventasService = inject(VentasService);
  private readonly http = inject(HttpClient);

  readonly nombreCliente = signal<string>('Cliente');
  readonly mesaNumero = signal<number | null>(null);
  readonly nombreMozo = signal<string | null>(null);
  readonly zona = signal<string>('');
  
  // Productos y Categorías
  readonly productos = signal<ProductoResponse[]>([]);
  
  readonly categorias = computed(() => {
    const prods = this.productos();
    const set = new Set(prods.map(p => p.categoria.toLowerCase()));
    return ['todos', ...Array.from(set)];
  });

  readonly productosPorCategoria = computed(() => {
    const prods = this.productos();
    const categories = Array.from(new Set(prods.map(p => p.categoria.toLowerCase())));
    
    return categories.map(cat => ({
      categoria: cat,
      productos: prods.filter(p => p.categoria.toLowerCase() === cat)
    }));
  });

  readonly categoriaSeleccionada = signal<string>('todos');

  // Carrito de compras
  readonly carrito = signal<CartItem[]>([]);
  
  readonly totalItems = computed(() => {
    return this.carrito().reduce((acc, item) => acc + item.cantidad, 0);
  });
  
  readonly totalPagar = computed(() => {
    return this.carrito().reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
  });

  readonly procesandoPedido = signal<boolean>(false);

  ngOnInit() {
    const user = this.authService.user();
    if (user) {
      this.nombreCliente.set(user.nombreCompleto || 'Cliente');
    }

    const sesionMesaId = sessionStorage.getItem('current_sesion_mesa_id');
    if (sesionMesaId) {
      this.mesasService.getSesionMesa(sesionMesaId).subscribe({
        next: (sesion) => {
          if (sesion.mesaId) {
            this.mesasService.getMesa(sesion.mesaId).subscribe({
              next: (mesa) => {
                this.mesaNumero.set(mesa.numero);
                if (mesa.zona) {
                  this.zona.set(mesa.zona.nombre);
                }
              }
            });
            
            // Cargar el mozo asignado a la mesa
            this.http.get<any>(`/api/v1/asignaciones-mozo/mesa/${sesion.mesaId}`).subscribe({
              next: (res) => {
                const asignaciones = res.data ? res.data : res;
                if (Array.isArray(asignaciones) && asignaciones.length > 0) {
                  const mozoId = asignaciones[0].mozoId;
                  this.http.get<any>(`/api/v1/usuarios/${mozoId}`).subscribe({
                    next: (mozoRes) => {
                      const mozo = mozoRes.data ? mozoRes.data : mozoRes;
                      this.nombreMozo.set(mozo.nombreCompleto || mozo.nombre || 'Desconocido');
                    },
                    error: (err) => {
                      console.error('No se pudo cargar el mozo:', err);
                      this.nombreMozo.set('Mozo no encontrado');
                    }
                  });
                } else {
                  this.nombreMozo.set('Sin mozo asignado');
                }
              },
              error: (err) => {
                console.error('No se pudo cargar la asignación del mozo:', err);
                this.nombreMozo.set('Error en asignación');
              }
            });
          }
        },
        error: (err) => console.error('No se pudo cargar la sesión de mesa', err)
      });
    }

    this.cargarProductos();
  }

  cargarProductos() {
    this.ventasService.getProductosActivos().subscribe({
      next: (res) => {
        if (res.success) {
          this.productos.set(res.data);
        }
      },
      error: (err) => console.error('Error cargando productos', err)
    });
  }

  scrollToCategory(cat: string) {
    this.categoriaSeleccionada.set(cat);
    if (cat === 'todos') {
      const container = document.getElementById('menu-scroll-container');
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    const element = document.getElementById('cat-' + cat);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onScroll(event: Event) {
    // Optional: Update selected category based on scroll position
    // This requires calculating element positions which is slightly complex for a simple component
  }

  getCantidadEnCarrito(productoId: string): number {
    const item = this.carrito().find(i => i.producto.id === productoId);
    return item ? item.cantidad : 0;
  }

  agregarAlCarrito(producto: ProductoResponse) {
    this.carrito.update(items => {
      const index = items.findIndex(i => i.producto.id === producto.id);
      if (index > -1) {
        const newItems = [...items];
        newItems[index].cantidad++;
        return newItems;
      }
      return [...items, { producto, cantidad: 1, notas: '' }];
    });
  }

  modificarCantidadItem(productoId: string, diff: number) {
    this.carrito.update(items => {
      const index = items.findIndex(i => i.producto.id === productoId);
      if (index > -1) {
        const newItems = [...items];
        newItems[index].cantidad += diff;
        if (newItems[index].cantidad <= 0) {
          newItems.splice(index, 1);
        }
        return newItems;
      }
      return items;
    });
  }

  modificarCantidad(index: number, diff: number) {
    this.carrito.update(items => {
      const newItems = [...items];
      newItems[index].cantidad += diff;
      if (newItems[index].cantidad <= 0) {
        newItems.splice(index, 1);
      }
      return newItems;
    });
  }

  eliminarItem(index: number) {
    this.carrito.update(items => {
      const newItems = [...items];
      newItems.splice(index, 1);
      return newItems;
    });
  }

  enviarPedido() {
    const sesionMesaId = sessionStorage.getItem('current_sesion_mesa_id');
    const user = this.authService.user();
    
    if (!sesionMesaId || !user) {
      alert('Error: No se encontró la sesión activa. Por favor, vuelva a escanear el QR.');
      return;
    }

    this.procesandoPedido.set(true);

    const request = {
      mesaId: sesionMesaId,
      clienteEmail: user.email,
      clienteNombre: user.nombreCompleto || 'Cliente',
      clienteTelefono: '',
      items: this.carrito().map(item => ({
        productoId: item.producto.id,
        nombre: item.producto.nombre,
        cantidad: item.cantidad,
        precio: item.producto.precio
      })),
      total: this.totalPagar()
    };

    this.ventasService.crearPedidoQR(request).subscribe({
      next: (res) => {
        this.procesandoPedido.set(false);
        if (res.success) {
          alert('¡Pedido enviado a cocina exitosamente!');
          this.carrito.set([]); // Limpiar carrito
        }
      },
      error: (err) => {
        this.procesandoPedido.set(false);
        console.error('Error al enviar pedido', err);
        alert('Ocurrió un error al procesar su pedido. Por favor, intente de nuevo.');
      }
    });
  }
}
