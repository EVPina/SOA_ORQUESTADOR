import { Component, input } from '@angular/core';

@Component({
  selector: 'app-numero-mesa',
  imports: [],
  templateUrl: './numero-mesa.component.html',
  styleUrl: './numero-mesa.component.css',
})
export class NumeroMesaComponent {
  readonly numero = input.required<number>();
}
