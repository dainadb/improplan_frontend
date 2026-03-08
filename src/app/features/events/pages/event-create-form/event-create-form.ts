import { Component, inject, OnInit, signal } from '@angular/core';
import { EventService } from '../../services/event.service';
import { LocationService } from '../../../location/services/location-service';
import { ThemeService } from '../../../themes/services/theme.service';
import { CommunityResponse } from '../../../location/models/community-response';
import { ProvinceResponse } from '../../../location/models/province-response';
import { MunicipalityResponse } from '../../../location/models/municipality-response';
import { ThemeResponse } from '../../../themes/models/theme-response';
import { EventRequest } from '../../models/event-request';
import { EventStatusType } from '../../enum/event-status-type';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass, Location } from '@angular/common';

@Component({
  selector: 'app-event-create-form',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './event-create-form.html',
  styleUrl: './event-create-form.css',
})
export class EventCreateForm implements OnInit {


  private readonly eventService    = inject(EventService);
  private readonly locationService = inject(LocationService);
  private readonly themeService    = inject(ThemeService);
  private readonly location        = inject(Location);

  // ── Listas para los selects ──────────────────────────────────────────────
  readonly communities    = signal<CommunityResponse[]>([]);
  readonly provinces      = signal<ProvinceResponse[]>([]);
  readonly municipalities = signal<MunicipalityResponse[]>([]);
  readonly themes         = signal<ThemeResponse[]>([]);

  // ── Estado de los selects en cascada ─────────────────────────────────────
  provincesDisabled      = true;
  municipalitiesDisabled = true;

  // ── Fechas ───────────────────────────────────────────────────────────────
  eventDates: string[] = [''];
  datesError           = '';
  readonly tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  // ── Feedback global ──────────────────────────────────────────────────────
  readonly isSaving       = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage   = signal<string | null>(null);

  // ── FormGroup ────────────────────────────────────────────────────────────
  eventForm = new FormGroup({

    // Sección 1 — Información básica
    name: new FormControl('', [
                                Validators.required,
                                Validators.minLength(3),
                                Validators.maxLength(150),
                              ]),
    image: new FormControl(''),
    themeName: new FormControl('', [Validators.required]),
    infoUrl: new FormControl('', [Validators.pattern('https?://.+'), Validators.required]),
    summary: new FormControl('', [
                                    Validators.required,
                                    Validators.minLength(10),
                                    Validators.maxLength(300),
                                  ]),
    description: new FormControl('', [
                                        Validators.required,
                                        Validators.minLength(20),
                                      ]),
    isFree: new FormControl<boolean>(false),
    price: new FormControl<number>(0, [Validators.min(0.01)]),

    // Sección 2 — Dónde se celebra
    communityName:    new FormControl(''),
    provinceName:     new FormControl({ value: '', disabled: true }),
    municipalityName: new FormControl('', [Validators.required]),
    address: new FormControl('', [
                                    Validators.required,
                                    Validators.minLength(5),
                                  ]),
    placeName: new FormControl('', [
                                      Validators.required,
                                      Validators.minLength(3),
                                    ]),
  });

  // ── Ciclo de vida ────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadCommunities();
    this.loadThemes();

    // Cuando isFree cambia, el validador de price se activa/desactiva
    this.eventForm.get('isFree')!.valueChanges.subscribe(free => {
      const priceControl = this.eventForm.get('price')!;
      if (free) {
        priceControl.clearValidators();
        priceControl.setValue(0);
      } else {
        priceControl.setValidators([Validators.required, Validators.min(0.01)]);
      }
      priceControl.updateValueAndValidity();
    });
  }

  // ── Carga de datos ───────────────────────────────────────────────────────

  private loadCommunities(): void {
    this.locationService.getAllCommunities().subscribe({
      next: (res) => this.communities.set(res.data ?? []),
    });
  }

  private loadThemes(): void {
    this.themeService.getAllThemes().subscribe({
      next: (res) => this.themes.set(res.data ?? []),
    });
  }

  // ── Selectores en cascada ────────────────────────────────────────────────

  onCommunityChange(communityName: string): void {
    this.provinces.set([]);
    this.municipalities.set([]);
    this.provincesDisabled      = true;
    this.municipalitiesDisabled = true;
    this.eventForm.get('provinceName')!.reset({ value: '', disabled: true });
    this.eventForm.get('municipalityName')!.reset('');

    if (!communityName) return;

    this.locationService.getProvincesByCommunity(communityName).subscribe({
      next: (res) => {
        this.provinces.set(res.data ?? []);
        this.provincesDisabled = false;
        this.eventForm.get('provinceName')!.enable();
      },
    });
  }

  onProvinceChange(provinceName: string): void {
    this.municipalities.set([]);
    this.municipalitiesDisabled = true;
    this.eventForm.get('municipalityName')!.reset('');

    if (!provinceName) return;

    this.locationService.getMunicipalitiesByProvince(provinceName).subscribe({
      next: (res) => {
        this.municipalities.set(res.data ?? []);
        this.municipalitiesDisabled = false;
      },
    });
  }

  // ── Gestión de fechas ────────────────────────────────────────────────────

  addDate(): void {
    this.eventDates = [...this.eventDates, ''];
  }

  removeDate(index: number): void {
    if (this.eventDates.length === 1) return;
    this.eventDates = this.eventDates.filter((_, i) => i !== index);
  }

  onDateChange(index: number, value: string): void {
    this.eventDates = this.eventDates.map((d, i) => i === index ? value : d);
    this.datesError = '';
  }

  private buildDates(): string[] {
    return this.eventDates.filter(d => !!d);
  }

  // ── checkControl: mismo patrón que register ──────────────────────────────

  /**
   * Valida si un control tiene un error concreto Y ha sido tocado.
   * @param controlName Nombre del control en el FormGroup
   * @param validator   Nombre del error: 'required' | 'minlength' | 'maxlength' | 'min'
   */
  checkControl(controlName: string, validator: string): boolean | undefined {
    return (
      this.eventForm.get(controlName)?.hasError(validator) &&
      this.eventForm.get(controlName)?.touched
    );
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  onSubmit(): void {

    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.datesError = '';
    if (this.buildDates().length === 0) {
      this.datesError = 'Añade al menos una fecha.';
      return;
    }

    this.isSaving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const request: EventRequest = {
      ...this.eventForm.getRawValue() as unknown as EventRequest,  // todos los campos del form y a continuación los que hay que ajustar
      price:      this.eventForm.get('isFree')?.value ? 0 : (this.eventForm.get('price')?.value ?? 0), // Si isFree es true, price se fuerza a 0
      eventDates: this.buildDates(), // las fechas se gestionan aparte porque no forman parte del FormGroup
      latitude:   0,                         // el backend los calcula
      longitude:  0,
      status:     EventStatusType.PENDING,  // siempre PENDING al crear
    };

    this.eventService.createEvent(request).subscribe({
      next: () => {
        this.successMessage.set('¡Evento enviado correctamente! Será revisado por el equipo.');
        this.isSaving.set(false);
        this.eventForm.reset({ isFree: false, price: 0 });
        this.eventDates = [''];
        this.provinces.set([]);
        this.municipalities.set([]);
        this.provincesDisabled      = true;
        this.municipalitiesDisabled = true;
      },
      error: () => {
        this.errorMessage.set('No se pudo enviar el evento. Inténtalo de nuevo.');
        this.isSaving.set(false);
      },
    });
  }

  // ── Navegación ───────────────────────────────────────────────────────────

  goBack(): void {
    this.location.back();
  }

  onCancel(): void {
    this.location.back();
  }
}