import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { EventService } from '../../services/event.service';
import { AuthState } from '../../../../core/state/auth.state';
import { EventResponse } from '../../models/event-response';
import { CurrencyPipe, DatePipe, NgClass,Location } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FavoriteService } from '../../../favorites/services/favorite.service';

@Component({
  selector: 'app-event-detail-page',
  imports: [NgClass, CurrencyPipe, DatePipe],
  templateUrl: './event-detail-page.html',
  styleUrl: './event-detail-page.css',
})
export class EventDetailPage implements OnInit {
 // ── Inyecciones ──────────────────────────────────────────────────────────
  private readonly route           = inject(ActivatedRoute);
  private readonly eventSvc        = inject(EventService);
  private readonly authState       = inject(AuthState);
  private readonly favoriteService = inject(FavoriteService);
  private readonly location        = inject(Location);
  private readonly sanitizer       = inject(DomSanitizer);

  // ── Constante ────────────────────────────────────────────────────────────
  readonly MAX_VISIBLE_DATES = 4;

  // ── Estado ───────────────────────────────────────────────────────────────
  readonly event = signal<EventResponse | null>(null);
  readonly error = signal<string | null>(null);

  isFavorite         = false;
  isTogglingFavorite = false;
  showAllDates       = false;

  // ── Señales derivadas ────────────────────────────────────────────────────

  readonly isAuthenticated = this.authState.isAuthenticated;

  readonly safeInfoUrl = computed<SafeUrl>(() => {
    const url = this.event()?.infoUrl;
    if (!url) return '#';
    return this.sanitizer.bypassSecurityTrustUrl(url);
  });

  readonly upcomingDates = computed<string[]>(() => {
    const today = new Date().toISOString().split('T')[0];
    return (this.event()?.eventDates ?? [])
      .filter(d => d >= today)
      .sort((a, b) => a.localeCompare(b));
  });

  readonly visibleDates = computed<string[]>(() =>
    this.showAllDates
      ? this.upcomingDates()
      : this.upcomingDates().slice(0, this.MAX_VISIBLE_DATES)
  );

  readonly googleMapsUrl = computed<string>(() => {
    const ev = this.event();
    if (!ev) return '#';
    const query = encodeURIComponent(`${ev.address}, ${ev.municipalityName}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  });

  // ── Ciclo de vida ────────────────────────────────────────────────────────

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || Number.isNaN(id)) {
      this.error.set('El identificador del evento no es válido.');
      return;
    }

    // 1. Cargamos el evento
    this.eventSvc.getEventById(id).subscribe({
      next: (res) => {
        this.event.set(res.data);
        // 2. Una vez cargado el evento, sincronizamos el estado de favorito
        this.syncFavoriteState(id);
      },
      error: () => this.error.set('No se pudo cargar el evento. Por favor, inténtalo de nuevo.'),
    });
  }

  // ── Métodos privados ──────────────────────────────────────────��──────────

  /**
   * Consulta si el evento ya está en los favoritos del usuario autenticado
   * y actualiza el estado local.
   */
  private syncFavoriteState(eventId: number): void {
    if (!this.isAuthenticated()) return;

    this.favoriteService.getMyFavorites().subscribe({
      next: (res) => {
        const favorites = res.data ?? [];
        this.isFavorite = favorites.some(f => f.eventId === eventId);
      },
    });
  }

  // ── Acciones ─────────────────────────────────────────────────────────────

  goBack(): void {
    this.location.back();
  }

  toggleDates(): void {
    this.showAllDates = !this.showAllDates;
  }

  /**
   * Alterna el estado de favorito llamando al backend.
   * Bloquea dobles clics con isTogglingFavorite.
   */
  toggleFavorite(): void {
    if (!this.isAuthenticated() || this.isTogglingFavorite) return;

    this.isTogglingFavorite = true;
    const eventId = this.event()!.id;

    if (this.isFavorite) {
      this.favoriteService.removeFavorite(eventId).subscribe({
        next: () => {
          this.isFavorite = false;
          this.isTogglingFavorite = false;
        },
        error: () => {
          this.isTogglingFavorite = false;
        },
      });
    } else {
      this.favoriteService.addFavorite({ eventId }).subscribe({
        next: () => {
          this.isFavorite = true;
          this.isTogglingFavorite = false;
        },
        error: () => {
          this.isTogglingFavorite = false;
        },
      });
    }
  }
}