import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EventRequest } from '../../events/models/event-request';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/models/api-response';
import { EventResponse } from '../../events/models/event-response';

/**
 * Servicio de administración de eventos.
 * Responsabilidad única: operaciones HTTP exclusivas del administrador sobre eventos.
 * Endpoints protegidos con ROLE_ADMIN en el backend.
 */
@Injectable({
  providedIn: 'root'
})
export class AdminEventService {

  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/events';

  // Gestión de eventos por parte del admin

  /**
   * Actualiza un evento existente.
   */
  updateEvent(id: number, event: EventRequest): Observable<ApiResponse<EventResponse>> {
    return this.http.put<ApiResponse<EventResponse>>(`${this.API_URL}/update/${id}`, event);
  }

  /**
   * Borrado lógico: cambia el estado del evento a DISCARDED.
   */
  softDeleteEvent(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/softdelete/${id}`);
  }

  /**
   * Borrado físico: elimina permanentemente un evento DISCARDED.
   */
  hardDeleteEvent(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/harddelete/${id}`);
  }

  /**
   * Publica un evento cambiando su estado a PUBLISHED.
   */
  publishEvent(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.API_URL}/publish/${id}`, {});
  }

  // Consultas de eventos por parte del admin

  /**
   * Obtiene eventos vigentes (inTime = true) filtrados por estado.
   */
  getInTimeEventsByStatus(status: 'PENDING' | 'PUBLISHED'): Observable<ApiResponse<EventResponse[]>> {
    const params = new HttpParams().set('status', status);
    return this.http.get<ApiResponse<EventResponse[]>>(`${this.API_URL}/intime/status`, { params });
  }

  /**
   * Obtiene todos los eventos descartados.
   */
  getDiscardedEvents(): Observable<ApiResponse<EventResponse[]>> {
    return this.http.get<ApiResponse<EventResponse[]>>(`${this.API_URL}/discarded`);
  }

  /**
   * Obtiene eventos no descartados que han pasado su fecha (fuera de tiempo).
   */
  getOutTimeEvents(): Observable<ApiResponse<EventResponse[]>> {
    return this.http.get<ApiResponse<EventResponse[]>>(`${this.API_URL}/outtime`);
  }

  /**
   * Obtiene eventos creados por un usuario específico.
   */
  getEventsByUserEmail(email: string): Observable<ApiResponse<EventResponse[]>> {
    return this.http.get<ApiResponse<EventResponse[]>>(`${this.API_URL}/user/${email}`);
  }

  // Conteo de eventos

  /**
   * Obtiene el número de eventos pendientes.
   */
  countPendingEvents(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.API_URL}/count/pending`);
  }

  /**
   * Obtiene el número de eventos descartados.
   */
  countDiscardedEvents(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.API_URL}/count/discarded`);
  }

  /**
   * Obtiene el número de eventos fuera de tiempo.
   */
  countOutTimeEvents(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.API_URL}/count/outtime`);
  }
}