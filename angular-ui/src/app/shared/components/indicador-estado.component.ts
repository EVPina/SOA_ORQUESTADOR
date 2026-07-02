import { Component, input } from '@angular/core';
import { EstadoOrden } from '../models/orden.models';

@Component({
  selector: 'app-indicador-estado',
  imports: [],
  templateUrl: './indicador-estado.component.html',
  styleUrl: './indicador-estado.component.css',
})
export class IndicadorEstadoComponent {
  readonly estado = input.required<EstadoOrden>();
}
