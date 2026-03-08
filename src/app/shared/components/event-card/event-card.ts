import { Component, inject, input, OnInit } from '@angular/core';
import { EventResponse } from '../../../features/events/models/event-response';
import { Router } from '@angular/router';
import { AuthState } from '../../../core/state/auth.state';
import { CurrencyPipe, NgClass } from '@angular/common';
import { TruncatePipe } from '../../pipes/truncate-pipe';
import { FavoriteService } from '../../../features/favorites/services/favorite.service';

@Component({
  selector: 'app-event-card',
  imports: [NgClass, CurrencyPipe, TruncatePipe],
  templateUrl: './event-card.html',
  styleUrl: './event-card.css',
})
export class EventCard implements OnInit {

  private readonly router          = inject(Router);
  private readonly authState       = inject(AuthState);
  private readonly favoriteService = inject(FavoriteService);

  /** Evento a mostrar en la tarjeta */
  readonly event = input.required<EventResponse>();

  /** Estado real de favorito sincronizado con el backend */
  isFavorite  = false;

  /** Bloquea dobles clics mientras hay una petición en curso */
  isTogglingFavorite = false;

  /** Expone isAuthenticated como señal para usarlo en el template */
  readonly isAuthenticated = this.authState.isAuthenticated;

  ngOnInit(): void {
    // Solo consultamos el estado inicial si el usuario está autenticado
    if (!this.isAuthenticated()) return;

    this.favoriteService.countFavoritesByEvent(this.event().id).subscribe({
      // countFavoritesByEvent nos da el total global, no si el usuario actual lo tiene.
      // Usamos getMyFavorites para buscar si el evento ya está en la lista del usuario.
    });

    this.syncFavoriteState();
  }

  /**
   * Consulta si el evento ya está en la lista de favoritos del usuario
   * y actualiza el estado local en consecuencia.
   */
  private syncFavoriteState(): void {
    if (!this.isAuthenticated()) return;

    this.favoriteService.getMyFavorites().subscribe({
      next: (res) => {
        const favorites = res.data ?? [];
        this.isFavorite = favorites.some(f => f.eventId === this.event().id);
      },
      // Si falla, dejamos isFavorite = false sin mostrar error al usuario
    });
  }

  /**
   * Alterna el estado de favorito llamando al backend.
   * Actualiza el estado local de forma optimista para feedback inmediato.
   */
  toggleFavorite(): void {
    if (!this.isAuthenticated() || this.isTogglingFavorite) return;

    this.isTogglingFavorite = true;

    if (this.isFavorite) {
      // — Quitar de favoritos —
      this.favoriteService.removeFavorite(this.event().id).subscribe({
        next: () => {
          this.isFavorite = false;
          this.isTogglingFavorite = false;
        },
        error: () => {
          this.isTogglingFavorite = false;
        },
      });
    } else {
      // — Añadir a favoritos —
      this.favoriteService.addFavorite({ eventId: this.event().id }).subscribe({
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

  /** Navega al detalle del evento */
  goToDetail(): void {
    this.router.navigate(['/events/detail', this.event().id]);
  }
}