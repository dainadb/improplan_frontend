import { Component, inject, input } from '@angular/core';
import { EventResponse } from '../../../features/events/models/event-response';
import { Router } from '@angular/router';
import { AuthState } from '../../../core/state/auth.state';
import { CurrencyPipe, NgClass } from '@angular/common';
import { TruncatePipe } from '../../pipes/truncate-pipe';

@Component({
  selector: 'app-event-card',
  imports: [NgClass, CurrencyPipe, TruncatePipe],
  templateUrl: './event-card.html',
  styleUrl: './event-card.css',
})
export class EventCard {


  private readonly router   = inject(Router);
  private readonly authState = inject(AuthState);


  // Evento a mostrar en la tarjeta. Sustituye a @Input
  readonly event = input.required<EventResponse>();

  //Estado local de favorito (de momento en memoria)
  isFavorite = false;


  // Expone isAuthenticated como señal para usarlo en el template 
  readonly isAuthenticated = this.authState.isAuthenticated;

 

  /**
   * Alterna el estado de favorito.
   * Solo se ejecuta si el usuario está autenticado
   * (el botón estará disabled en caso contrario, pero se añade guarda por seguridad).
   */
  toggleFavorite(): void {
    if (!this.isAuthenticated()) return;
    this.isFavorite = !this.isFavorite;
    // TODO: llamar a un FavoritesService para persistir el estado
  }

  /**
   * Navega al detalle del evento.
   */
  goToDetail(): void {
    this.router.navigate(['/events', this.event().id]);
  }
}