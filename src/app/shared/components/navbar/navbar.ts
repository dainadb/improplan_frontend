import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { RouterLink} from '@angular/router';
import { HasRoleDirective } from '../../directives/has-role-directive';
import { AuthState } from '../../../core/state/auth.state';
import { AuthService } from '../../../features/auth/services/auth-service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, HasRoleDirective],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  private readonly authState = inject(AuthState);
  private readonly authService = inject(AuthService);
  private readonly elementRef = inject(ElementRef);

  // Signals y computed desde AuthState
  readonly isAuthenticated = this.authState.isAuthenticated;
  readonly currentUser = this.authState.currentUser;

  // Signal local para controlar si el desplegable está abierto
  readonly isDropdownOpen = signal(false);

  // Nombre a mostrar: solo el primer nombre
    readonly displayName = computed(() => {
    const name = this.currentUser()?.name ?? '';
    return name.split(' ')[0]; // "Juan Carlos" → "Juan"
  });

  /**
   * Método para alternar el estado del dropdown al hacer click en el botón de usuario.
   */
  toggleDropdown(): void {
    this.isDropdownOpen.update(open => !open);
  }

  /**
   * Cierra el dropdown. Se llama al hacer click en "Cerrar sesión" o al hacer click fuera del componente.
   */
  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  /**
   * Lógica de cierre de sesión: cierra el dropdown y llama al servicio de autenticación para cerrar sesión.
   */
  logout(): void {
    this.closeDropdown();
    this.authService.logout();
  }

  /**
   * HostListener para detectar clicks fuera del componente y cerrar el dropdown si está abierto.
   * @param event  Evento de click en el documento
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }
}