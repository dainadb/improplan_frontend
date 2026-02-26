import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserResponse } from '../../../shared/models/user-response';
import { ApiResponse } from '../../../core/models/api-response';
import { Observable } from 'rxjs';

/**
 * Servicio de administración de usuarios.
 * Responsabilidad única: operaciones HTTP exclusivas del administrador sobre usuarios.
 * Endpoints protegidos con ROLE_ADMIN en el backend.
 */
@Injectable({
  providedIn: 'root'
})
export class AdminUserService {

  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/users';

  // Consultas de usuarios por parte del admin

  /**
   * Obtiene la lista completa de usuarios.
   */
  getAllUsers(): Observable<ApiResponse<UserResponse[]>> {
    return this.http.get<ApiResponse<UserResponse[]>>(this.API_URL);
  }

  /**
   * Obtiene un usuario por su ID.
   */
  getUserById(id: number): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(`${this.API_URL}/${id}`);
  }

  /**
   * Obtiene un usuario por su email.
   */
  getUserByEmail(email: string): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(`${this.API_URL}/email/${email}`);
  }

  /**
   * Filtra usuarios por rol.
   */
  getUsersByRole(roleName: 'ROLE_ADMIN' | 'ROLE_USER'): Observable<ApiResponse<UserResponse[]>> {
    const params = new HttpParams().set('roleName', roleName);
    return this.http.get<ApiResponse<UserResponse[]>>(`${this.API_URL}/by-role`, { params });
  }

  /**
   * Filtra usuarios por estado de habilitación.
   */
  getUsersByEnabled(enabled: boolean): Observable<ApiResponse<UserResponse[]>> {
    const params = new HttpParams().set('enabled', enabled);
    return this.http.get<ApiResponse<UserResponse[]>>(`${this.API_URL}/by-enabled`, { params });
  }

  // Modificaciones de usuarios por parte del admin

  /**
   * Habilita la cuenta de un usuario.
   */
  enableUser(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.API_URL}/${id}/enable`, {});
  }

  /**
   * Deshabilita la cuenta de un usuario.
   */
  disableUser(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.API_URL}/${id}/disable`, {});
  }

  /**
   * Intercambia el rol del usuario (ROLE_USER ↔ ROLE_ADMIN).
   */
  exchangeRole(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.API_URL}/${id}/exchange-role`, {});
  }
}