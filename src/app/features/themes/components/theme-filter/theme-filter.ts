import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { ThemeResponse } from '../../models/theme-response';

@Component({
  selector: 'app-theme-filter',
  imports: [],
  templateUrl: './theme-filter.html',
  styleUrl: './theme-filter.css',
})
export class ThemeFilter  implements OnInit {

 private readonly themeService = inject(ThemeService);

  // Temática actualmente seleccionada (viene del padre)
  readonly selectedTheme = input<string>('');

  // Emite el nombre de la temática seleccionada ('' = Todos)
  readonly themeSelected = output<string>();

  // Lista de temáticas disponibles
  readonly themes = signal<ThemeResponse[]>([]);

  /**
   * Al iniciar el componente, se cargan todas las temáticas disponibles desde el servicio. El resultado se almacena en un signal para ser usado en la plantilla.
   */
  ngOnInit(): void {
    this.themeService.getAllThemes().subscribe({
      next: (res) => this.themes.set(res.data ?? []),
      error: () => {},
    });
  }

  /**
   *  Al seleccionar una temática, se emite un evento con el nombre de la temática seleccionada. Si se selecciona "Todas", se emite una cadena vacía para indicar que no hay filtro de temática.
   * @param themeName Nombre de la temática seleccionada
   */
  select(themeName: string): void {
    this.themeSelected.emit(themeName);
  }
}