import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { RegisterRequest } from '../../models/register-request';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register-page.html',
  host: { class: 'w-full flex flex-1' },
  styleUrl: './register-page.css',
})
export class RegisterPage {
 private readonly router      = inject(Router);
  private readonly authService = inject(AuthService);

  errorMessage   = '';
  successMessage = '';

  registerForm = new FormGroup({
    name: new FormControl('', [
                                Validators.required,
                                Validators.minLength(2),
                                Validators.maxLength(50),
                              ]),
    surnames: new FormControl('', [
                                    Validators.required,
                                    Validators.minLength(2),
                                    Validators.maxLength(100),
                                  ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
                                    Validators.required,
                                    Validators.minLength(6),
                                  ]),
  });

  /**
   *  Valida si un control del formulario tiene un error específico y ha sido tocado.
   *  Se utiliza en la plantilla para mostrar mensajes de error debajo de cada campo.
   * @param formControlName El nombre del control en el formulario ('name', 'surnames', 'email', 'password')
   * @param validador El nombre del error a comprobar ('required', 'minlength', 'maxlength', 'email')
   * @returns true si el error está activo y el campo fue tocado
   */
  checkControl(formControlName: string, validador: string): boolean | undefined {
    return (
      this.registerForm.get(formControlName)?.hasError(validador) &&
      this.registerForm.get(formControlName)?.touched
    );
  }

  /**
   *  Se ejecuta al enviar el formulario de registro.
   * Valida, llama al servicio y gestiona la respuesta.
   * @returns 
   */
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorMessage   = '';
    this.successMessage = '';

    this.authService.register(this.registerForm.value as RegisterRequest).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage =
            '¡Cuenta creada correctamente! Redirigiendo al inicio de sesión...';
          setTimeout(() => this.router.navigate(['/auth/login']), 2000);
        } else {
          this.errorMessage = response.message;
        }
      },
      error: () => {
        this.errorMessage = 'Error al registrarse. Inténtalo de nuevo.';
      },
    });
  }

  /**
   * Navega de vuelta a la página de inicio.
   */
  goBack(): void {
    this.router.navigate(['/home']);
  }
}