import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ThemeResponse } from '../models/theme-response';
import { ApiResponse } from '../../../core/models/api-response';
import { Observable } from 'rxjs';

/**
 * Servicio de temáticas.
 * Responsabilidad única: consultar las temáticas disponibles en el sistema.
 * Es de solo lectura: las temáticas se cargan en BBDD previamente,no tienen CRUD desde la aplicación.
 *
 * Uso principal: poblar el selector de temáticas en el formulario
 * de búsqueda y en el formulario de creación de eventos.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/themes';

  /**
   * Obtiene la lista completa de temáticas disponibles.
   */
  getAllThemes(): Observable<ApiResponse<ThemeResponse[]>> {
    return this.http.get<ApiResponse<ThemeResponse[]>>(this.API_URL);
  }

  /**
   * Obtiene una temática por su ID.
   *
   * @param id ID de la temática
   */
  getThemeById(id: number): Observable<ApiResponse<ThemeResponse>> {
    return this.http.get<ApiResponse<ThemeResponse>>(`${this.API_URL}/${id}`);
  }

  /**
   * Obtiene una temática por su nombre (case-insensitive en el backend).
   *
   * @param name Nombre de la temática (ej: 'Música', 'Deporte')
   */
  getThemeByName(name: string): Observable<ApiResponse<ThemeResponse>> {
    const params = new HttpParams().set('name', name);
    return this.http.get<ApiResponse<ThemeResponse>>(`${this.API_URL}/by-name`, { params });
  }
}