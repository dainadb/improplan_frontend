import { AfterViewInit, ApplicationRef, Component, computed, createComponent, EnvironmentInjector, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { dateIso } from '../../../../shared/utils/dateIso';
import { EventResponse } from '../../models/event-response';
import { FormsModule } from '@angular/forms';
import { ThemeFilter } from '../../../themes/components/theme-filter/theme-filter';
import { MunicipalityFilter } from '../../../location/components/municipality-filter/municipality-filter';
import { DateFilter } from '../../components/date-filter/date-filter';
import * as L from 'leaflet';   // 
import { EventMapPopup } from '../../components/event-map-popup/event-map-popup';
import { AuthState } from '../../../../core/state/auth.state';

@Component({
  selector: 'app-events-map',
  imports: [FormsModule, ThemeFilter, MunicipalityFilter, DateFilter],
  templateUrl: './events-map.html',
  styleUrl: './events-map.css',
})
export class EventsMap implements OnInit, AfterViewInit, OnDestroy {

  private readonly route             = inject(ActivatedRoute);
  private readonly router            = inject(Router);
  private readonly eventService      = inject(EventService);
  private readonly appRef            = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly authState           = inject(AuthState);

  readonly isAuthenticated = this.authState.isAuthenticated;

  readonly provinceName         = signal<string>('');
  readonly eventDate            = signal<string>(dateIso());
  readonly selectedMunicipality = signal<string>('');
  readonly selectedTheme        = signal<string>('');
  readonly searchName           = signal<string>('');
  readonly events               = signal<EventResponse[]>([]);
  readonly error                = signal<string | null>(null);

  readonly pageTitle = computed(() =>
    this.provinceName() ? `Eventos en ${this.provinceName()}` : 'Eventos'
  );

  readonly filteredEvents = computed(() => {
    const query = this.searchName().trim().toLowerCase();
    if (!query) return this.events();
    return this.events().filter(e => e.name.toLowerCase().includes(query));
  });

  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup = L.layerGroup();
  private viewReady = false;
  private pendingRender = false;

  //  Lifecycle 

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const province = params['provinceName']     ?? '';
      const date     = params['eventDate']        ?? dateIso();
      const theme    = params['themeName']        ?? '';
      const muni     = params['municipalityName'] ?? '';
      const search   = params['searchName']       ?? '';

      this.provinceName.set(province);
      this.eventDate.set(date);
      this.selectedTheme.set(theme);
      this.selectedMunicipality.set(muni);
      this.searchName.set(search);

      if (province) {
        this.loadEvents(province, date, theme || undefined, muni || undefined);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.viewReady = true;
    if (this.pendingRender) {
      this.renderMarkers();
      this.pendingRender = false;
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  // Carga de datos 

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
          this.events.set(res.data ?? []);
          if (this.viewReady) this.renderMarkers();
          else this.pendingRender = true;
        },
        error: () => this.error.set('No se pudieron cargar los eventos. Inténtalo de nuevo.'),
      });
  }

  // Handlers filtros 

  onMunicipalitySelected(municipalityName: string): void {
    this.selectedMunicipality.set(municipalityName);
    this.loadEvents(this.provinceName(), this.eventDate(),
      this.selectedTheme() || undefined, municipalityName || undefined);
  }

  onDateSelected(eventDate: string): void {
    this.eventDate.set(eventDate);
    this.loadEvents(this.provinceName(), eventDate,
      this.selectedTheme() || undefined, this.selectedMunicipality() || undefined);
  }

  onThemeSelected(themeName: string): void {
    this.selectedTheme.set(themeName);
    this.loadEvents(this.provinceName(), this.eventDate(),
      themeName || undefined, this.selectedMunicipality() || undefined);
  }

  onSearchNameChange(value: string): void {
    this.searchName.set(value);
    if (this.viewReady) this.renderMarkers();
  }

  goToList(): void {
    this.router.navigate(['/events/list'], {
      queryParams: {
        provinceName:     this.provinceName(),
        eventDate:        this.eventDate(),
        themeName:        this.selectedTheme()        || undefined,
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

  // Leaflet

  private initMap(): void {
    this.map = L.map('event-map-container', {
      center: [40.416775, -3.703790],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);
  }

  private renderMarkers(): void {
    if (!this.map) return;

    this.markersLayer.clearLayers();

    const validEvents = this.filteredEvents().filter(e => e.latitude && e.longitude);
    if (validEvents.length === 0) return;

    validEvents.forEach(event => {
      const marker = L.marker([event.latitude, event.longitude], {
        icon: this.buildIcon(),
      });

      // Popup con componente Angular
      const popup = L.popup({
        maxWidth: 280,
        minWidth: 256,
        className: 'event-map-popup',
      });

      // Creamos el componente dinámicamente
      const popupEl = document.createElement('div');
      const compRef = createComponent(EventMapPopup, {
        environmentInjector: this.environmentInjector,
        hostElement: popupEl,
      });

      // Pasamos el evento como input
      compRef.setInput('event', event);

      // Adjuntamos al árbol de change detection de Angular
      this.appRef.attachView(compRef.hostView);

      popup.setContent(popupEl);

      // Limpiamos el componente cuando se cierra el popup
      marker.on('popupclose', () => {
        this.appRef.detachView(compRef.hostView);
        compRef.destroy();
      });

      marker.bindPopup(popup);
      this.markersLayer.addLayer(marker);
    });

    const group = L.featureGroup(this.markersLayer.getLayers());
    this.map.fitBounds(group.getBounds().pad(0.15), { maxZoom: 13 });
  }

  private buildIcon(): L.DivIcon {
    return L.divIcon({
      className: '',
      html: `
        <div class="event-map-marker">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
               fill="currentColor" width="32" height="32">
            <path fill-rule="evenodd"
              d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041
                 a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.013
                 3.5-4.512 3.5-7.327a8 8 0 10-16 0c0 2.815 1.556 5.314 3.5 7.327
                 a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742z"
              clip-rule="evenodd"/>
          </svg>
        </div>`,
      iconSize:   [32, 40],
      iconAnchor: [16, 40],
      popupAnchor:[0, -42],
    });
  }
}