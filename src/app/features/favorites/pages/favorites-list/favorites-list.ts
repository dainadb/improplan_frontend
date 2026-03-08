import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FavoriteService } from '../../services/favorite.service';
import { FavoriteResponse } from '../../models/favorite-response';
import { FavoriteCard } from '../../components/favorite-card/favorite-card';
import { Location } from '@angular/common';

@Component({
  selector: 'app-favorites-list',
  imports: [FavoriteCard],
  templateUrl: './favorites-list.html',
  styleUrl: './favorites-list.css',
})
export class FavoritesList implements OnInit {

  private readonly favoriteService = inject(FavoriteService);
  private readonly location        = inject(Location);

  /** Lista de favoritos cargados desde el backend */
  readonly favorites = signal<FavoriteResponse[]>([]);

  /** Mensaje de error en caso de fallo al cargar */
  readonly error = signal<string | null>(null);

  /** Estado de carga inicial */
  readonly isLoading = signal(true);

  ngOnInit(): void {
    this.loadFavorites();
  }

  /**
   * Carga los favoritos del usuario autenticado.
   */
  loadFavorites(): void {
    this.error.set(null);
    this.isLoading.set(true);

    this.favoriteService.getMyFavorites().subscribe({
      next: (res) => {
        this.favorites.set(res.data ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus favoritos. Inténtalo de nuevo.');
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Elimina un favorito de la lista local cuando el hijo emite el evento.
   */
  onFavoriteRemoved(eventId: number): void {
    this.favorites.update(list => list.filter(f => f.eventId !== eventId));
  }

  /**
   * Separa los favoritos vigentes de los caducados.
   * Los vigentes van primero; los caducados al final.
   */
  readonly sortedFavorites = computed(() => [
    ...this.favorites().filter(f =>  f.eventInTime),
    ...this.favorites().filter(f => !f.eventInTime),
  ]);

  /** Vuelve a la página anterior */
  goBack(): void {
    this.location.back();
  }
}