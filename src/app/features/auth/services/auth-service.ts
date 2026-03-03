import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { finalize, Observable, tap} from 'rxjs';
import { LoginResponse } from '../models/login-response';
import { LoginRequest } from '../models/login-request';
import { ApiResponse } from '../../../core/models/api-response';
import { RegisterRequest } from '../models/register-request';
import { UserResponse } from '../../../shared/models/user-response';
import { AuthState } from '../../../core/state/auth.state';

/**
 * Servicio de autenticación.
 * Responsabilidad única: comunicación HTTP con el backend de auth.
 * Delega la gestión del estado a AuthState.
 */
@Injectable({
  providedIn: 'root',
})

export class AuthService {

   private readonly http = inject(HttpClient);
    private readonly authState = inject(AuthState);

  //CONSTANTES:
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private readonly BASIC_AUTH_KEY = 'basicAuth';
  /**
   * Inicia sesión con email y contraseña.
   * Delega el guardado de sesión a AuthState.
   */
  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => { // Tap permite ejecutar una acción secundaria (guardar datos, logs,etc) sin alterar el valor de los datos
        if (response.success && response.data) { // Si la respuesta del back es exitosa y contiene datos,  
          
          const basicAuthToken = btoa(`${credentials.email}:${credentials.password}`); // primero se genera el token de autenticación en formato Basic (base64 de "email:password") con las credenciales facilitadas y se guarda en localStorage con la clave 'basicAuth'.
          localStorage.setItem(this.BASIC_AUTH_KEY, basicAuthToken);
          
          this.authState.saveSession(response.data); //Luego, se delega a AuthState la gestión del estado del usuario autenticado, pasando los datos recibidos del backend y se guarda en localStorage con la clave 'currentUser' para mantener la sesión activa incluso al recargar la página.
        }
      })
    );
  }
  

  /**
   * Registra un nuevo usuario en el sistema.
   * @param userData Datos del nuevo usuario
   * @returns Observable con los datos del usuario creado
   */
  register(userData: RegisterRequest): Observable<ApiResponse<UserResponse>> {
    return this.http.post<ApiResponse<UserResponse>>(`${this.API_URL}/register`, userData);
  }

  /**
   * Cierra la sesión del usuario actual.
   * Limpia el estado reactivo, el localStorage y redirige al login.
   */
  logout(): void {
    this.http.post(`${this.API_URL}/logout`, {})
    .pipe(
      finalize(() => this.authState.clearSession()) // Con finalize se ejecuta siempre (éxito o error)
    ).subscribe();
  }
  
}
