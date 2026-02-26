import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EventDateResponse } from '../models/event-date-response';
import { ApiResponse } from '../../../core/models/api-response';
import { Observable } from 'rxjs';

/**
 * Servicio de fechas de eventos.
 * Responsabilidad única: consultar las fechas asociadas a un evento.
 * Todos sus endpoints son públicos (permitAll en SecurityFilterChain).
 * La creación/actualización de fechas se gestiona a través de EventService (createEvent/updateEvent).
 */
@Injectable({
  providedIn: 'root'
})
export class EventDateService {

  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/events';

  /**
   * Obtiene todas las fechas de un evento ordenadas cronológicamente.
   * GET /api/events/{eventId}/dates → público
   *
   * @param eventId ID del evento
   */
  getAllDatesByEventId(eventId: number): Observable<ApiResponse<EventDateResponse[]>> {
    return this.http.get<ApiResponse<EventDateResponse[]>>(`${this.API_URL}/${eventId}/dates`);
  }

  /**
   * Obtiene solo las fechas futuras (desde hoy) de un evento.
   * Útil para mostrar próximas fechas disponibles en la vista de detalle.
   * GET /api/events/{eventId}/dates/upcoming → público
   *
   * @param eventId ID del evento
   */
  getUpcomingDatesByEventId(eventId: number): Observable<ApiResponse<EventDateResponse[]>> {
    return this.http.get<ApiResponse<EventDateResponse[]>>(`${this.API_URL}/${eventId}/dates/upcoming`);
  }
}