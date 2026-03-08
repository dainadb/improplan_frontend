import { Component, computed, effect, input, OnInit, output, signal } from '@angular/core';
import { dateIso } from '../../../../shared/utils/dateIso';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-filter',
  imports: [FormsModule],
  templateUrl: './date-filter.html',
  styleUrl: './date-filter.css',
})
export class DateFilter {

  readonly eventDate    = input<string>(); // Recibimos la fecha seleccionada desde el padre (los queryParams)
  readonly dateSelected = output<string>(); // Emitimos la fecha seleccionada al padre para que pueda actualizar los queryParams

  // Arranca directamente con el valor de la fecha de hoy
  readonly selectedDate = signal<string>(dateIso());

  /**
   * Genera un array con los próximos 14 días, formateados para mostrar en el select.
   * El value es la fecha en formato ISO (YYYY-MM-DD) y el label es una fecha legible.
   */
  readonly next14Days = computed(() => {
    const days: { label: string; value: string }[] = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);

      d.setDate(today.getDate() + i);
      days.push({
        value: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
      });
    }
    return days;
  });

  /**
   * Cuando el componente se inicializa, sincronizamos la señal interna con el valor del input eventDate.
   * Esto asegura que si el padre ya ha pasado una fecha (por ejemplo, desde los queryParams), el select muestre esa fecha seleccionada.
   * Además, cada vez que el padre actualice eventDate, la señal selectedDate se actualizará automáticamente gracias al efecto.
   */
  constructor() {
    effect(() => { 
      const date = this.eventDate();
      if (date) this.selectedDate.set(date); // si el padre ha pasado una fecha, la usamos como valor inicial
    }, { allowSignalWrites: true }); // allowSignalWrites es necesario para poder actualizar selectedDate dentro del efecto.
  }

  /**
   *  Cuando el usuario selecciona una fecha del select, actualizamos la señal selectedDate y emitimos el nuevo valor al padre a través de dateSelected.
   * @param value 
   */
  onDateChange(value: string): void {
    this.selectedDate.set(value);
    this.dateSelected.emit(value);
  }
}