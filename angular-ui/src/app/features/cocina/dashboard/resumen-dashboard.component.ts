import { Component, input } from '@angular/core';
import { DashboardStats } from '../../../shared/models/orden.models';

@Component({
  selector: 'app-resumen-dashboard',
  imports: [],
  templateUrl: './resumen-dashboard.component.html',
  styleUrl: './resumen-dashboard.component.css',
})
export class ResumenDashboardComponent {
  readonly stats = input.required<DashboardStats>();
}
