import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../../../core/models/api-response';
import { FavoriteResponse } from '../models/favorite-response';
import { Observable } from 'rxjs';
import { FavoriteRequest } from '../models/favorite-request';

/**
 * Servicio de favoritos.
 * Responsabilidad única: gestión completa de los favoritos del usuario autenticado.
 */
@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/favorites';

  
  // ENDPOINTS PARA USUARIOS AUTENTICADOS

  /**
   * Añade un evento a la lista de favoritos del usuario autenticado.
   * El backend obtiene el usuario del contexto de seguridad (Authentication).
   *
   * @param request Objeto con el eventId a añadir
   */
  addFavorite(request: FavoriteRequest): Observable<ApiResponse<FavoriteResponse>> {
    return this.http.post<ApiResponse<FavoriteResponse>>(`${this.API_URL}/add`, request);
  }

  /**
   * Elimina un evento de la lista de favoritos del usuario autenticado.
   *
   * @param eventId ID del evento a eliminar de favoritos
   */
  removeFavorite(eventId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/delete/${eventId}`);
  }

  /**
   * Obtiene la lista completa de favoritos del usuario autenticado.
   * Devuelve FavoriteResponse con datos enriquecidos del evento (nombre, precio, tema...).
   */
  getMyFavorites(): Observable<ApiResponse<FavoriteResponse[]>> {
    return this.http.get<ApiResponse<FavoriteResponse[]>>(`${this.API_URL}/my-favorites`);
  }

  // ENDPOINTS PÚBLICOS

  /**
   * Obtiene el número de veces que un evento ha sido marcado como favorito.
   * Útil para mostrar el contador de favoritos en la vista pública del evento.
   *
   * @param eventId ID del evento
   */
  countFavoritesByEvent(eventId: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.API_URL}/count/${eventId}`);
  }
}