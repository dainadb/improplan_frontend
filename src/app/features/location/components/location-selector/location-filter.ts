import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocationService } from '../../services/location-service';
import { Router } from '@angular/router';
import { CommunityResponse } from '../../models/community-response';
import { ProvinceResponse } from '../../models/province-response';
import { dateIso } from '../../../../shared/utils/dateIso';

/**
 * Componente de filtro de localización.
 * Responsabilidad única: capturar comunidad autónoma y provincia,
 * y navegar a la lista de eventos con esos parámetros.
 *
 * No es una página: se usa como componente hijo dentro de HomeComponent.
 */
@Component({
  selector: 'app-location-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './location-filter.html',
  styleUrl: './location-filter.css'
})
export class LocationFilterComponent implements OnInit {
  
  private readonly locationService = inject(LocationService);
  private readonly router          = inject(Router);

  // Listas de comunidades autónomas y provincias para los selects
  readonly communities = signal<CommunityResponse[]>([]);
  readonly provinces   = signal<ProvinceResponse[]>([]);
  // Mensaje de error en caso de fallo al cargar comunidades o provincias
  readonly errorMessage = signal<string | null>(null);

  
  locationForm = new FormGroup({
    communityName: new FormControl<string | null>(null, Validators.required),
    provinceName:  new FormControl<string | null>({ value: null, disabled: true }, Validators.required),
  });

  /**
   * Al inicializar el componente, cargamos las comunidades autónomas y configuramos la reacción al cambio de comunidad para cargar las provincias correspondientes.
   */
  ngOnInit(): void {
    this.loadCommunities();

    // Cuando cambia la comunidad autónoma, cargamos sus provincias
    this.locationForm.get('communityName')!.valueChanges.subscribe((communityName) => {
      this.onCommunityChange(communityName);
    });
  }

  

  /**
   * Carga todas las comunidades autónomas.
   */
  private loadCommunities(): void {
    this.errorMessage.set(null);

    this.locationService.getAllCommunities().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.communities.set(response.data);
        } else {
          this.errorMessage.set('No se pudieron cargar las comunidades autónomas.');
        }
      },
      error: () => {
        this.errorMessage.set('Error de conexión al cargar las comunidades autónomas.');
      }
    });
  }

  /**
   * Reacciona al cambio de comunidad autónoma:
   * resetea la provincia y carga las provincias de la comunidad seleccionada.
   *
   * @param communityName Nombre de la comunidad seleccionada
   */
  private onCommunityChange(communityName: string | null): void {
    // Resetear provincia y deshabilitar su control
    this.provinces.set([]);
    
    const provinceControl = this.locationForm.get('provinceName')!;
    provinceControl.reset(null);
    provinceControl.disable();

    if (!communityName) return; // Si no hay comunidad seleccionada, no hacemos nada más

    this.errorMessage.set(null);

    this.locationService.getProvincesByCommunity(communityName).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.provinces.set(response.data);
          provinceControl.enable(); // Habilitar solo si hay provincias
        } else {
          this.errorMessage.set('No se pudieron cargar las provincias.');
        }
      },
      error: () => {
        this.errorMessage.set('Error de conexión al cargar las provincias.');
      }
    });
  }

  

  /**
   * Navega a la página de eventos con la provincia seleccionada.
   * La fecha se inyecta automáticamente como la fecha de hoy para que el filtro no falle.
   */
  onSearch(): void {
    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched(); // Muestra los errores de validación visualmente
      return;
    }

    const provinceName: string = this.locationForm.get('provinceName')!.value!;
    const today: string = dateIso(); // Obtenemos la fecha de hoy en formato ISO

    // Navega a /events pasando provincia y fecha como query params
    this.router.navigate(['/events/list'], {
      queryParams: {
        provinceName,
        eventDate: today,
      }
    });
  }



  /**
   * Comprueba si un control tiene un error concreto Y ha sido tocado.
   * Se usa en el HTML para mostrar/ocultar mensajes de error de validación.
   * @param formControlName - Nombre del campo ('communityName', 'provinceName')
   * @param validador - Nombre del error ('required')
   * @returns true si el error está activo y el campo fue tocado
   */
  checkControl(formControlName: string, validador: string): boolean | undefined {
    return this.locationForm.get(formControlName)?.hasError(validador)
        && this.locationForm.get(formControlName)?.touched;
  }

  
}