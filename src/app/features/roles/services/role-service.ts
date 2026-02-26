import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RoleResponse } from '../models/role-response';
import { ApiResponse } from '../../../core/models/api-response';
import { Observable } from 'rxjs';

/**
 * Servicio de roles.
 * Responsabilidad única: consultar los roles disponibles en el sistema.
 * Es de solo lectura: los roles se cargan en BBDD previamente, no tienen CRUD desde la aplicación.
 */
@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/roles';

  /**
   * Obtiene la lista completa de roles del sistema.
   * Actualmente solo existen: ROLE_USER y ROLE_ADMIN.
   * GET /api/roles → público
   */
  getAllRoles(): Observable<ApiResponse<RoleResponse[]>> {
    return this.http.get<ApiResponse<RoleResponse[]>>(this.API_URL);
  }

  /**
   * Obtiene un rol por su ID.
   * GET /api/roles/{id} → público
   *
   * @param id ID del rol
   */
  getRoleById(id: number): Observable<ApiResponse<RoleResponse>> {
    return this.http.get<ApiResponse<RoleResponse>>(`${this.API_URL}/${id}`);
  }
}