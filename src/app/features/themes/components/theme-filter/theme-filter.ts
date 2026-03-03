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

   readonly themes = signal<ThemeResponse[]>([]);

  ngOnInit(): void {
    this.themeService.getAllThemes().subscribe({
      next: (res) => this.themes.set(res.data ?? []),
      error: () => {},
    });
  }

  select(themeName: string): void {
    this.themeSelected.emit(themeName);
  }
}