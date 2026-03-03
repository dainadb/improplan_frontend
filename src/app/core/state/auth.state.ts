import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoginResponse } from '../../features/auth/models/login-response';


/**
 * Servicio de estado de autenticación.
 * Responsabilidad única: mantener y exponer el estado del usuario autenticado.
 * NO hace llamadas HTTP.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthState {

  private readonly router = inject(Router);
  private readonly STORAGE_KEY = 'currentUser';

  // SIGNAL:  Cuando su valor cambia, Angular notifica automáticamente a todos los componentes que lo están usando para que se actualicen.
  
  private readonly _currentUser = signal<LoginResponse | null>(this.loadUserFromStorage()); // Es un signal que puede contener un LoginResponse o null.
  //Se inicializa con el valor que devuelve loadUserFromStorage(), que intenta cargar el usuario desde localStorage al iniciar la aplicación.

  readonly currentUser = this._currentUser.asReadonly(); // Esta variable expone el valor de _currentUser (la información del usuario en formato LoginResponse), pero solo en formato lectura. Los componentes pueden acceder a currentUser para obtener los datos del usuario, pero no pueden modificarlo directamente. 

  readonly isAuthenticated = computed(() => this._currentUser() !== null); // Devuelve true si hay un usuario autenticado (es decir, si _currentUser no es null) y false si no hay sesión activa.

  readonly userRoles = computed(() => this._currentUser()?.roles ?? []); // Computed: se recalcula automáticamente cuando _currentUser cambia, y devuelve los roles del usuario o un array vacío si no hay usuario
  //El primer '?' indica que solo se accederá a .roles si el valor no es null/undefined. EL '?? []'  indica que si el valor de userRoles es null o undefined, se devolverá un array vacío en su lugar.

  
  //MÉTODOS PÚBLICOS:
  
  /**
   * Guarda la sesión en localStorage y actualiza la signal.
   * Esto permite que el estado de autenticación persista y esté disponible para otros componentes de la aplicación.
   * @param user Datos del usuario autenticado
   */
  saveSession(user: LoginResponse): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this._currentUser.set(user);
  }

  /**
   * Limpia la sesión del localStorage, resetea el estado y redirige al login.
   */
  clearSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Comprueba si el usuario actual tiene un rol específico.
   * @param role Rol a verificar (ej: 'ROLE_ADMIN')
   * @returns true si el usuario tiene el rol
   */
  hasRole(role: string): boolean {
    return this.userRoles().includes(role);
  }


  
  // MÉTODOS PRIVADOS:

  /**
   * Intenta recuperar el usuario almacenado en localStorage al iniciar.
   * Si las credenciales son válidas, devuelve un LoginResponse con los datos del usuario.
   * Si no hay credenciales o son inválidas, devuelve null.
   * Permite mantener la sesión tras una recarga de página.
   */
  private loadUserFromStorage(): LoginResponse | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;// Si no hay nada guardado, devolvemos null
      
      return JSON.parse(stored) as LoginResponse; // Convertimos el contenido de stored ,que está en formato JSON, a un objeto LoginResponse
    } catch { // Si hay un error (e.g., JSON mal formado), limpiamos el almacenamiento y devolvemos null
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }
}

