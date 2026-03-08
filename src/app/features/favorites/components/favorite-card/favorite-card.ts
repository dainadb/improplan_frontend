import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { FavoriteService } from '../../services/favorite.service';
import { FavoriteResponse } from '../../models/favorite-response';
import { TruncatePipe } from '../../../../shared/pipes/truncate-pipe';
import { CurrencyPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-favorite-card',
  imports: [NgClass, CurrencyPipe, TruncatePipe],
  templateUrl: './favorite-card.html',
  styleUrl: './favorite-card.css',
})
export class FavoriteCard {
   private readonly router          = inject(Router);
  private readonly favoriteService = inject(FavoriteService);

  /** Favorito a mostrar en la tarjeta */
  readonly favorite = input.required<FavoriteResponse>();

  /**
   * Cuando es true (evento caducado), el botón "Ver evento" queda deshabilitado.
   * El corazón / botón de eliminar sigue siendo funcional.
   */
  readonly disableDetail = input<boolean>(false);

  /** Emite el eventId cuando se elimina el favorito, para que el padre actualice su lista */
  readonly favoriteRemoved = output<number>();

  /** Indica si se está procesando la petición de borrado */
  isRemoving = false;

  /**
   * Elimina el favorito llamando al servicio y notifica al componente padre.
   */
  removeFavorite(): void {
    if (this.isRemoving) return;

    this.isRemoving = true;

    this.favoriteService.removeFavorite(this.favorite().eventId).subscribe({
      next: () => {
        this.favoriteRemoved.emit(this.favorite().eventId);
      },
      error: () => {
        this.isRemoving = false;
      },
    });
  }

  /**
   * Navega al detalle del evento.
   * Bloqueado si el evento ha caducado (disableDetail = true).
   */
  goToDetail(): void {
    if (this.disableDetail()) return;
    this.router.navigate(['/events/detail', this.favorite().eventId]);
  }
}