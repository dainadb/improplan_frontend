import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { EventResponse } from '../../models/event-response';
import { EventCard } from "../../../../shared/components/event-card/event-card";
import { dateIso } from '../../../../shared/utils/dateIso';
import { FormsModule } from '@angular/forms';
import { ThemeFilter } from '../../../themes/components/theme-filter/theme-filter';
import { DateFilter } from '../../components/date-filter/date-filter';
import { MunicipalityFilter } from '../../../location/components/municipality-filter/municipality-filter';
import { AuthState } from '../../../../core/state/auth.state';

@Component({
  selector: 'app-event-list',
  imports: [EventCard, FormsModule, ThemeFilter, MunicipalityFilter, DateFilter],
  host: { class: 'w-full' },
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList implements OnInit {

  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);
  private readonly eventService = inject(EventService);
  private readonly authState    = inject(AuthState);

  readonly isAuthenticated = this.authState.isAuthenticated;

  // Provincia fecha y municipio recibidos por queryParam 
  readonly provinceName = signal<string>('');
  readonly eventDate = signal<string>(dateIso());
  readonly selectedMunicipality = signal<string>('');
  
  // Tema seleccionado desde el filtro de temáticas
  readonly selectedTheme = signal<string>('');  

  // Eventos cargados desde el backend
  readonly events = signal<EventResponse[]>([]);
  // Mensaje de error en caso de fallo al cargar eventos
  readonly error   = signal<string | null>(null);

  // Filtro de búsqueda por nombre
  readonly searchName = signal<string>('');
  
  // Título dinámico: "Eventos en Sevilla"
  readonly pageTitle = computed(() =>
    this.provinceName() ? `Eventos en ${this.provinceName()}` : 'Eventos'
  );

  
/**
 * Cuando el componente se inicializa, nos suscribimos a los cambios en los queryParams de la ruta.
 * Cada vez que cambien los queryParams, actualizamos las señales provinceName y eventDate con los nuevos valores.
 * Si provinceName tiene un valor (es decir, si se ha seleccionado una provincia), llamamos a loadEvents para cargar los eventos correspondientes a esa provincia y fecha.
 */
  ngOnInit(): void {
    
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
   * desde los componentes theme-filter, municipality-filter y date-filter.
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
   *  Maneja la selección de un municipio desde el componente MunicipalityFilter.
   *  Actualiza el filtro de municipio y recarga los eventos con el nuevo filtro.
   * @param municipalityName  
   */
  onMunicipalitySelected(municipalityName: string): void {
    this.selectedMunicipality.set(municipalityName);
    this.loadEvents(
      this.provinceName(),
      this.eventDate(),               
      this.selectedTheme() || undefined,
      municipalityName || undefined,
    );
  }

  /**
   *  Maneja la selección de una fecha desde el componente DateFilter.
   *  Actualiza el filtro de fecha y recarga los eventos con el nuevo filtro.
   * @param eventDate  
   */
  onDateSelected(eventDate: string): void {
    this.eventDate.set(eventDate);    // actualiza la señal existente
    this.loadEvents(
      this.provinceName(),
      eventDate,
      this.selectedTheme() || undefined,
      this.selectedMunicipality() || undefined,
    );
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
      themeName || undefined,   
      this.selectedMunicipality() || undefined, 
    );
  }



  /** Navega a la vista de mapa con los mismos filtros activos */
  goToMap(): void {
    this.router.navigate(['/events/map'], {
      queryParams: {
        provinceName: this.provinceName(),
        eventDate: this.eventDate(),
        themeName:        this.selectedTheme()       || undefined,
        municipalityName: this.selectedMunicipality() || undefined,
        searchName:       this.searchName()           || undefined,
      },
    });
  }

   /**
   * Si el usuario está autenticado navega al formulario de creación.
   * Si no, redirige al login.
   */
  goToCreate(): void {
    if (this.isAuthenticated()) {
      this.router.navigate(['/events/create']);
    } else {
      this.router.navigate(['/login']);
    }
  }



  /**
   * Filtra los eventos por nombre, insensible a mayúsculas y tildes.
   * Si no hay ningún término de búsqueda, devuelve todos los eventos.
   */
  //filteredEvents es una propiedad 
  readonly filteredEvents = computed(() => { 
    const query = this.searchName().trim().toLowerCase();

    if (!query) return this.events();

    return this.events().filter(e =>
      e.name.toLowerCase().includes(query)
    );
  });


}