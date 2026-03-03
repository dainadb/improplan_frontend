import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginRequest } from '../../models/login-request';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
 
  private readonly router      = inject(Router);
  private readonly authService = inject(AuthService);

  errorMessage = ''; // Mensaje de error para mostrar en la UI si el login falla

 
  loginForm = new FormGroup({
    email:    new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  /**
   * Comprueba si un control tiene un error concreto Y ha sido tocado.
   * Se usa en el HTML para mostrar/ocultar mensajes de error de validación.
   * @param formControlName - Nombre del campo ('email', 'password')
   * @param validador - Nombre del error ('required', 'email', 'minlength')
   * @returns true si el error está activo y el campo fue tocado
   */
  checkControl(formControlName: string, validador: string): boolean | undefined {
    return this.loginForm.get(formControlName)?.hasError(validador)
            && this.loginForm.get(formControlName)?.touched;
  }

  /**
   * Se ejecuta al enviar el formulario.
   * Valida, llama al servicio y gestiona la respuesta.
   */
  onSubmit(): void {

    // Si el formulario es inválido pero el usuario ha ido directamente a "Entrar" sin tocar los campos, Con markAllAsTouched()marcamos todo como tocado para mostrar los errores.
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); //
      return;
    }

    this.errorMessage = '';

    this.authService.login(this.loginForm.value as LoginRequest).subscribe({

      next: (response) => {
        // El servidor respondió, pero puede ser éxito o fallo lógico
        if (response.success) {
          this.router.navigate(['/home']);
        } else {
          // El backend devuelve success= false y un mensaje de error 
          this.errorMessage = response.message;
        }
      },

      error: () => {
        // Error de red o servidor (no se recibió respuesta o hubo un error HTTP)
        this.errorMessage = 'Error al iniciar sesión. Inténtalo de nuevo.';
      }
    });
  }

  /**
   * Navega de vuelta a la página de inicio.
   */
  goBack(): void {
    this.router.navigate(['/home']);
  }
}