import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { EventResponse } from '../../models/event-response';
import { EventCard } from "../../../../shared/components/event-card/event-card";
import { dateIso } from '../../../../shared/utils/dateIso';
import { FormsModule } from '@angular/forms';
import { ThemeFilter } from '../../../themes/components/theme-filter/theme-filter';

@Component({
  selector: 'app-event-list',
  imports: [EventCard, RouterLink, FormsModule, ThemeFilter],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList implements OnInit {

  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);
  private readonly eventService = inject(EventService);

  // Provincia recibida por queryParam (ej: /events?provinceName=Sevilla&eventDate=2026-03-02)
  readonly provinceName = signal<string>('');
  readonly eventDate    = signal<string>('');
  
  readonly selectedTheme = signal<string>('');  

  readonly events = signal<EventResponse[]>([]);
  readonly error   = signal<string | null>(null);

  // Búsqueda por nombre (filtrado en cliente)
  readonly searchName = signal<string>('');

  // Título dinámico: "Eventos en Sevilla"
  readonly pageTitle = computed(() =>
    this.provinceName() ? `Eventos en ${this.provinceName()}` : 'Eventos'
  );

  ngOnInit(): void {
    // Leemos los queryParams iniciales y cargamos los eventos
    this.route.queryParams.subscribe(params => {
      const province = params['provinceName'] ?? '';
      const date     = params['eventDate']    ?? dateIso(); // Si no viene fecha, usamos la actual que con la funcion dateIso() obtenemos en formato 'YYYY-MM-DD'

      this.provinceName.set(province);
      this.eventDate.set(date);

      if (province) {
        this.loadEvents(province, date);
      }
    });
  }

  /**
   * Carga los eventos llamando al servicio con los filtros actuales.
   * Los filtros opcionales (theme, municipality, maxPrice) se gestionarán
   * desde los componentes theme-filter y municipality-date-filter.
   */
  loadEvents(
    provinceName: string,
    eventDate: string,
    themeName?: string,
    municipalityName?: string,
    maxPrice?: number
  ): void {
    
    this.error.set(null);

    this.eventService
      .searchPublishedEvents(provinceName, eventDate, themeName, municipalityName, maxPrice)
      .subscribe({
        next: (res) => {
          this.events.set(res.data ?? []); // Si res.data es null o undefined, se asigna un array vacío
          
        },
        error: () => {
          this.error.set('No se pudieron cargar los eventos. Inténtalo de nuevo.');
          
        },
      });
  }


 /** 
  * Maneja la selección de una temática desde el componente ThemeFilter.
  * Actualiza el filtro de temática y recarga los eventos con el nuevo filtro.
 */
  onThemeSelected(themeName: string): void {
    this.selectedTheme.set(themeName);
    this.loadEvents(
      this.provinceName(),
      this.eventDate(),
      themeName || undefined,   // '' → undefined → sin filtro de tema en BBDD
    );
  }



  /** Navega a la vista de mapa con los mismos filtros activos */
  goToMap(): void {
    this.router.navigate(['/events/map'], {
      queryParams: {
        provinceName: this.provinceName(),
        eventDate: this.eventDate(),
      },
    });
  }

   // Eventos filtrados por nombre (insensible a mayúsculas/tildes)
  readonly filteredEvents = computed(() => { //
    const query = this.searchName().trim().toLowerCase();
    if (!query) return this.events();
    return this.events().filter(e =>
      e.name.toLowerCase().includes(query)
    );
  });




  

}