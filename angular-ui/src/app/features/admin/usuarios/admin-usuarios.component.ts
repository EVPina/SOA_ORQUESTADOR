import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar.component';
import { UsuariosService, Usuario, UsuarioPayload } from './usuarios.service';
import { AuthService } from '../../auth/auth.service';

const ROLES_STAFF = ['ADMIN', 'RECEPCIONISTA', 'JEFE_COCINA', 'CAJA', 'MOZO'] as const;

interface FormUsuario {
  id: string | null;
  username: string;
  password: string;
  nombreCompleto: string;
  email: string;
  rol: string;
}

function formVacio(): FormUsuario {
  return { id: null, username: '', password: '', nombreCompleto: '', email: '', rol: 'MOZO' };
}

@Component({
  selector: 'app-admin-usuarios',
  imports: [CommonModule, SidebarComponent, DatePipe, FormsModule],
  template: `
    <div class="h-dvh w-full bg-[#F8F7F2] flex">
      <app-sidebar />

      <div class="flex-1 flex flex-col overflow-hidden bg-[#F8F7F2]">
        <header class="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div>
            <h2 class="text-xl font-bold text-gray-800 tracking-tight">Gestión de Usuarios</h2>
            <p class="text-sm text-gray-500 font-medium mt-0.5">Personal con acceso al sistema</p>
          </div>
          <div class="flex items-center gap-8">
            <div class="bg-red-50 text-red-900 px-4 py-2 rounded-xl border border-red-100 font-mono text-lg font-bold tracking-wider shadow-inner flex items-center gap-2">
              <svg class="w-5 h-5 text-red-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ horaActual() | date:'hh:mm:ss a' }}
            </div>
          </div>
        </header>

        <main class="flex-1 overflow-auto p-8 relative">
          <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#B71C1C 1px, transparent 1px); background-size: 24px 24px;"></div>

          <div class="relative z-10 max-w-7xl mx-auto flex flex-col gap-6">

            @if (mensaje()) {
              <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                {{ mensaje() }}
              </div>
            }
            @if (error()) {
              <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                {{ error() }}
              </div>
            }

            <!-- Filtros y acción crear -->
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div class="flex gap-4 w-full md:w-auto">
                <div class="relative flex-1 md:w-64">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <input type="text" [ngModel]="filtroTexto()" (ngModelChange)="filtroTexto.set($event)" placeholder="Buscar por nombre, usuario o email..." class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none">
                </div>

                <div class="relative">
                  <select [ngModel]="filtroRol()" (ngModelChange)="filtroRol.set($event)" class="pl-4 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none appearance-none font-medium text-gray-700">
                    <option value="">Todos los roles</option>
                    @for (rol of roles; track rol) {
                      <option [value]="rol">{{ rol }}</option>
                    }
                  </select>
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <button (click)="abrirModalCrear()" class="bg-[#B71C1C] hover:bg-[#9b1515] text-white px-5 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2 whitespace-nowrap">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Nuevo Usuario
              </button>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-100">
                    <th class="p-4 font-semibold text-gray-600 text-sm tracking-wide">Usuario</th>
                    <th class="p-4 font-semibold text-gray-600 text-sm tracking-wide">Correo</th>
                    <th class="p-4 font-semibold text-gray-600 text-sm tracking-wide">Rol</th>
                    <th class="p-4 font-semibold text-gray-600 text-sm tracking-wide">Estado</th>
                    <th class="p-4 font-semibold text-gray-600 text-sm tracking-wide text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (usuario of usuariosFiltrados(); track usuario.id) {
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="p-4">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                            {{ (usuario.nombreCompleto || usuario.username).substring(0, 2).toUpperCase() }}
                          </div>
                          <div>
                            <p class="font-bold text-gray-900">{{ usuario.nombreCompleto || '(sin nombre)' }}</p>
                            <p class="text-xs text-gray-400">&#64;{{ usuario.username }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="p-4">
                        <p class="text-gray-900 font-medium">{{ usuario.email || '—' }}</p>
                      </td>
                      <td class="p-4">
                        <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{{ usuario.rol }}</span>
                      </td>
                      <td class="p-4">
                        @if (usuario.estado === 'ACTIVO') {
                          <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Activo</span>
                        } @else {
                          <span class="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{{ usuario.estado }}</span>
                        }
                      </td>
                      <td class="p-4 text-right">
                        <div class="flex justify-end gap-2">
                          <button (click)="abrirModalEditar(usuario)" class="bg-[#2E221B] hover:bg-black text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                            Editar
                          </button>
                          <button (click)="confirmarEliminar(usuario)"
                                  [disabled]="usuario.username === miUsername"
                                  [class.opacity-40]="usuario.username === miUsername"
                                  [class.cursor-not-allowed]="usuario.username === miUsername"
                                  class="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border border-red-100">
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="p-8 text-center text-gray-500">
                        @if (cargando()) {
                          <div class="flex justify-center py-4">
                            <div class="w-8 h-8 border-4 border-red-200 border-t-[#B71C1C] rounded-full animate-spin"></div>
                          </div>
                          <p>Cargando usuarios...</p>
                        } @else if (usuarios().length > 0) {
                          <p>No se encontraron usuarios que coincidan con la búsqueda.</p>
                        } @else {
                          <p>No hay usuarios registrados.</p>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

          </div>
        </main>
      </div>

      <!-- Modal Crear/Editar -->
      @if (modalAbierto()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 class="text-xl font-bold text-gray-900">{{ form.id ? 'Editar Usuario' : 'Nuevo Usuario' }}</h3>
              <button (click)="cerrarModal()" class="text-gray-400 hover:text-gray-600 bg-white rounded-full p-2 shadow-sm border border-gray-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form (ngSubmit)="guardar()" class="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
              @if (errorModal()) {
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm">
                  {{ errorModal() }}
                </div>
              }

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Usuario (login)</label>
                <input type="text" [(ngModel)]="form.username" name="username" required minlength="3"
                       [disabled]="!!form.id"
                       [class.bg-gray-100]="!!form.id"
                       class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all">
                @if (form.id) {
                  <p class="text-xs text-gray-400 mt-1">El usuario de login no se puede cambiar.</p>
                }
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña {{ form.id ? '(dejar en blanco para no cambiar)' : '' }}
                </label>
                <input type="password" [(ngModel)]="form.password" name="password" [required]="!form.id" minlength="6"
                       placeholder="••••••••"
                       class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input type="text" [(ngModel)]="form.nombreCompleto" name="nombreCompleto" required
                       class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                <input type="email" [(ngModel)]="form.email" name="email" required
                       class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select [(ngModel)]="form.rol" name="rol" required
                        class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all bg-white">
                  @for (rol of roles; track rol) {
                    <option [value]="rol">{{ rol }}</option>
                  }
                </select>
              </div>

              <div class="flex justify-end gap-3 mt-2">
                <button type="button" (click)="cerrarModal()" class="px-5 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                  Cancelar
                </button>
                <button type="submit" [disabled]="guardando()"
                        class="bg-[#B71C1C] hover:bg-[#9b1515] disabled:bg-[#B71C1C]/50 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors">
                  {{ guardando() ? 'Guardando...' : (form.id ? 'Guardar Cambios' : 'Crear Usuario') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Modal Confirmar Eliminar -->
      @if (usuarioAEliminar()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div class="p-6">
              <h3 class="text-lg font-bold text-gray-900">¿Eliminar usuario?</h3>
              <p class="text-sm text-gray-500 mt-2">
                Esta acción eliminará permanentemente a
                <span class="font-semibold text-gray-800">{{ usuarioAEliminar()?.nombreCompleto || usuarioAEliminar()?.username }}</span>
                del sistema. No se puede deshacer.
              </p>
            </div>
            <div class="p-6 pt-0 flex justify-end gap-3">
              <button (click)="usuarioAEliminar.set(null)" class="px-5 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                Cancelar
              </button>
              <button (click)="eliminar()" [disabled]="guardando()"
                      class="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors">
                {{ guardando() ? 'Eliminando...' : 'Sí, eliminar' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminUsuariosComponent implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  private readonly authService = inject(AuthService);

  readonly roles = ROLES_STAFF;
  // LoginResponseDTO de EMPLEADO no trae id, solo username: comparamos por username.
  readonly miUsername = this.authService.user()?.username;

  readonly horaActual = signal(new Date());
  readonly usuarios = signal<Usuario[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);

  readonly filtroTexto = signal('');
  readonly filtroRol = signal('');

  readonly mensaje = signal('');
  readonly error = signal('');
  readonly errorModal = signal('');

  readonly modalAbierto = signal(false);
  readonly usuarioAEliminar = signal<Usuario | null>(null);

  form: FormUsuario = formVacio();

  readonly usuariosFiltrados = computed(() => {
    let result = this.usuarios();
    const texto = this.filtroTexto().trim().toLowerCase();
    const rol = this.filtroRol();

    if (texto) {
      result = result.filter(u =>
        u.nombreCompleto?.toLowerCase().includes(texto) ||
        u.username?.toLowerCase().includes(texto) ||
        u.email?.toLowerCase().includes(texto)
      );
    }

    if (rol) {
      result = result.filter(u => u.rol === rol);
    }

    return result;
  });

  constructor() {
    setInterval(() => this.horaActual.set(new Date()), 1000);
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.usuariosService.getAllUsuarios().subscribe(data => {
      this.usuarios.set(data);
      this.cargando.set(false);
    });
  }

  abrirModalCrear(): void {
    this.form = formVacio();
    this.errorModal.set('');
    this.modalAbierto.set(true);
  }

  abrirModalEditar(usuario: Usuario): void {
    this.form = {
      id: usuario.id,
      username: usuario.username,
      password: '',
      nombreCompleto: usuario.nombreCompleto,
      email: usuario.email,
      rol: usuario.rol,
    };
    this.errorModal.set('');
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  guardar(): void {
    this.errorModal.set('');
    this.guardando.set(true);

    const payload: UsuarioPayload = {
      username: this.form.username,
      nombreCompleto: this.form.nombreCompleto,
      email: this.form.email,
      rol: this.form.rol,
      ...(this.form.password ? { password: this.form.password } : {}),
    };

    const esEdicion = !!this.form.id;
    const idEditado = this.form.id;
    const rolCambio = esEdicion && this.usuarios().find(u => u.id === idEditado)?.rol !== this.form.rol;

    const peticion = esEdicion
      ? this.usuariosService.actualizarUsuario(idEditado!, payload)
      : this.usuariosService.crearUsuario(payload);

    peticion.subscribe({
      next: () => {
        if (esEdicion && rolCambio) {
          this.usuariosService.cambiarRol(idEditado!, this.form.rol).subscribe();
        }
        this.mostrarMensaje(esEdicion ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.');
        this.modalAbierto.set(false);
        this.guardando.set(false);
        this.cargarUsuarios();
      },
      error: (err) => {
        this.errorModal.set(this.extraerError(err));
        this.guardando.set(false);
      },
    });
  }

  confirmarEliminar(usuario: Usuario): void {
    if (usuario.username === this.miUsername) return;
    this.usuarioAEliminar.set(usuario);
  }

  eliminar(): void {
    const usuario = this.usuarioAEliminar();
    if (!usuario) return;

    this.guardando.set(true);
    this.usuariosService.eliminarUsuario(usuario.id).subscribe({
      next: () => {
        this.mostrarMensaje('Usuario eliminado correctamente.');
        this.usuarioAEliminar.set(null);
        this.guardando.set(false);
        this.cargarUsuarios();
      },
      error: (err) => {
        this.error.set(this.extraerError(err));
        this.usuarioAEliminar.set(null);
        this.guardando.set(false);
      },
    });
  }

  private mostrarMensaje(msg: string): void {
    this.error.set('');
    this.mensaje.set(msg);
    setTimeout(() => this.mensaje.set(''), 4000);
  }

  private extraerError(err: any): string {
    const msg = err?.error?.message || err?.error?.mensaje || err?.error;
    if (typeof msg === 'string') return msg;
    return 'Ocurrió un error. Intenta de nuevo.';
  }
}
