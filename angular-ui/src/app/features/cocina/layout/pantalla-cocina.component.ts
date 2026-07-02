import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ResumenDashboardComponent } from '../dashboard/resumen-dashboard.component';
import { ListaOrdenesComponent } from '../ordenes/lista-ordenes.component';
import { SidebarComponent } from '../../../shared/components/sidebar.component';
import { CocinaService } from '../../../core/services/cocina.service';
import { AuthService } from '../../auth/auth.service';
import { OrdenProduccionDTO, DashboardStats } from '../../../shared/models/orden.models';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-pantalla-cocina',
  imports: [CommonModule, DatePipe, ResumenDashboardComponent, ListaOrdenesComponent, SidebarComponent, FormsModule],
  templateUrl: './pantalla-cocina.component.html',
  styleUrl: './pantalla-cocina.component.css',
})
export class PantallaCocinaComponent implements OnInit, OnDestroy {
  private readonly cocinaService = inject(CocinaService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private pollingSub?: Subscription;

  readonly ordenes = signal<OrdenProduccionDTO[]>([]);
  readonly stats = signal<DashboardStats>({
    ordenesPendientes: 0,
    ordenesPreparando: 0,
    ordenesListas: 0,
    ordenesEntregadas: 0,
    tiempoPreparacionPromedio: 0,
  });
  readonly horaActual = signal(new Date());

  // Filtros
  searchTerm = signal('');
  filtroMesa = signal('Todas');
  filtroZona = signal('Todas');

  readonly ordenesFiltradas = computed(() => {
    let result = this.ordenes();
    const search = this.searchTerm().toLowerCase().trim();
    
    if (search) {
      result = result.filter(o => 
        o.clienteNombre?.toLowerCase().includes(search) || 
        o.mesaNumero?.toString().includes(search)
      );
    }
    
    if (this.filtroMesa() !== 'Todas') {
      result = result.filter(o => o.mesaNumero?.toString() === this.filtroMesa());
    }

    if (this.filtroZona() !== 'Todas') {
       // La zona se calcula temporalmente en base a la mesa, ya que el backend aún no provee "zona"
       result = result.filter(o => {
         const m = o.mesaNumero || 0;
         if (this.filtroZona() === 'Salón Principal') return m >= 1 && m <= 10;
         if (this.filtroZona() === 'Terraza') return m > 10;
         if (this.filtroZona() === 'Para Llevar') return m === 0;
         return true;
       });
    }

    return result;
  });

  ngOnInit() {
    this.cargarDatos();
    this.pollingSub = interval(5000).subscribe(() => this.cargarDatos());
  }

  ngOnDestroy() {
    this.pollingSub?.unsubscribe();
  }

  cargarDatos() {
    this.cocinaService.getOrdenesActivas().subscribe(ordenes => {
      this.ordenes.set(ordenes);
      this.stats.set({
        ordenesPendientes: ordenes.filter(o => o.estado === 'PENDIENTE').length,
        ordenesPreparando: ordenes.filter(o => o.estado === 'PREPARANDO').length,
        ordenesListas: ordenes.filter(o => o.estado === 'LISTO').length,
        ordenesEntregadas: ordenes.filter(o => o.estado === 'ENTREGADO').length,
        tiempoPreparacionPromedio: 0,
      });
    });
    this.horaActual.set(new Date());
  }

  irAjustes() {
    this.router.navigate(['/ajustes']);
  }

  cerrarSesion() {
    this.authService.logout();
  }
}
