import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EventResponse } from '../models/event-response';
import { ApiResponse } from '../../../core/models/api-response';
import { Observable } from 'rxjs';
import { EventRequest } from '../models/event-request';

/**
 * Servicio de eventos para usuarios autenticados y público.
 * Responsabilidad única: operaciones HTTP sobre eventos NO exclusivas de admin.
 */
@Injectable({
  providedIn: 'root'
})
export class EventService {

  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/events';

  
  //ENDPOINTS PÚBLICOS

  /**
   * Obtiene un evento por su ID.
   */
  getEventById(id: number): Observable<ApiResponse<EventResponse>> {
    return this.http.get<ApiResponse<EventResponse>>(`${this.API_URL}/${id}`);
  }

  /**
   * Búsqueda avanzada de eventos publicados y vigentes con filtros opcionales.
   *
   * @param provinceName     Provincia (obligatorio)
   * @param eventDate        Fecha del evento en formato 'YYYY-MM-DD' (obligatorio)
   * @param themeName        Temática (opcional)
   * @param municipalityName Municipio (opcional)
   * @param maxPrice         Precio máximo (opcional)
   */
  searchPublishedEvents(
    provinceName: string,
    eventDate: string,
    themeName?: string, // el interrogante indica que es opcional
    municipalityName?: string,
    maxPrice?: number
  ): Observable<ApiResponse<EventResponse[]>> {

    // HttpParams construye los query params de forma segura
    // Solo añadimos los opcionales si tienen valor
    let params = new HttpParams()
      .set('provinceName', provinceName)
      .set('eventDate', eventDate);

    if (themeName)        params = params.set('themeName', themeName); // si
    if (municipalityName) params = params.set('municipalityName', municipalityName);
    if (maxPrice != null) params = params.set('maxPrice', maxPrice); // maxPrice puede ser 0, por eso se verifica con != null

    return this.http.get<ApiResponse<EventResponse[]>>(`${this.API_URL}/filters`, { params });
  }

  //ENDPOINTS PARA USUARIOS AUTENTICADOS 
  /**
   * Crea un nuevo evento. El backend asigna el usuario autenticado como creador.
   * El evento se crea con estado PENDING hasta que un admin lo revise.
   */
  createEvent(event: EventRequest): Observable<ApiResponse<EventResponse>> {
    return this.http.post<ApiResponse<EventResponse>>(`${this.API_URL}/create`, event);
  }

 

  /**
   * Obtiene los eventos creados por el usuario autenticado.
   * @param email Email del usuario autenticado (se obtendrá de AuthState)
   */
  getMyEvents(email: string): Observable<ApiResponse<EventResponse[]>> {
    return this.http.get<ApiResponse<EventResponse[]>>(`${this.API_URL}/user/${email}`);
  }
}