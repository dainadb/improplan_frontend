import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../../../core/models/api-response';
import { UserResponse } from '../../../shared/models/user-response';
import { HttpClient } from '@angular/common/http';
import { AuthState } from '../../../core/state/auth.state';
import { ProfileRequest } from '../models/profile-request';
import { ChangePasswordRequest } from '../models/change-password-request';

/**
 * Servicio de perfil de usuario.
 * Responsabilidad única: gestionar los datos del perfil del usuario autenticado.
 * NO gestiona autenticación (eso es AuthService) ni administración (eso es AdminUserService).

 */
@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private readonly http      = inject(HttpClient);
  private readonly authState = inject(AuthState);

  private readonly AUTH_URL  = 'http://localhost:8080/api/auth';
  private readonly USERS_URL = 'http://localhost:8080/api/users';

  // CONSULTA

  /**
   * Obtiene los datos completos del usuario autenticado desde el backend.
   * Útil para mostrar el perfil con datos actualizados.
   */
  getMe(): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(`${this.AUTH_URL}/me`);
  }

  // ACTUALIZACIÓN

  /**
   * Actualiza el nombre y apellidos del usuario autenticado.
   * Tras la actualización, sincroniza AuthState con los nuevos datos
   * para que currentUser() refleje los cambios en toda la app.
   *
   * @param profileData Nuevos datos del perfil (name, surnames)
   */
  updateProfile(profileData: ProfileRequest): Observable<ApiResponse<UserResponse>> {
     return this.http.put<ApiResponse<UserResponse>>(`${this.USERS_URL}/profile`, profileData)
     .pipe(
      tap(response => {
        if (response.success && response.data) { //si la actualización fue exitosa y el backend devuelve los datos actualizados, se sincroniza AuthState para reflejar los cambios en toda la app.
          //Aquí solo actualizamos el name y surnames. 
          const updatedUser = {
            ...this.authState.currentUser()!,// El operador spread '...' se usa para mantener el resto de los datos del usuario sin cambios.
            name: response.data.name, //se sobreescribe el name con el nuevo valor devuelto por el backend
            surnames: response.data.surnames
          };
          this.authState.saveSession(updatedUser); //Se guarda la sesión con el usuario actualizado, lo que hace que currentUser() se actualice automáticamente en toda la app gracias a la reactividad de AuthState.
        }
      })
    );
  }

  /**
   * Cambia la contraseña del usuario autenticado.
   *
   * @param passwordData Objeto con newPassword y checkedPassword
   */
  changePassword(passwordData: ChangePasswordRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.USERS_URL}/change-password`, passwordData
    );
  }
}
