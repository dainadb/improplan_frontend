import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { LocationService } from '../../services/location-service';
import { MunicipalityResponse } from '../../models/municipality-response';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-municipality-filter',
  imports: [FormsModule],
  templateUrl: './municipality-filter.html',
  styleUrl: './municipality-filter.css',
})
export class MunicipalityFilter {
private readonly locationService = inject(LocationService);

  // Provincia activa — viene del queryParam que leyó EventList
  readonly provinceName = input<string>('');

  // Emite el nombre del municipio seleccionado 
  readonly municipalitySelected = output<string>();

  
  readonly municipalities       = signal<MunicipalityResponse[]>([]);
  readonly searchText           = signal<string>('');
  readonly selectedMunicipality = signal<string>('');
  readonly dropdownOpen         = signal<boolean>(false);

  /**
   * Lista de municipios filtrada según el texto de búsqueda. Si el texto está vacío, muestra todos los municipios.
   */
  readonly filteredMunicipalities = computed(() => {

    const query = this.searchText().trim().toLowerCase();

    if (!query) return this.municipalities();

    return this.municipalities().filter(m =>
      m.name.toLowerCase().includes(query)
    );
  });

  /**
   * Efecto que se dispara cada vez que cambia la provincia seleccionada. Limpia el estado actual y carga los municipios de la nueva provincia.
   */
  constructor() {
    
    effect(() => {
      const province = this.provinceName();

      this.selectedMunicipality.set('');
      this.searchText.set('');
      this.municipalities.set([]);

      if (province) {
        this.loadMunicipalities(province);
      }
    });
  }

 
  /**
   *  Carga los municipios de la provincia dada y los almacena en el estado. Si ocurre un error, simplemente no se actualiza la lista.
   * @param provinceName Nombre de la provincia de la que se quieren obtener los municipios
   */
  private loadMunicipalities(provinceName: string): void {
    this.locationService.getMunicipalitiesByProvince(provinceName).subscribe({
      next: (res) => this.municipalities.set(res.data ?? []),
      error: () => {},
    });
  }

  /**
   * Al escribir en el input de búsqueda, se desvincula cualquier selección confirmada previamente y se abre el dropdown para mostrar las opciones filtradas.
   */
  onSearchInput(): void {
    // Al escribir desvinculamos la selección confirmada
    this.selectedMunicipality.set('');
    this.dropdownOpen.set(true);
  }

  /**
   *  Al seleccionar un municipio del dropdown, se actualiza el estado con el nombre del municipio seleccionado, se cierra el dropdown y se emite el evento con el nombre del municipio.
   * @param municipality Municipio seleccionado
   */
  selectMunicipality(municipality: MunicipalityResponse): void {
    this.selectedMunicipality.set(municipality.name);
    this.searchText.set(municipality.name);
    this.dropdownOpen.set(false);
    this.municipalitySelected.emit(municipality.name);
  }

  /**
   * Al hacer click en el botón de limpiar, se borra la selección actual, se limpia el texto de búsqueda y se emite un evento con cadena vacía para indicar que no hay municipio seleccionado.
   */
  clearMunicipality(): void {
    this.selectedMunicipality.set('');
    this.searchText.set('');
    this.municipalitySelected.emit('');
  }

  /**
   * Pequeño delay para que el click en una opción se registre antes de cerrar
   */
  onBlur(): void {
    setTimeout(() => this.dropdownOpen.set(false), 150);
  }
}